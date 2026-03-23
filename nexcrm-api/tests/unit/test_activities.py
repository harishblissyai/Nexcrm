import pytest


def test_create_activity(client, auth_headers):
    r = client.post("/api/activities", json={"type": "Call", "subject": "First call"}, headers=auth_headers)
    assert r.status_code == 201
    data = r.json()
    assert data["type"] == "Call"
    assert data["subject"] == "First call"


def test_create_activity_missing_subject(client, auth_headers):
    r = client.post("/api/activities", json={"type": "Email"}, headers=auth_headers)
    assert r.status_code == 422


def test_create_activity_invalid_type(client, auth_headers):
    r = client.post("/api/activities", json={"type": "Tweet", "subject": "x"}, headers=auth_headers)
    assert r.status_code == 422


def test_create_activity_with_contact(client, auth_headers):
    contact = client.post("/api/contacts", json={"name": "Alice"}, headers=auth_headers).json()
    r = client.post("/api/activities", json={
        "type": "Meeting", "subject": "Onboarding", "contact_id": contact["id"]
    }, headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["contact_id"] == contact["id"]


def test_create_activity_with_lead(client, auth_headers):
    lead = client.post("/api/leads", json={"title": "Deal"}, headers=auth_headers).json()
    r = client.post("/api/activities", json={
        "type": "Note", "subject": "Note on lead", "lead_id": lead["id"]
    }, headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["lead_id"] == lead["id"]


def test_list_activities(client, auth_headers):
    client.post("/api/activities", json={"type": "Call", "subject": "A"}, headers=auth_headers)
    client.post("/api/activities", json={"type": "Email", "subject": "B"}, headers=auth_headers)
    r = client.get("/api/activities", headers=auth_headers)
    assert r.json()["total"] == 2


def test_list_activities_filter_by_contact(client, auth_headers):
    c1 = client.post("/api/contacts", json={"name": "Alice"}, headers=auth_headers).json()
    c2 = client.post("/api/contacts", json={"name": "Bob"}, headers=auth_headers).json()
    client.post("/api/activities", json={"type": "Call", "subject": "Alice call", "contact_id": c1["id"]}, headers=auth_headers)
    client.post("/api/activities", json={"type": "Call", "subject": "Bob call", "contact_id": c2["id"]}, headers=auth_headers)
    r = client.get(f"/api/activities?contact_id={c1['id']}", headers=auth_headers)
    assert r.json()["total"] == 1
    assert r.json()["items"][0]["subject"] == "Alice call"


def test_get_activity(client, auth_headers):
    created = client.post("/api/activities", json={"type": "Note", "subject": "Find"}, headers=auth_headers).json()
    r = client.get(f"/api/activities/{created['id']}", headers=auth_headers)
    assert r.status_code == 200


def test_update_activity(client, auth_headers):
    created = client.post("/api/activities", json={"type": "Call", "subject": "Old"}, headers=auth_headers).json()
    r = client.put(f"/api/activities/{created['id']}", json={"subject": "Updated"}, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["subject"] == "Updated"


def test_delete_activity(client, auth_headers):
    created = client.post("/api/activities", json={"type": "Call", "subject": "Delete"}, headers=auth_headers).json()
    r = client.delete(f"/api/activities/{created['id']}", headers=auth_headers)
    assert r.status_code == 204


def test_activities_require_auth(client):
    r = client.get("/api/activities")
    assert r.status_code == 403
