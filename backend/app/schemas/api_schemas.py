from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    terms_accepted: bool = Field(..., description="Must accept terms and privacy policy")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[datetime] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

# --- Profile Schemas ---
class ProfileUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=1, le=130)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = Field(None, ge=30, le=280)
    current_weight_kg: Optional[float] = Field(None, ge=10, le=500)
    preferred_units: Optional[str] = "metric" # 'metric' or 'imperial'
    health_goals_summary: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None
    consent_sensitive_data: Optional[bool] = None
    onboarding_completed: Optional[bool] = None

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    age: Optional[int] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    current_weight_kg: Optional[float] = None
    preferred_units: str
    health_goals_summary: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None
    consent_sensitive_data: bool
    onboarding_completed: bool
    bmi: Optional[float] = None
    bmi_category: Optional[str] = None

    class Config:
        from_attributes = True

class SettingsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    weekly_report: Optional[bool] = None
    theme: Optional[str] = None
    data_sharing_consent: Optional[bool] = None

class SettingsResponse(BaseModel):
    id: int
    user_id: int
    email_notifications: bool
    weekly_report: bool
    theme: str
    data_sharing_consent: bool

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    profile: Optional[ProfileResponse] = None
    settings: Optional[SettingsResponse] = None

    class Config:
        from_attributes = True

# --- Health Record Schemas ---
class HealthRecordCreate(BaseModel):
    record_type: str = Field(..., description="weight, height, heart_rate, blood_pressure, sleep_duration, step_count, blood_glucose")
    value_primary: float = Field(..., description="Primary numeric value")
    value_secondary: Optional[float] = Field(None, description="Secondary value, e.g. diastolic BP")
    unit: str
    recorded_at: Optional[datetime] = None
    notes: Optional[str] = None
    source: Optional[str] = "manual"

class HealthRecordUpdate(BaseModel):
    value_primary: Optional[float] = None
    value_secondary: Optional[float] = None
    unit: Optional[str] = None
    recorded_at: Optional[datetime] = None
    notes: Optional[str] = None

class HealthRecordResponse(BaseModel):
    id: int
    user_id: int
    record_type: str
    value_primary: float
    value_secondary: Optional[float] = None
    unit: str
    recorded_at: datetime
    notes: Optional[str] = None
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

class CSVImportResult(BaseModel):
    imported_count: int
    failed_count: int
    errors: List[str]

# --- Health Goal Schemas ---
class GoalCreate(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    category: str # 'weight', 'sleep', 'activity', 'vitals', 'habit'
    target_value: float
    current_progress: Optional[float] = 0.0
    unit: str
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_value: Optional[float] = None
    current_progress: Optional[float] = None
    unit: Optional[str] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = None # 'active', 'completed', 'paused'

class GoalResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    category: str
    target_value: float
    current_progress: float
    unit: str
    start_date: datetime
    target_date: Optional[datetime] = None
    status: str
    progress_percentage: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

# --- Prediction Schemas ---
class PredictionRequest(BaseModel):
    prediction_type: str = Field(..., description="weight_forecast, cvd_risk_assessment, anomaly_detection, sleep_quality")
    horizon_days: Optional[int] = 30

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    prediction_type: str
    current_value: Optional[float] = None
    predicted_value: Optional[float] = None
    horizon_days: int
    confidence_score: Optional[float] = None
    risk_level: Optional[str] = None
    model_version: str
    factors: Optional[Dict[str, Any]] = None
    limitations: str
    created_at: datetime
    forecast_points: Optional[List[Dict[str, Any]]] = None

# --- Recommendation Schemas ---
class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    explanation: str
    reason: str
    category: str
    supporting_data: Optional[str] = None
    action_text: Optional[str] = None
    priority: str
    is_completed: bool
    is_dismissed: bool
    is_saved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationUpdate(BaseModel):
    is_completed: Optional[bool] = None
    is_dismissed: Optional[bool] = None
    is_saved: Optional[bool] = None

# --- AI Chat Schemas ---
class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[int] = None

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class AIInsightResponse(BaseModel):
    insights: List[Dict[str, Any]]
    disclaimer: str

# --- Dashboard & Analytics Schemas ---
class DashboardResponse(BaseModel):
    user_name: str
    latest_measurements: Dict[str, Optional[Dict[str, Any]]]
    bmi_summary: Optional[Dict[str, Any]] = None
    active_goals: List[GoalResponse]
    recent_records: List[HealthRecordResponse]
    recent_recommendations: List[RecommendationResponse]
    active_predictions: List[PredictionResponse]
    analytics_sparklines: Dict[str, List[Dict[str, Any]]]
