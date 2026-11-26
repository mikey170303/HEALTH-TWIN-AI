from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import User, UserProfile, UserSetting, HealthRecord
from app.schemas.api_schemas import ProfileUpdate, ProfileResponse, SettingsUpdate, SettingsResponse
from app.api.deps import get_current_user

router = APIRouter()

def compute_bmi_data(height_cm, weight_kg):
    if not height_cm or not weight_kg or height_cm <= 0 or weight_kg <= 0:
        return None, None
    h_m = height_cm / 100.0
    bmi = round(weight_kg / (h_m * h_m), 1)
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25.0:
        category = "Normal weight"
    elif bmi < 30.0:
        category = "Overweight"
    else:
        category = "Obese"
    return bmi, category

@router.get("/profile", response_model=ProfileResponse)
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    bmi, category = compute_bmi_data(profile.height_cm, profile.current_weight_kg)
    
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "age": profile.age,
        "date_of_birth": profile.date_of_birth,
        "gender": profile.gender,
        "height_cm": profile.height_cm,
        "current_weight_kg": profile.current_weight_kg,
        "preferred_units": profile.preferred_units,
        "health_goals_summary": profile.health_goals_summary,
        "medical_conditions": profile.medical_conditions,
        "emergency_contact": profile.emergency_contact,
        "consent_sensitive_data": profile.consent_sensitive_data,
        "onboarding_completed": profile.onboarding_completed,
        "bmi": bmi,
        "bmi_category": category
    }

@router.put("/profile", response_model=ProfileResponse)
def update_user_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    # Update non-null fields
    for field, val in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, val)

    # Auto-record weight or height if provided and changed
    if profile_in.current_weight_kg is not None:
        rec = HealthRecord(
            user_id=current_user.id,
            record_type="weight",
            value_primary=profile_in.current_weight_kg,
            unit="kg",
            source="profile_update"
        )
        db.add(rec)

    if profile_in.height_cm is not None:
        rec = HealthRecord(
            user_id=current_user.id,
            record_type="height",
            value_primary=profile_in.height_cm,
            unit="cm",
            source="profile_update"
        )
        db.add(rec)

    db.commit()
    db.refresh(profile)

    bmi, category = compute_bmi_data(profile.height_cm, profile.current_weight_kg)

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "age": profile.age,
        "date_of_birth": profile.date_of_birth,
        "gender": profile.gender,
        "height_cm": profile.height_cm,
        "current_weight_kg": profile.current_weight_kg,
        "preferred_units": profile.preferred_units,
        "health_goals_summary": profile.health_goals_summary,
        "medical_conditions": profile.medical_conditions,
        "emergency_contact": profile.emergency_contact,
        "consent_sensitive_data": profile.consent_sensitive_data,
        "onboarding_completed": profile.onboarding_completed,
        "bmi": bmi,
        "bmi_category": category
    }

@router.get("/settings", response_model=SettingsResponse)
def get_user_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings_obj = db.query(UserSetting).filter(UserSetting.user_id == current_user.id).first()
    if not settings_obj:
        settings_obj = UserSetting(user_id=current_user.id)
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj

@router.put("/settings", response_model=SettingsResponse)
def update_user_settings(
    settings_in: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings_obj = db.query(UserSetting).filter(UserSetting.user_id == current_user.id).first()
    if not settings_obj:
        settings_obj = UserSetting(user_id=current_user.id)
        db.add(settings_obj)

    for field, val in settings_in.model_dump(exclude_unset=True).items():
        setattr(settings_obj, field, val)

    db.commit()
    db.refresh(settings_obj)
    return settings_obj

@router.delete("/account", status_code=status.HTTP_200_OK)
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently deletes user account and all associated health records,
    predictions, chat messages, and settings (cascade).
    """
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated personal health data have been completely removed."}
