import csv
import io
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import User, HealthRecord, UserProfile
from app.schemas.api_schemas import (
    HealthRecordCreate, HealthRecordUpdate, HealthRecordResponse, CSVImportResult
)
from app.api.deps import get_current_user

router = APIRouter()

# Input validation ranges for health metrics
VALID_RANGES = {
    "weight": {"min": 10.0, "max": 500.0, "units": ["kg", "lbs"]},
    "height": {"min": 40.0, "max": 280.0, "units": ["cm", "in"]},
    "heart_rate": {"min": 30.0, "max": 240.0, "units": ["bpm"]},
    "blood_pressure": {"min_sys": 50.0, "max_sys": 260.0, "min_dia": 30.0, "max_dia": 160.0, "units": ["mmHg"]},
    "sleep_duration": {"min": 0.0, "max": 24.0, "units": ["hours", "hrs", "min"]},
    "step_count": {"min": 0.0, "max": 120000.0, "units": ["steps"]},
    "blood_glucose": {"min": 20.0, "max": 600.0, "units": ["mg/dL", "mmol/L"]}
}

def validate_measurement(record_type: str, val1: float, val2: Optional[float], unit: str):
    rt = record_type.lower()
    if rt in VALID_RANGES:
        cfg = VALID_RANGES[rt]
        if rt == "blood_pressure":
            if val1 < cfg["min_sys"] or val1 > cfg["max_sys"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Systolic blood pressure ({val1}) must be between {cfg['min_sys']} and {cfg['max_sys']} mmHg."
                )
            if val2 is not None and (val2 < cfg["min_dia"] or val2 > cfg["max_dia"]):
                raise HTTPException(
                    status_code=400,
                    detail=f"Diastolic blood pressure ({val2}) must be between {cfg['min_dia']} and {cfg['max_dia']} mmHg."
                )
        else:
            if val1 < cfg["min"] or val1 > cfg["max"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"{rt.capitalize()} measurement ({val1}) is outside plausible range ({cfg['min']} - {cfg['max']})."
                )

@router.post("", response_model=HealthRecordResponse, status_code=status.HTTP_201_CREATED)
def create_health_record(
    record_in: HealthRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    validate_measurement(
        record_in.record_type,
        record_in.value_primary,
        record_in.value_secondary,
        record_in.unit
    )

    rec = HealthRecord(
        user_id=current_user.id,
        record_type=record_in.record_type.lower(),
        value_primary=record_in.value_primary,
        value_secondary=record_in.value_secondary,
        unit=record_in.unit,
        recorded_at=record_in.recorded_at or datetime.utcnow(),
        notes=record_in.notes,
        source=record_in.source or "manual"
    )
    db.add(rec)

    # Sync weight/height to user profile for convenience
    if rec.record_type == "weight":
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        if profile:
            profile.current_weight_kg = rec.value_primary
    elif rec.record_type == "height":
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        if profile:
            profile.height_cm = rec.value_primary

    db.commit()
    db.refresh(rec)
    return rec


@router.get("", response_model=List[HealthRecordResponse])
def get_health_records(
    record_type: Optional[str] = Query(None, description="Filter by type, e.g. weight, heart_rate"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(HealthRecord).filter(HealthRecord.user_id == current_user.id)
    if record_type:
        query = query.filter(HealthRecord.record_type == record_type.lower())
    if start_date:
        query = query.filter(HealthRecord.recorded_at >= start_date)
    if end_date:
        query = query.filter(HealthRecord.recorded_at <= end_date)

    query = query.order_by(HealthRecord.recorded_at.desc())
    records = query.offset(skip).limit(limit).all()
    return records


@router.get("/{record_id}", response_model=HealthRecordResponse)
def get_health_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(HealthRecord).filter(
        HealthRecord.id == record_id,
        HealthRecord.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Health record not found.")
    return rec


@router.put("/{record_id}", response_model=HealthRecordResponse)
def update_health_record(
    record_id: int,
    record_in: HealthRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(HealthRecord).filter(
        HealthRecord.id == record_id,
        HealthRecord.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Health record not found.")

    new_val1 = record_in.value_primary if record_in.value_primary is not None else rec.value_primary
    new_val2 = record_in.value_secondary if record_in.value_secondary is not None else rec.value_secondary
    new_unit = record_in.unit if record_in.unit is not None else rec.unit

    validate_measurement(rec.record_type, new_val1, new_val2, new_unit)

    if record_in.value_primary is not None:
        rec.value_primary = record_in.value_primary
    if record_in.value_secondary is not None:
        rec.value_secondary = record_in.value_secondary
    if record_in.unit is not None:
        rec.unit = record_in.unit
    if record_in.recorded_at is not None:
        rec.recorded_at = record_in.recorded_at
    if record_in.notes is not None:
        rec.notes = record_in.notes

    db.commit()
    db.refresh(rec)
    return rec


@router.delete("/{record_id}", status_code=status.HTTP_200_OK)
def delete_health_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(HealthRecord).filter(
        HealthRecord.id == record_id,
        HealthRecord.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Health record not found.")

    db.delete(rec)
    db.commit()
    return {"message": "Record successfully deleted."}


@router.post("/import-csv", response_model=CSVImportResult)
async def import_csv_records(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV file.")

    contents = await file.read()
    try:
        decoded = contents.decode("utf-8")
    except UnicodeDecodeError:
        decoded = contents.decode("latin-1")

    reader = csv.DictReader(io.StringIO(decoded))
    imported = 0
    failed = 0
    errors = []

    for idx, row in enumerate(reader, start=1):
        try:
            rt = row.get("record_type", "").strip().lower()
            val1_str = row.get("value_primary") or row.get("value")
            if not rt or not val1_str:
                failed += 1
                errors.append(f"Row {idx}: Missing record_type or value.")
                continue

            val1 = float(val1_str)
            val2_str = row.get("value_secondary")
            val2 = float(val2_str) if val2_str and val2_str.strip() else None
            unit = row.get("unit", "").strip() or "unit"

            rec_time_str = row.get("recorded_at")
            if rec_time_str:
                try:
                    rec_time = datetime.fromisoformat(rec_time_str.replace("Z", "+00:00"))
                except Exception:
                    rec_time = datetime.utcnow()
            else:
                rec_time = datetime.utcnow()

            notes = row.get("notes")
            rec = HealthRecord(
                user_id=current_user.id,
                record_type=rt,
                value_primary=val1,
                value_secondary=val2,
                unit=unit,
                recorded_at=rec_time,
                notes=notes,
                source="csv_import"
            )
            db.add(rec)
            imported += 1
        except Exception as e:
            failed += 1
            errors.append(f"Row {idx}: {str(e)}")

    if imported > 0:
        db.commit()

    return CSVImportResult(imported_count=imported, failed_count=failed, errors=errors[:10])


@router.get("/export-csv")
def export_csv_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(HealthRecord).filter(
        HealthRecord.user_id == current_user.id
    ).order_by(HealthRecord.recorded_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "id", "record_type", "value_primary", "value_secondary",
        "unit", "recorded_at", "notes", "source"
    ])

    for r in records:
        writer.writerow([
            r.id,
            r.record_type,
            r.value_primary,
            r.value_secondary or "",
            r.unit,
            r.recorded_at.isoformat(),
            r.notes or "",
            r.source
        ])

    output.seek(0)
    filename = f"healthtwin_records_user_{current_user.id}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
