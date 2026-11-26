def test_user_data_isolation(client, auth_headers_user1, auth_headers_user2):
    # User 1 creates a record
    rec_resp = client.post("/api/v1/health-records", json={
        "record_type": "weight",
        "value_primary": 75.5,
        "unit": "kg"
    }, headers=auth_headers_user1)
    assert rec_resp.status_code == 201
    rec_id = rec_resp.json()["id"]

    # User 2 tries to GET User 1's record
    get_res = client.get(f"/api/v1/health-records/{rec_id}", headers=auth_headers_user2)
    assert get_res.status_code == 404 # Scoped to user, not visible

    # User 2 tries to UPDATE User 1's record
    update_res = client.put(f"/api/v1/health-records/{rec_id}", json={
        "value_primary": 99.0
    }, headers=auth_headers_user2)
    assert update_res.status_code == 404

    # User 2 tries to DELETE User 1's record
    del_res = client.delete(f"/api/v1/health-records/{rec_id}", headers=auth_headers_user2)
    assert del_res.status_code == 404

    # Verify User 1's record is intact
    verify_res = client.get(f"/api/v1/health-records/{rec_id}", headers=auth_headers_user1)
    assert verify_res.status_code == 200
    assert verify_res.json()["value_primary"] == 75.5

def test_goals_isolation(client, auth_headers_user1, auth_headers_user2):
    # User 1 creates a goal
    goal_res = client.post("/api/v1/goals", json={
        "title": "Sleep 8 hours",
        "category": "sleep",
        "target_value": 8.0,
        "unit": "hours"
    }, headers=auth_headers_user1)
    assert goal_res.status_code == 201
    goal_id = goal_res.json()["id"]

    # User 2 should not see it in their goals list
    u2_goals = client.get("/api/v1/goals", headers=auth_headers_user2).json()
    assert not any(g["id"] == goal_id for g in u2_goals)

    # User 2 cannot delete it
    del_res = client.delete(f"/api/v1/goals/{goal_id}", headers=auth_headers_user2)
    assert del_res.status_code == 404
