from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import User, Recommendation
from app.schemas.api_schemas import RecommendationResponse, RecommendationUpdate
from app.services.recommendation_engine import sync_personalized_recommendations
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recs = sync_personalized_recommendations(current_user.id, db)
    return recs

@router.patch("/{recommendation_id}", response_model=RecommendationResponse)
def update_recommendation(
    recommendation_id: int,
    update_in: RecommendationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    if update_in.is_completed is not None:
        rec.is_completed = update_in.is_completed
    if update_in.is_dismissed is not None:
        rec.is_dismissed = update_in.is_dismissed
    if update_in.is_saved is not None:
        rec.is_saved = update_in.is_saved

    db.commit()
    db.refresh(rec)
    return rec
