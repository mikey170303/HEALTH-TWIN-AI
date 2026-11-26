import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.entities import User, UserProfile, UserSetting, PasswordResetToken, Recommendation
from app.schemas.api_schemas import (
    UserCreate, UserLogin, UserResponse, Token, ForgotPasswordRequest, ResetPasswordRequest
)
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if not user_in.terms_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the terms of service and privacy notice."
        )

    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.flush()

    # Create default empty profile
    profile = UserProfile(
        user_id=new_user.id,
        preferred_units="metric",
        onboarding_completed=False,
        consent_sensitive_data=True
    )
    db.add(profile)

    # Create default settings
    settings_obj = UserSetting(
        user_id=new_user.id,
        email_notifications=True,
        weekly_report=True,
        theme="light",
        data_sharing_consent=False
    )
    db.add(settings_obj)

    # Seed an introductory wellness recommendation
    initial_rec = Recommendation(
        user_id=new_user.id,
        title="Welcome to HealthTwin AI",
        explanation="Start your personal wellness journey by recording your baseline height, weight, and blood pressure in My Health.",
        reason="Baseline health metrics allow our ML algorithms and AI assistant to provide tailored forecasts.",
        category="clinical_advisory",
        action_text="Complete your onboarding profile",
        priority="high"
    )
    db.add(initial_rec)

    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(subject=new_user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account is deactivated."
        )

    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate BMI if profile has height and weight
    profile = current_user.profile
    bmi_val = None
    bmi_cat = None
    if profile and profile.height_cm and profile.current_weight_kg:
        h_m = profile.height_cm / 100.0
        if h_m > 0:
            bmi_val = round(profile.current_weight_kg / (h_m * h_m), 1)
            if bmi_val < 18.5:
                bmi_cat = "Underweight"
            elif bmi_val < 25.0:
                bmi_cat = "Normal weight"
            elif bmi_val < 30.0:
                bmi_cat = "Overweight"
            else:
                bmi_cat = "Obese"

    resp = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at,
        "profile": {
            "id": profile.id if profile else 0,
            "user_id": current_user.id,
            "age": profile.age if profile else None,
            "date_of_birth": profile.date_of_birth if profile else None,
            "gender": profile.gender if profile else None,
            "height_cm": profile.height_cm if profile else None,
            "current_weight_kg": profile.current_weight_kg if profile else None,
            "preferred_units": profile.preferred_units if profile else "metric",
            "health_goals_summary": profile.health_goals_summary if profile else None,
            "medical_conditions": profile.medical_conditions if profile else None,
            "emergency_contact": profile.emergency_contact if profile else None,
            "consent_sensitive_data": profile.consent_sensitive_data if profile else False,
            "onboarding_completed": profile.onboarding_completed if profile else False,
            "bmi": bmi_val,
            "bmi_category": bmi_cat
        } if profile else None,
        "settings": {
            "id": current_user.settings.id if current_user.settings else 0,
            "user_id": current_user.id,
            "email_notifications": current_user.settings.email_notifications if current_user.settings else True,
            "weekly_report": current_user.settings.weekly_report if current_user.settings else True,
            "theme": current_user.settings.theme if current_user.settings else "light",
            "data_sharing_consent": current_user.settings.data_sharing_consent if current_user.settings else False,
        } if current_user.settings else None
    }
    return resp


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    # To prevent account enumeration, respond with success message
    if not user:
        return {"message": "If this email exists in our system, password reset instructions have been generated."}

    token_str = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    reset_entry = PasswordResetToken(
        user_id=user.id,
        token_hash=token_str,
        expires_at=expires
    )
    db.add(reset_entry)
    db.commit()

    return {
        "message": "If this email exists in our system, password reset instructions have been generated.",
        "reset_token": token_str # Returned in dev environment for easy verification
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_entry = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == req.token,
        PasswordResetToken.used_at.is_(None)
    ).first()

    if not reset_entry:
        raise HTTPException(status_code=400, detail="Invalid or already used reset token.")

    # Check expiration
    if reset_entry.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired.")

    user = db.query(User).filter(User.id == reset_entry.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = get_password_hash(req.new_password)
    reset_entry.used_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "Password successfully updated. You may now log in."}
