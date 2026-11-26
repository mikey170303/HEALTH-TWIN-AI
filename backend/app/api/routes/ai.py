from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import User, HealthRecord, UserProfile, HealthGoal, Conversation, ChatMessage
from app.schemas.api_schemas import (
    ChatMessageRequest, ChatMessageResponse, ConversationResponse, AIInsightResponse
)
from app.services.ai_assistant import ask_health_assistant, generate_deterministic_health_summary
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/chat", response_model=ChatMessageResponse)
async def chat_with_assistant(
    chat_in: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(HealthRecord).filter(
        HealthRecord.user_id == current_user.id
    ).order_by(HealthRecord.recorded_at.desc()).all()
    goals = db.query(HealthGoal).filter(
        HealthGoal.user_id == current_user.id,
        HealthGoal.status == "active"
    ).all()

    # Find or create active conversation
    conversation = None
    if chat_in.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == chat_in.conversation_id,
            Conversation.user_id == current_user.id
        ).first()

    if not conversation:
        conversation = db.query(Conversation).filter(
            Conversation.user_id == current_user.id
        ).order_by(Conversation.updated_at.desc()).first()

    if not conversation:
        conversation = Conversation(
            user_id=current_user.id,
            title="Health Consultation"
        )
        db.add(conversation)
        db.flush()

    # Save user message
    user_msg = ChatMessage(
        conversation_id=conversation.id,
        user_id=current_user.id,
        role="user",
        content=chat_in.message
    )
    db.add(user_msg)
    db.commit()

    # Generate assistant answer
    reply_text = await ask_health_assistant(
        user_name=current_user.full_name,
        profile=profile,
        records=records,
        goals=goals,
        query=chat_in.message,
        conversation_history=[]
    )

    assistant_msg = ChatMessage(
        conversation_id=conversation.id,
        user_id=current_user.id,
        role="assistant",
        content=reply_text
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg


@router.get("/history", response_model=ConversationResponse)
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).first()

    if not conv:
        # Create initial empty conversation
        conv = Conversation(user_id=current_user.id, title="Health Consultation")
        db.add(conv)
        db.commit()
        db.refresh(conv)

    msgs = db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conv.id
    ).order_by(ChatMessage.created_at.asc()).all()

    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at,
        "messages": msgs
    }


@router.delete("/history")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convs = db.query(Conversation).filter(Conversation.user_id == current_user.id).all()
    for c in convs:
        db.delete(c)
    db.commit()
    return {"message": "Chat conversation history cleared."}


@router.post("/insights", response_model=AIInsightResponse)
def get_ai_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(HealthRecord).filter(
        HealthRecord.user_id == current_user.id
    ).order_by(HealthRecord.recorded_at.desc()).all()

    insights = []
    
    # Blood pressure check
    bp = [r for r in records if r.record_type == "blood_pressure"]
    if bp:
        latest_bp = bp[0]
        insights.append({
            "category": "Vascular Health",
            "title": f"Recent Blood Pressure: {int(latest_bp.value_primary)}/{int(latest_bp.value_secondary or 80)} mmHg",
            "summary": "Values monitored for cardiovascular trend stability.",
            "status": "normal" if latest_bp.value_primary < 125 else "attention"
        })

    # Sleep check
    sleep = [r for r in records if r.record_type in ["sleep_duration", "sleep"]]
    if sleep:
        avg_s = sum([r.value_primary for r in sleep[:5]]) / min(len(sleep), 5)
        insights.append({
            "category": "Sleep Recovery",
            "title": f"Recent Sleep Average: {avg_s:.1f} hrs",
            "summary": "Restorative sleep architecture supports glucose regulation and mental clarity.",
            "status": "normal" if avg_s >= 7.0 else "attention"
        })

    # Weight check
    weights = [r for r in records if r.record_type == "weight"]
    if len(weights) >= 2:
        diff = weights[0].value_primary - weights[-1].value_primary
        direction = "steady" if abs(diff) < 0.5 else ("increased" if diff > 0 else "decreased")
        insights.append({
            "category": "Metabolic Trajectory",
            "title": f"Weight Trend: {direction.capitalize()} ({diff:+.1f} kg)",
            "summary": f"Observed across {len(weights)} recorded weight checkpoints.",
            "status": "normal"
        })

    if not insights:
        insights.append({
            "category": "Getting Started",
            "title": "Awaiting Initial Observations",
            "summary": "Record your blood pressure, sleep, and weight to generate AI trend correlations.",
            "status": "info"
        })

    return {
        "insights": insights,
        "disclaimer": "HealthTwin AI insights are synthesized from recorded observations for personal wellness monitoring and lifestyle reflection. They are not medical evaluations."
    }
