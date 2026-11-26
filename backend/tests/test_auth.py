import pytest

def test_register_success(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "newuser@test.com",
        "password": "SecretPassword123",
        "full_name": "Test User",
        "terms_accepted": True
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_register_duplicate_email(client):
    payload = {
        "email": "dup@test.com",
        "password": "SecretPassword123",
        "full_name": "Test User",
        "terms_accepted": True
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201
    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_register_without_terms(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "noterms@test.com",
        "password": "SecretPassword123",
        "full_name": "No Terms",
        "terms_accepted": False
    })
    assert res.status_code == 400

def test_login_success_and_failure(client):
    client.post("/api/v1/auth/register", json={
        "email": "loginuser@test.com",
        "password": "CorrectPassword123",
        "full_name": "Login User",
        "terms_accepted": True
    })
    # Valid login
    res_ok = client.post("/api/v1/auth/login", json={
        "email": "loginuser@test.com",
        "password": "CorrectPassword123"
    })
    assert res_ok.status_code == 200
    assert "access_token" in res_ok.json()

    # Invalid password
    res_bad = client.post("/api/v1/auth/login", json={
        "email": "loginuser@test.com",
        "password": "WrongPassword!"
    })
    assert res_bad.status_code == 401

def test_protected_me_endpoint(client, auth_headers_user1):
    res = client.get("/api/v1/auth/me", headers=auth_headers_user1)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "user1@example.com"
    assert data["full_name"] == "Alice Smith"

def test_unauthorized_access(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
