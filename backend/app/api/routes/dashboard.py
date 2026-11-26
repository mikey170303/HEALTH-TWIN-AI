from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import (
    User, HealthRecord, UserProfile, HealthGoal, PredictionRecord, Recommendation
)
from app.api.deps import get_current_user

router = APIRouter()

def compute_bmi(height_cm: Optional[float], weight_kg: Optional[float]) -> Optional[Dict[str, Any]]:
    if not height_cm or not weight_kg or height_cm <= 0 or weight_kg <= 0:
        return None
    h_m = height_cm / 100.0
    bmi = round(weight_kg / (h_m * h_m), 1)
    if bmi < 18.5:
        category = "Underweight"
        color = "blue"
    elif bmi < 25.0:
        category = "Normal"
        color = "emerald"
    elif bmi < 30.0:
        category = "Overweight"
        color = "amber"
    else:
        category = "Obese"
        color = "rose"
    return {
        "value": bmi,
        "category": category,
        "color": color,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "explanation": "BMI is a population screening indicator of mass-to-height ratio, not a diagnostic measure of body composition."
    }

@router.get("/dashboard")
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(HealthRecord).filter(
        HealthRecord.user_id == current_user.id
    ).order_by(HealthRecord.recorded_at.desc()).all()

    # Organize latest measurements
    types = ["weight", "heart_rate", "blood_pressure", "sleep_duration", "step_count", "blood_glucose"]
    latest_measurements = {}
    sparklines = {}

    for t in types:
        matching = [r for r in records if r.record_type == t]
        if matching:
            lat = matching[0]
            latest_measurements[t] = {
                "id": lat.id,
                "value_primary": lat.value_primary,
                "value_secondary": lat.value_secondary,
                "unit": lat.unit,
                "recorded_at": lat.recorded_at.isoformat(),
                "notes": lat.notes
            }
            # Sparkline points (chronological order)
            pts = list(reversed(matching[:10]))
            sparklines[t] = [
                {
                    "date": p.recorded_at.strftime("%m/%d"),
                    "value": p.value_primary,
                    "value_sec": p.value_secondary
                }
                for p in pts
            ]
        else:
            latest_measurements[t] = None
            sparklines[t] = []

    # Calculate BMI
    bmi_info = None
    w = latest_measurements["weight"]["value_primary"] if latest_measurements["weight"] else (profile.current_weight_kg if profile else None)
    h = profile.height_cm if profile else None
    if not h:
        h_rec = [r for r in records if r.record_type == "height"]
        if h_rec:
            h = h_rec[0].value_primary
    bmi_info = compute_bmi(h, w)

    # Active Goals
    goals = db.query(HealthGoal).filter(
        HealthGoal.user_id == current_user.id,
        HealthGoal.status == "active"
    ).order_by(HealthGoal.created_at.desc()).limit(5).all()

    goal_list = []
    for g in goals:
        pct = round(min(100.0, max(0.0, (g.current_progress / g.target_value) * 100.0)), 1) if g.target_value > 0 else 0
        goal_list.append({
            "id": g.id,
            "title": g.title,
            "category": g.category,
            "target_value": g.target_value,
            "current_progress": g.current_progress,
            "unit": g.unit,
            "progress_percentage": pct,
            "target_date": g.target_date.isoformat() if g.target_date else None
        })

    # Recent Recommendations
    recs = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id,
        Recommendation.is_dismissed == False
    ).order_by(Recommendation.created_at.desc()).limit(4).all()

    rec_list = [
        {
            "id": r.id,
            "title": r.title,
            "explanation": r.explanation,
            "reason": r.reason,
            "category": r.category,
            "action_text": r.action_text,
            "priority": r.priority,
            "is_completed": r.is_completed,
            "is_saved": r.is_saved
        }
        for r in recs
    ]

    # Active Predictions
    preds = db.query(PredictionRecord).filter(
        PredictionRecord.user_id == current_user.id
    ).order_by(PredictionRecord.created_at.desc()).limit(3).all()

    pred_list = [
        {
            "id": p.id,
            "prediction_type": p.prediction_type,
            "current_value": p.current_value,
            "predicted_value": p.predicted_value,
            "horizon_days": p.horizon_days,
            "confidence_score": p.confidence_score,
            "risk_level": p.risk_level,
            "model_version": p.model_version,
            "factors": p.factors_json,
            "limitations": p.limitations_text,
            "created_at": p.created_at.isoformat()
        }
        for p in preds
    ]

    # Recent records
    recent_records_list = [
        {
            "id": r.id,
            "record_type": r.record_type,
            "value_primary": r.value_primary,
            "value_secondary": r.value_secondary,
            "unit": r.unit,
            "recorded_at": r.recorded_at.isoformat(),
            "notes": r.notes
        }
        for r in records[:8]
    ]

    return {
        "user_name": current_user.full_name,
        "latest_measurements": latest_measurements,
        "bmi_summary": bmi_info,
        "active_goals": goal_list,
        "recent_recommendations": rec_list,
        "active_predictions": pred_list,
        "recent_records": recent_records_list,
        "sparklines": sparklines,
        "total_observations_count": len(records)
    }


@router.get("/analytics/trends")
def get_analytics_trends(
    record_type: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_dt = datetime.utcnow() - timedelta(days=days)
    query = db.query(HealthRecord).filter(
        HealthRecord.user_id == current_user.id,
        HealthRecord.recorded_at >= start_dt
    )
    if record_type:
        query = query.filter(HealthRecord.record_type == record_type.lower())

    records = query.order_by(HealthRecord.recorded_at.asc()).all()

    # Group by record type
    series_by_type: Dict[str, List[Dict[str, Any]]] = {}
    for r in records:
        rt = r.record_type
        if rt not in series_by_type:
            series_by_type[rt] = []
        series_by_type[rt].append({
            "id": r.id,
            "date": r.recorded_at.strftime("%Y-%m-%d %H:%M"),
            "timestamp": r.recorded_at.isoformat(),
            "value": r.value_primary,
            "value_secondary": r.value_secondary,
            "unit": r.unit,
            "notes": r.notes
        })

    return {
        "timeframe_days": days,
        "series": series_by_type,
        "record_count": len(records)
    }


@router.get("/analytics/summary")
def get_analytics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(HealthRecord).filter(
        HealthRecord.user_id == current_user.id
    ).all()

    stats: Dict[str, Dict[str, Any]] = {}
    for r in records:
        rt = r.record_type
        if rt not in stats:
            stats[rt] = {
                "count": 0,
                "values": [],
                "sec_values": [],
                "unit": r.unit
            }
        stats[rt]["count"] += 1
        stats[rt]["values"].append(r.value_primary)
        if r.value_secondary:
            stats[rt]["sec_values"].append(r.value_secondary)

    summaries = {}
    for rt, data in stats.items():
        vals = data["values"]
        summaries[rt] = {
            "count": data["count"],
            "unit": data["unit"],
            "latest": round(vals[-1], 1) if vals else None,
            "average": round(sum(vals) / len(vals), 1) if vals else None,
            "min": round(min(vals), 1) if vals else None,
            "max": round(max(vals), 1) if vals else None,
            "avg_secondary": round(sum(data["sec_values"]) / len(data["sec_values"]), 1) if data["sec_values"] else None
        }

    return summaries
