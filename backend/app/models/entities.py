import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    settings = relationship("UserSetting", back_populates="user", uselist=False, cascade="all, delete-orphan")
    health_records = relationship("HealthRecord", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("HealthGoal", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    height_cm = Column(Float, nullable=True)
    current_weight_kg = Column(Float, nullable=True)
    preferred_units = Column(String(20), default="metric") # 'metric' or 'imperial'
    health_goals_summary = Column(Text, nullable=True)
    medical_conditions = Column(Text, nullable=True)
    emergency_contact = Column(String(255), nullable=True)
    consent_sensitive_data = Column(Boolean, default=False)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")


class UserSetting(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    email_notifications = Column(Boolean, default=True)
    weekly_report = Column(Boolean, default=True)
    theme = Column(String(20), default="system")
    data_sharing_consent = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="settings")


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    record_type = Column(String(50), index=True, nullable=False) 
    # e.g., 'weight', 'height', 'heart_rate', 'blood_pressure', 'sleep_duration', 'step_count', 'blood_glucose'
    value_primary = Column(Float, nullable=False) # e.g. weight, systolic, heart rate, hours
    value_secondary = Column(Float, nullable=True) # e.g. diastolic for blood pressure
    unit = Column(String(30), nullable=False) # e.g. 'kg', 'lbs', 'bpm', 'mmHg', 'hours', 'steps', 'mg/dL'
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, index=True, nullable=False)
    notes = Column(Text, nullable=True)
    source = Column(String(50), default="manual") # 'manual', 'import', 'sensor'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="health_records")


class HealthGoal(Base):
    __tablename__ = "health_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False) # 'weight', 'sleep', 'activity', 'vitals', 'habit'
    target_value = Column(Float, nullable=False)
    current_progress = Column(Float, default=0.0)
    unit = Column(String(30), nullable=False)
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    target_date = Column(DateTime, nullable=True)
    status = Column(String(30), default="active") # 'active', 'completed', 'paused'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="goals")


class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    prediction_type = Column(String(60), index=True, nullable=False)
    current_value = Column(Float, nullable=True)
    predicted_value = Column(Float, nullable=True)
    horizon_days = Column(Integer, default=30)
    confidence_score = Column(Float, nullable=True)
    risk_level = Column(String(50), nullable=True) # 'low', 'moderate', 'high', 'screening_only'
    model_version = Column(String(50), default="1.0.0")
    factors_json = Column(JSON, nullable=True)
    limitations_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="predictions")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    category = Column(String(50), nullable=False) # 'sleep', 'activity', 'nutrition', 'hydration', 'stress', 'clinical_advisory'
    supporting_data = Column(Text, nullable=True)
    action_text = Column(Text, nullable=True)
    priority = Column(String(20), default="medium") # 'low', 'medium', 'high'
    is_completed = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="recommendations")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), default="HealthTwin Consultation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    role = Column(String(20), nullable=False) # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_hash = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="password_reset_tokens")
