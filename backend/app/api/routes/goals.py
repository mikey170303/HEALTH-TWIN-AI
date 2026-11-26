from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import User, HealthGoal
from app.schemas.api_schemas import GoalCreate, GoalUpdate, GoalResponse
from app.api.deps import get_current_user

router = APIRouter()

def serialize_goal(g: HealthGoal) -> dict:
    pct = 0.0
    if g.target_value and g.target_value > 0:
        pct = round(min(100.0, max(0.0, (g.current_progress / g.target_value) * 100.0)), 1)
    
    return {
        "id": g.id,
        "user_id": g.user_id,
        "title": g.title,
        "description": g.description,
        "category": g.category,
        "target_value": g.target_value,
        "current_progress": g.current_progress,
        "unit": g.unit,
        "start_date": g.start_date,
        "target_date": g.target_date,
        "status": g.status,
        "progress_percentage": pct,
        "created_at": g.created_at
    }

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    g = HealthGoal(
        user_id=current_user.id,
        title=goal_in.title,
        description=goal_in.description,
        category=goal_in.category.lower(),
        target_value=goal_in.target_value,
        current_progress=goal_in.current_progress or 0.0,
        unit=goal_in.unit,
        start_date=goal_in.start_date or datetime.utcnow(),
        target_date=goal_in.target_date,
        status="active"
    )
    db.add(g)
    db.commit()
    db.refresh(g)
    return serialize_goal(g)

@router.get("", response_model=List[GoalResponse])
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goals = db.query(HealthGoal).filter(
        HealthGoal.user_id == current_user.id
    ).order_by(HealthGoal.created_at.desc()).all()
    return [serialize_goal(g) for g in goals]

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    g = db.query(HealthGoal).filter(
        HealthGoal.id == goal_id,
        HealthGoal.user_id == current_user.id
    ).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found.")

    for field, val in goal_in.model_dump(exclude_unset=True).items():
        setattr(g, field, val)

    # Check if target reached
    if g.target_value and g.current_progress >= g.target_value and g.status == "active":
        g.status = "completed"

    db.commit()
    db.refresh(g)
    return serialize_goal(g)

@router.delete("/{goal_id}", status_code=status.HTTP_200_OK)
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    g = db.query(HealthGoal).filter(
        HealthGoal.id == goal_id,
        HealthGoal.user_id == current_user.id
    ).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found.")

    db.delete(g)
    db.commit()
    return {"message": "Goal successfully deleted."}
