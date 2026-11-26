from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import User, PredictionRecord, HealthRecord, UserProfile
from app.schemas.api_schemas import PredictionRequest, PredictionResponse
from app.ml.inference import ml_engine
from app.api.deps import get_current_user

router = APIRouter()

@router.post("", response_model=PredictionResponse)
def generate_prediction(
    req: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(HealthRecord).filter(
        HealthRecord.user_id == current_user.id
    ).order_by(HealthRecord.recorded_at.desc()).all()

    ptype = req.prediction_type.lower()
    
    if ptype == "weight_forecast":
        result = ml_engine.forecast_weight_trend(records, horizon_days=req.horizon_days or 30)
        if not result.get("available"):
            raise HTTPException(status_code=400, detail=result.get("reason"))

        pred_rec = PredictionRecord(
            user_id=current_user.id,
            prediction_type="weight_forecast",
            current_value=result.get("current_value"),
            predicted_value=result.get("predicted_value"),
            horizon_days=result.get("horizon_days", 30),
            confidence_score=result.get("confidence_score"),
            risk_level=result.get("trend_direction"),
            model_version=result.get("model_version", "1.1.0"),
            factors_json={"rate_per_week_kg": result.get("rate_per_week_kg")},
            limitations_text=result.get("limitations")
        )
        db.add(pred_rec)
        db.commit()
        db.refresh(pred_rec)

        return {
            "id": pred_rec.id,
            "prediction_type": "weight_forecast",
            "current_value": pred_rec.current_value,
            "predicted_value": pred_rec.predicted_value,
            "horizon_days": pred_rec.horizon_days,
            "confidence_score": pred_rec.confidence_score,
            "risk_level": pred_rec.risk_level,
            "model_version": pred_rec.model_version,
            "factors": pred_rec.factors_json,
            "limitations": pred_rec.limitations_text,
            "created_at": pred_rec.created_at,
            "forecast_points": result.get("forecast_points")
        }

    elif ptype == "cvd_risk_assessment":
        result = ml_engine.predict_cvd_risk(profile, records)
        if not result.get("available"):
            raise HTTPException(status_code=400, detail=result.get("reason"))

        pred_rec = PredictionRecord(
            user_id=current_user.id,
            prediction_type="cvd_risk_assessment",
            current_value=result.get("predicted_probability"),
            predicted_value=result.get("predicted_probability"),
            horizon_days=3650, # 10-year projection
            confidence_score=result.get("confidence_score"),
            risk_level=result.get("risk_level"),
            model_version=result.get("model_version", "1.2.0"),
            factors_json=result.get("factors"),
            limitations_text=result.get("limitations")
        )
        db.add(pred_rec)
        db.commit()
        db.refresh(pred_rec)

        return {
            "id": pred_rec.id,
            "prediction_type": "cvd_risk_assessment",
            "current_value": pred_rec.current_value,
            "predicted_value": pred_rec.predicted_value,
            "horizon_days": pred_rec.horizon_days,
            "confidence_score": pred_rec.confidence_score,
            "risk_level": pred_rec.risk_level,
            "model_version": pred_rec.model_version,
            "factors": pred_rec.factors_json,
            "limitations": pred_rec.limitations_text,
            "created_at": pred_rec.created_at,
            "forecast_points": None
        }

    elif ptype == "anomaly_detection":
        result = ml_engine.detect_biometric_anomalies(records)
        pred_rec = PredictionRecord(
            user_id=current_user.id,
            prediction_type="anomaly_detection",
            current_value=float(result.get("anomaly_count", 0)),
            predicted_value=float(result.get("anomaly_count", 0)),
            horizon_days=0,
            confidence_score=0.95,
            risk_level="High" if result.get("anomaly_count", 0) > 0 else "Normal",
            model_version=result.get("model_version", "1.2.0"),
            factors_json={"anomalies": result.get("anomalies")},
            limitations_text=result.get("limitations")
        )
        db.add(pred_rec)
        db.commit()
        db.refresh(pred_rec)

        return {
            "id": pred_rec.id,
            "prediction_type": "anomaly_detection",
            "current_value": pred_rec.current_value,
            "predicted_value": pred_rec.predicted_value,
            "horizon_days": 0,
            "confidence_score": pred_rec.confidence_score,
            "risk_level": pred_rec.risk_level,
            "model_version": pred_rec.model_version,
            "factors": pred_rec.factors_json,
            "limitations": pred_rec.limitations_text,
            "created_at": pred_rec.created_at,
            "forecast_points": None
        }

    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported prediction type. Options: 'weight_forecast', 'cvd_risk_assessment', 'anomaly_detection'."
        )


@router.get("", response_model=list[PredictionResponse])
def get_user_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    preds = db.query(PredictionRecord).filter(
        PredictionRecord.user_id == current_user.id
    ).order_by(PredictionRecord.created_at.desc()).limit(20).all()

    out = []
    for p in preds:
        out.append({
            "id": p.id,
            "prediction_type": p.prediction_type,
            "current_value": p.current_value,
            "predicted_value": p.predicted_value,
            "horizon_days": p.horizon_days,
            "confidence_score": p.confidence_score,
            "risk_level": p.risk_level,
            "model_version": p.model_version,
            "factors": p.factors_json,
            "limitations": p.limitations_text or "",
            "created_at": p.created_at,
            "forecast_points": None
        })
    return out
