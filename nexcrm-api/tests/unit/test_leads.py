import pytest


def test_create_lead(client, auth_headers):
    r = client.post("/api/leads", json={"title": "Big Deal", "status": "New", "value": 5000}, headers=auth_headers)
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "Big Deal"
    assert data["status"] == "New"
    assert data["value"] == 5000


def test_create_lead_missing_title(client, auth_headers):
    r = client.post("/api/leads", json={"status": "New"}, headers=auth_headers)
    assert r.status_code == 422


def test_create_lead_invalid_status(client, auth_headers):
    r = client.post("/api/leads", json={"title": "Bad", "status": "InvalidStatus"}, headers=auth_headers)
    assert r.status_code == 422


def test_list_leads_empty(client, auth_headers):
    r = client.get("/api/leads", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["total"] == 0


def test_list_leads_filter_by_status(client, auth_headers):
    client.post("/api/leads", json={"title": "Lead A", "status": "New"}, headers=auth_headers)
    client.post("/api/leads", json={"title": "Lead B", "status": "Qualified"}, headers=auth_headers)
    r = client.get("/api/leads?status=New", headers=auth_headers)
    data = r.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Lead A"


def test_get_lead(client, auth_headers):
    created = client.post("/api/leads", json={"title": "Find Me"}, headers=auth_headers).json()
    r = client.get(f"/api/leads/{created['id']}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["title"] == "Find Me"


def test_get_lead_not_found(client, auth_headers):
    r = client.get("/api/leads/9999", headers=auth_headers)
    assert r.status_code == 404


def test_update_lead(client, auth_headers):
    created = client.post("/api/leads", json={"title": "Old", "status": "New"}, headers=auth_headers).json()
    r = client.put(f"/api/leads/{created['id']}", json={"title": "Updated", "status": "Contacted"}, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["title"] == "Updated"
    assert r.json()["status"] == "Contacted"


def test_update_lead_status(client, auth_headers):
    created = client.post("/api/leads", json={"title": "Status Test"}, headers=auth_headers).json()
    r = client.patch(f"/api/leads/{created['id']}/status", json={"status": "ClosedWon"}, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "ClosedWon"


def test_delete_lead(client, auth_headers):
    created = client.post("/api/leads", json={"title": "Delete Me"}, headers=auth_headers).json()
    r = client.delete(f"/api/leads/{created['id']}", headers=auth_headers)
    assert r.status_code == 204


def test_leads_with_contact(client, auth_headers):
    contact = client.post("/api/contacts", json={"name": "Bob"}, headers=auth_headers).json()
    lead = client.post("/api/leads", json={"title": "Bob's Deal", "contact_id": contact["id"]}, headers=auth_headers).json()
    assert lead["contact_id"] == contact["id"]


def test_leads_require_auth(client):
    r = client.get("/api/leads")
    assert r.status_code == 403
