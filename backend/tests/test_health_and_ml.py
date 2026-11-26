import pytest

def test_health_record_range_validation(client, auth_headers_user1):
    # Implausible systolic BP
    bad_bp = client.post("/api/v1/health-records", json={
        "record_type": "blood_pressure",
        "value_primary": 450.0,
        "value_secondary": 90.0,
        "unit": "mmHg"
    }, headers=auth_headers_user1)
    assert bad_bp.status_code == 400
    assert "Systolic" in bad_bp.json()["detail"]

    # Implausible heart rate
    bad_hr = client.post("/api/v1/health-records", json={
        "record_type": "heart_rate",
        "value_primary": 10.0,
        "unit": "bpm"
    }, headers=auth_headers_user1)
    assert bad_hr.status_code == 400

    # Valid blood pressure
    good_bp = client.post("/api/v1/health-records", json={
        "record_type": "blood_pressure",
        "value_primary": 120.0,
        "value_secondary": 80.0,
        "unit": "mmHg"
    }, headers=auth_headers_user1)
    assert good_bp.status_code == 201

def test_ml_cvd_risk_prediction(client, auth_headers_user1):
    # Update profile first
    client.put("/api/v1/profile", json={
        "age": 55,
        "gender": "male",
        "height_cm": 178.0,
        "current_weight_kg": 85.0
    }, headers=auth_headers_user1)

    # Add blood pressure
    client.post("/api/v1/health-records", json={
        "record_type": "blood_pressure",
        "value_primary": 135.0,
        "value_secondary": 88.0,
        "unit": "mmHg"
    }, headers=auth_headers_user1)

    # Request prediction
    pred_res = client.post("/api/v1/predictions", json={
        "prediction_type": "cvd_risk_assessment"
    }, headers=auth_headers_user1)

    assert pred_res.status_code == 200
    data = pred_res.json()
    assert data["prediction_type"] == "cvd_risk_assessment"
    assert data["risk_level"] in ["Low", "Moderate", "Elevated"]
    assert "limitations" in data
    assert data["model_version"] == "1.2.0"

def test_ml_weight_forecast_insufficient_data(client, auth_headers_user1):
    # With only 1 or 2 records, forecasting accurately refuses with 400
    res = client.post("/api/v1/predictions", json={
        "prediction_type": "weight_forecast",
        "horizon_days": 30
    }, headers=auth_headers_user1)
    assert res.status_code == 400
    assert "At least 3 historical" in res.json()["detail"]

def test_ai_deterministic_chat(client, auth_headers_user1):
    res = client.post("/api/v1/ai/chat", json={
        "message": "Explain my blood pressure readings."
    }, headers=auth_headers_user1)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "assistant"
    assert len(data["content"]) > 10
