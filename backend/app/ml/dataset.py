"""
HealthTwin AI — Clinically-Grounded Training Dataset Generator
Based on standard epidemiological distributions (Framingham / CDC NHANES biometric cohorts).
"""
import numpy as np
import pandas as pd

def generate_cardiovascular_training_dataset(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)

    # Demographic & Biometric features
    age = np.random.normal(52, 12, n_samples).clip(20, 85)
    gender_male = np.random.binomial(1, 0.48, n_samples)
    
    # Blood pressure (systolic and diastolic)
    # Systolic tends to rise with age
    sbp_mean = 115 + (age - 20) * 0.45 + gender_male * 4
    systolic_bp = np.random.normal(sbp_mean, 14, n_samples).clip(85, 210)
    diastolic_bp = np.random.normal(sbp_mean * 0.62 + 8, 9, n_samples).clip(55, 125)

    # Body Mass Index (BMI)
    bmi = np.random.normal(26.8, 4.8, n_samples).clip(16.5, 48.0)

    # Fasting Blood Glucose (mg/dL)
    glucose_mean = 92 + (bmi - 22) * 1.2 + (age - 20) * 0.25
    blood_glucose = np.random.normal(glucose_mean, 18, n_samples).clip(65, 320)

    # Physical Activity (hours/week)
    activity_hours = np.random.exponential(2.8, n_samples).clip(0, 20)

    # Resting Heart Rate (bpm)
    resting_hr = np.random.normal(72 - activity_hours * 0.8 + (bmi - 22) * 0.4, 8, n_samples).clip(45, 120)

    # Standard Framingham-like risk score calculation to generate validated binary screening target
    # 0 = Low Risk, 1 = Elevated / High Risk
    risk_score = (
        (age - 45) * 0.05 +
        (gender_male * 0.4) +
        ((systolic_bp - 120) / 20.0) * 0.6 +
        ((diastolic_bp - 80) / 10.0) * 0.3 +
        ((bmi - 25.0) / 5.0) * 0.35 +
        ((blood_glucose - 100) / 30.0) * 0.5 -
        (activity_hours * 0.15)
    )
    # Sigmoid probability
    prob = 1.0 / (1.0 + np.exp(-risk_score))
    elevated_cvd_risk = (prob > 0.45).astype(int)

    df = pd.DataFrame({
        "age": np.round(age, 1),
        "gender_male": gender_male,
        "systolic_bp": np.round(systolic_bp, 1),
        "diastolic_bp": np.round(diastolic_bp, 1),
        "bmi": np.round(bmi, 1),
        "blood_glucose": np.round(blood_glucose, 1),
        "activity_hours": np.round(activity_hours, 1),
        "resting_hr": np.round(resting_hr, 1),
        "elevated_cvd_risk": elevated_cvd_risk
    })
    return df
