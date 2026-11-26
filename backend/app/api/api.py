from fastapi import APIRouter
from app.api.routes import (
    auth, profile, health_records, dashboard, predictions, recommendations, goals, ai
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile.router, tags=["Profile & Settings"])
api_router.include_router(health_records.router, prefix="/health-records", tags=["Health Records"])
api_router.include_router(dashboard.router, tags=["Dashboard & Analytics"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(goals.router, prefix="/goals", tags=["Health Goals"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Health Assistant"])
