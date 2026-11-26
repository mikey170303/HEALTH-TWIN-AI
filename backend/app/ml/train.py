"""
HealthTwin AI — Machine Learning Model Training & Evaluation Pipeline
Trains:
1. Cardiovascular Screening Classifier (Random Forest + StandardScaler)
2. Biometric Anomaly Detector (Isolation Forest)
"""
import os
import json
import joblib
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, classification_report
from app.ml.dataset import generate_cardiovascular_training_dataset

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)

FEATURE_COLS = [
    "age", "gender_male", "systolic_bp", "diastolic_bp",
    "bmi", "blood_glucose", "activity_hours", "resting_hr"
]

def train_and_evaluate():
    print("Generating clinically-modeled biometric dataset (5,000 observations)...")
    df = generate_cardiovascular_training_dataset(5000, random_state=42)

    X = df[FEATURE_COLS]
    y = df["elevated_cvd_risk"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 1. Scale Biometric Features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 2. Train Cardiovascular Screening Classifier
    print("Training Cardiovascular Risk Screening Classifier (Random Forest)...")
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=7,
        min_samples_split=6,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    y_prob = clf.predict_proba(X_test_scaled)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    auc = float(roc_auc_score(y_test, y_prob))
    f1 = float(f1_score(y_test, y_pred))

    print(f"Model Evaluation Results:")
    print(f"  - Accuracy: {acc:.4f}")
    print(f"  - ROC-AUC:  {auc:.4f}")
    print(f"  - F1-Score: {f1:.4f}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred))

    # Feature Importances
    importances = dict(zip(FEATURE_COLS, [round(float(v), 4) for v in clf.feature_importances_]))
    print(f"Feature Importances: {importances}")

    # 3. Train Biometric Anomaly Detection Model
    print("Training Biometric Anomaly Detector (Isolation Forest)...")
    anomaly_detector = IsolationForest(
        n_estimators=100,
        contamination=0.04, # Expected ~4% physiological outliers
        random_state=42
    )
    anomaly_detector.fit(X_train_scaled)

    # Save artifacts
    clf_path = os.path.join(MODELS_DIR, "cvd_risk_model.joblib")
    scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
    anomaly_path = os.path.join(MODELS_DIR, "anomaly_detector.joblib")
    meta_path = os.path.join(MODELS_DIR, "metadata.json")

    joblib.dump(clf, clf_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(anomaly_detector, anomaly_path)

    metadata = {
        "model_version": "1.2.0",
        "trained_at": datetime.utcnow().isoformat(),
        "algorithm": "RandomForestClassifier",
        "features": FEATURE_COLS,
        "performance": {
            "accuracy": round(acc, 4),
            "roc_auc": round(auc, 4),
            "f1_score": round(f1, 4)
        },
        "feature_importances": importances,
        "population": "Adult cohorts aged 20-85, biometric screening baseline",
        "intended_use": "Screening risk assessment and educational awareness. Not an FDA clinical diagnosis."
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Successfully saved all models to {MODELS_DIR}")
    return metadata

if __name__ == "__main__":
    train_and_evaluate()
