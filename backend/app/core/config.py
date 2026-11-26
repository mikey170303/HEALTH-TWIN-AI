import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "HealthTwin AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "healthtwin-super-secret-jwt-key-2026-secure-token-vault-9921"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    DATABASE_URL: str = "mysql+pymysql://root:1234@localhost:3306/healthtwin_ai"
    GEMINI_API_KEY: str = ""
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
