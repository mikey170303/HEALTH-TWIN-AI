import os
import json
import httpx
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.models.entities import HealthRecord, UserProfile, HealthGoal

SYSTEM_PROMPT = """You are HealthTwin AI, an intelligent, evidence-informed healthcare and wellness assistant.
Your role is to help the user understand their personal biometric trends, sleep metrics, vital signs, and wellness goals.

Guidelines:
1. Ground your answers strictly in the user's actual recorded measurements provided in the prompt context.
2. Acknowledge missing data honestly; do not hallucinate numbers or pretend unrecorded tests exist.
3. Provide evidence-based lifestyle suggestions (sleep hygiene, hydration, balanced nutrition, daily physical activity).
4. Strictly disclaim: You do not provide medical diagnosis, prescribe drugs, or replace clinical consultations.
5. If the user mentions acute red-flag symptoms (severe chest pain, shortness of breath, sudden weakness, fainting, systolic BP >= 180), immediately urge them to seek urgent emergency medical attention.
6. Keep explanations clear, compassionate, and actionable.
"""

def generate_deterministic_health_summary(
    user_name: str,
    profile: Optional[UserProfile],
    records: List[HealthRecord],
    goals: List[HealthGoal],
    query: str
) -> str:
    """
    Deterministic clinical fallback engine when LLM API key is not configured or offline.
    Directly computes trend stats from user records without fabricating.
    """
    q_lower = query.lower()
    lines = [f"**HealthTwin AI Clinical Engine (Deterministic Mode)** for {user_name}:\n"]

    # BMI Query
    if "bmi" in q_lower or "body mass index" in q_lower or "weight" in q_lower:
        if profile and profile.height_cm and profile.current_weight_kg:
            h_m = profile.height_cm / 100.0
            bmi = round(profile.current_weight_kg / (h_m * h_m), 1)
            lines.append(f"- **Current Weight**: {profile.current_weight_kg} kg | **Height**: {profile.height_cm} cm")
            lines.append(f"- **BMI Screening**: {bmi} kg/m²")
            if bmi < 18.5:
                cat = "Underweight"
            elif bmi < 25.0:
                cat = "Normal weight"
            elif bmi < 30.0:
                cat = "Overweight"
            else:
                cat = "Obese class"
            lines.append(f"- **Category**: {cat}")
            lines.append("  *Note: BMI is an epidemiological screening ratio, not a definitive assessment of individual body composition or metabolic health.*")
        else:
            lines.append("- Please enter both your height and weight in My Health to enable accurate BMI calculation.")

    # Sleep Query
    if "sleep" in q_lower:
        sleep_recs = [r for r in records if r.record_type in ["sleep_duration", "sleep"]]
        if sleep_recs:
            vals = [r.value_primary for r in sleep_recs[:7]]
            avg_s = sum(vals) / len(vals)
            lines.append(f"- **Recent Sleep Overview**: Averaging {avg_s:.1f} hours across {len(vals)} recorded nights.")
            if avg_s < 7.0:
                lines.append("  *Evidence-based suggestion*: The American Academy of Sleep Medicine recommends 7–9 hours for adults. Dimming bright screens 45 minutes prior to bed can improve melatonin onset.")
            else:
                lines.append("  *Positive indicator*: Your sleep duration falls within recommended restorative adult baselines.")
        else:
            lines.append("- No sleep duration entries found in your records. Log your sleep duration in My Health to analyze circadian patterns.")

    # Blood Pressure Query
    if "blood pressure" in q_lower or "bp" in q_lower or "vital" in q_lower:
        bp_recs = [r for r in records if r.record_type == "blood_pressure"]
        if bp_recs:
            latest = bp_recs[0]
            lines.append(f"- **Latest Blood Pressure**: {int(latest.value_primary)}/{int(latest.value_secondary or 80)} mmHg ({latest.recorded_at.strftime('%Y-%m-%d')})")
            if latest.value_primary < 120 and (latest.value_secondary or 80) < 80:
                lines.append("  *Status*: Normal physiological range.")
            elif latest.value_primary < 130 and (latest.value_secondary or 80) < 80:
                lines.append("  *Status*: Elevated systolic.")
            elif latest.value_primary < 140 or (latest.value_secondary or 80) < 90:
                lines.append("  *Status*: Stage 1 Hypertension threshold. Consider discussing lifestyle sodium moderation and stress habits with your clinician.")
            else:
                lines.append("  *Status*: Stage 2 Hypertension threshold. Schedule a routine blood pressure review with your healthcare provider.")
        else:
            lines.append("- No blood pressure measurements recorded yet.")

    # Activity Query
    if "activity" in q_lower or "step" in q_lower or "exercise" in q_lower:
        act_recs = [r for r in records if r.record_type in ["step_count", "activity", "physical_activity"]]
        if act_recs:
            latest_act = act_recs[0]
            lines.append(f"- **Physical Movement**: Latest record is {latest_act.value_primary} {latest_act.unit} ({latest_act.recorded_at.strftime('%Y-%m-%d')}).")
        else:
            lines.append("- No physical activity records logged yet.")

    # Doctor / Clinical Discussion Query
    if "doctor" in q_lower or "discuss" in q_lower or "appointment" in q_lower:
        lines.append("\n**Key Information to Share with Your Doctor**:")
        lines.append("1. Summary of your recorded blood pressure and resting pulse averages.")
        lines.append("2. Recent sleep consistency and any daytime fatigue.")
        lines.append("3. Any uncharacteristic spikes flagged in your anomaly screening.")
        lines.append("4. An exported copy of your HealthTwin AI CSV records.")

    # General overview if no specific keywords matched
    if len(lines) == 1:
        lines.append(f"Here is a summary of your current HealthTwin profile:")
        total_recs = len(records)
        active_goals = len(goals)
        lines.append(f"- **Total Recorded Observations**: {total_recs}")
        lines.append(f"- **Active Wellness Goals**: {active_goals}")
        if profile and profile.current_weight_kg:
            lines.append(f"- **Current Weight**: {profile.current_weight_kg} kg")
        lines.append("\nYou can ask me specific questions like:")
        lines.append("- 'Explain my recent health trends.'")
        lines.append("- 'How has my sleep changed this month?'")
        lines.append("- 'Explain my BMI calculation.'")
        lines.append("- 'What information should I discuss with my doctor?'")

    lines.append("\n*Disclaimer: HealthTwin AI is an educational health assistant. It does not provide medical diagnosis or replace medical advice from a qualified healthcare practitioner.*")
    return "\n".join(lines)


async def ask_health_assistant(
    user_name: str,
    profile: Optional[UserProfile],
    records: List[HealthRecord],
    goals: List[HealthGoal],
    query: str,
    conversation_history: List[Dict[str, str]]
) -> str:
    """
    Generates intelligent response using Gemini API if key is present,
    or falls back to the deterministic clinical engine.
    """
    api_key = settings.GEMINI_API_KEY.strip() or os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key:
        return generate_deterministic_health_summary(user_name, profile, records, goals, query)

    # Format minimal relevant health context
    context_lines = [
        f"User: {user_name}",
        f"Age: {profile.age if profile else 'Not provided'}",
        f"Gender: {profile.gender if profile else 'Not provided'}",
        f"Height: {profile.height_cm if profile else 'Not provided'} cm",
        f"Weight: {profile.current_weight_kg if profile else 'Not provided'} kg",
        f"Preferred units: {profile.preferred_units if profile else 'metric'}"
    ]
    if records:
        context_lines.append("\nRecent 10 Health Records:")
        for r in records[:10]:
            sec = f"/{r.value_secondary}" if r.value_secondary else ""
            context_lines.append(f"- {r.record_type}: {r.value_primary}{sec} {r.unit} ({r.recorded_at.strftime('%Y-%m-%d')})")
    else:
        context_lines.append("\nRecent Health Records: No records logged yet.")

    if goals:
        context_lines.append("\nActive Goals:")
        for g in goals:
            context_lines.append(f"- {g.title}: target {g.target_value} {g.unit}, current {g.current_progress} {g.unit}")

    patient_context = "\n".join(context_lines)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "systemInstruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"Patient Biometric Context:\n{patient_context}\n\nUser Question:\n{query}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                return generate_deterministic_health_summary(user_name, profile, records, goals, query)
    except Exception:
        return generate_deterministic_health_summary(user_name, profile, records, goals, query)
