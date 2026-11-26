from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.models.entities import Recommendation, HealthRecord, UserProfile, HealthGoal

def sync_personalized_recommendations(user_id: int, db: Session) -> List[Recommendation]:
    """
    Evaluates latest user measurements, goals, and history,
    generating evidence-based lifestyle recommendations if not already active.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    records = db.query(HealthRecord).filter(
        HealthRecord.user_id == user_id
    ).order_by(HealthRecord.recorded_at.desc()).all()
    goals = db.query(HealthGoal).filter(
        HealthGoal.user_id == user_id,
        HealthGoal.status == "active"
    ).all()

    existing_titles = {
        r.title for r in db.query(Recommendation.title).filter(
            Recommendation.user_id == user_id,
            Recommendation.is_dismissed == False
        ).all()
    }

    new_recs = []

    # 1. Blood Pressure Analysis
    bp_records = [r for r in records if r.record_type == "blood_pressure"]
    if bp_records:
        latest_bp = bp_records[0]
        sys = latest_bp.value_primary
        dia = latest_bp.value_secondary or 80.0
        if (sys >= 135 or dia >= 85) and "DASH Diet & Sodium Awareness" not in existing_titles:
            new_recs.append(Recommendation(
                user_id=user_id,
                title="DASH Diet & Sodium Awareness",
                explanation="Your recent blood pressure readings average slightly above standard baseline (optimal: < 120/80 mmHg).",
                reason="Clinical evidence demonstrates reducing dietary sodium (< 2,300 mg/day) and increasing potassium-rich foods supports healthy arterial elasticity.",
                category="nutrition",
                supporting_data=f"Recent reading: {int(sys)}/{int(dia)} mmHg recorded on {latest_bp.recorded_at.strftime('%b %d')}",
                action_text="Substitute processed snacks with fresh fruit, leafy greens, or unsalted nuts.",
                priority="high"
            ))
        elif sys < 120 and dia < 80 and "Cardiovascular Vitality Maintained" not in existing_titles:
            new_recs.append(Recommendation(
                user_id=user_id,
                title="Cardiovascular Vitality Maintained",
                explanation="Your blood pressure reading is currently within the optimal physiological window (< 120/80 mmHg).",
                reason="Optimal vascular pressure minimizes long-term myocardial strain and arterial stiffening.",
                category="clinical_advisory",
                supporting_data=f"Latest reading: {int(sys)}/{int(dia)} mmHg",
                action_text="Continue current balanced nutrition and aerobic exercise routines.",
                priority="low"
            ))

    # 2. Sleep Duration Analysis
    sleep_records = [r for r in records if r.record_type in ["sleep_duration", "sleep"]]
    if sleep_records:
        recent_sleep = [r.value_primary for r in sleep_records[:5]]
        avg_sleep = sum(recent_sleep) / len(recent_sleep)
        if avg_sleep < 6.5 and "Consistent Circadian Wind-down" not in existing_titles:
            new_recs.append(Recommendation(
                user_id=user_id,
                title="Consistent Circadian Wind-down",
                explanation=f"Your recent sleep averages {avg_sleep:.1f} hours/night, which is below the recommended 7–9 hours for adult restorative recovery.",
                reason="Sub-optimal sleep elevates cortisol, impairs glucose regulation, and affects next-day cognitive performance.",
                category="sleep",
                supporting_data=f"Average of recent nights: {avg_sleep:.1f} hrs",
                action_text="Dim ambient blue light 45 minutes prior to bedtime and aim for a consistent sleep hour.",
                priority="high"
            ))
        elif avg_sleep >= 7.5 and "Restorative Sleep Maintenance" not in existing_titles:
            new_recs.append(Recommendation(
                user_id=user_id,
                title="Restorative Sleep Maintenance",
                explanation=f"You are consistently achieving an average of {avg_sleep:.1f} hours of sleep.",
                reason="Consistent sleep architecture promotes cellular repair and memory consolidation.",
                category="sleep",
                supporting_data=f"Current average: {avg_sleep:.1f} hrs",
                action_text="Maintain your sleep schedule through weekends to prevent social jetlag.",
                priority="medium"
            ))

    # 3. Physical Activity & Step Count
    activity_records = [r for r in records if r.record_type in ["step_count", "activity", "physical_activity"]]
    if activity_records:
        latest_act = activity_records[0]
        if latest_act.value_primary < 6000 and "Daily Movement Enhancement" not in existing_titles:
            new_recs.append(Recommendation(
                user_id=user_id,
                title="Daily Movement Enhancement",
                explanation="Recorded daily steps or active minutes have fallen below moderate activity benchmarks.",
                reason="Regular non-exercise physical activity (NEAT) improves insulin sensitivity and lipoprotein lipase activity.",
                category="activity",
                supporting_data=f"Recent step count: {int(latest_act.value_primary)} steps",
                action_text="Incorporate a 15-minute brisk walk after meals or take the stairs during routine commutes.",
                priority="medium"
            ))

    # 4. General Hydration Recommendation
    if "Targeted Daily Hydration" not in existing_titles:
        new_recs.append(Recommendation(
            user_id=user_id,
            title="Targeted Daily Hydration",
            explanation="Proper hydration supports cellular metabolism, kidney filtration, and optimal blood volume viscosity.",
            reason="Mild dehydration (1-2% body mass loss) can trigger false hunger cues, headaches, and elevated resting heart rate.",
            category="hydration",
            supporting_data="General wellness recommendation",
            action_text="Drink a glass of water immediately upon waking and maintain 2.0-2.5L throughout the day.",
            priority="medium"
        ))

    # 5. Goal Consistency
    if goals and "Active Wellness Goal Alignment" not in existing_titles:
        g = goals[0]
        new_recs.append(Recommendation(
            user_id=user_id,
            title="Active Wellness Goal Alignment",
            explanation=f"You are actively working towards your goal: '{g.title}'.",
            reason="Incremental habit tracking significantly increases long-term behavioral adherence compared to unmonitored targets.",
            category="clinical_advisory",
            supporting_data=f"Target: {g.target_value} {g.unit} (Current: {g.current_progress} {g.unit})",
            action_text="Log your progress updates weekly in the Goals tab.",
            priority="low"
        ))

    if new_recs:
        db.add_all(new_recs)
        db.commit()

    return db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.is_dismissed == False
    ).order_by(Recommendation.created_at.desc()).all()
