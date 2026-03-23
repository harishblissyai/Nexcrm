import pytest


def test_create_contact(client, auth_headers):
    r = client.post("/api/contacts", json={"name": "Alice Smith", "email": "alice@acme.com", "company": "Acme"}, headers=auth_headers)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Alice Smith"
    assert data["email"] == "alice@acme.com"
    assert data["id"] is not None


def test_create_contact_missing_name(client, auth_headers):
    r = client.post("/api/contacts", json={"email": "no-name@test.com"}, headers=auth_headers)
    assert r.status_code == 422


def test_list_contacts_empty(client, auth_headers):
    r = client.get("/api/contacts", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["items"] == []
    assert data["total"] == 0


def test_list_contacts_pagination(client, auth_headers):
    for i in range(5):
        client.post("/api/contacts", json={"name": f"Contact {i}"}, headers=auth_headers)
    r = client.get("/api/contacts?page=1&size=3", headers=auth_headers)
    data = r.json()
    assert len(data["items"]) == 3
    assert data["total"] == 5
    assert data["pages"] == 2


def test_list_contacts_search(client, auth_headers):
    client.post("/api/contacts", json={"name": "John Doe", "company": "Acme"}, headers=auth_headers)
    client.post("/api/contacts", json={"name": "Jane Smith"}, headers=auth_headers)
    r = client.get("/api/contacts?search=Acme", headers=auth_headers)
    assert r.json()["total"] == 1
    assert r.json()["items"][0]["name"] == "John Doe"


def test_get_contact(client, auth_headers):
    created = client.post("/api/contacts", json={"name": "Bob"}, headers=auth_headers).json()
    r = client.get(f"/api/contacts/{created['id']}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["name"] == "Bob"


def test_get_contact_not_found(client, auth_headers):
    r = client.get("/api/contacts/9999", headers=auth_headers)
    assert r.status_code == 404


def test_update_contact(client, auth_headers):
    created = client.post("/api/contacts", json={"name": "Old Name"}, headers=auth_headers).json()
    r = client.put(f"/api/contacts/{created['id']}", json={"name": "New Name"}, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["name"] == "New Name"


def test_delete_contact(client, auth_headers):
    created = client.post("/api/contacts", json={"name": "To Delete"}, headers=auth_headers).json()
    r = client.delete(f"/api/contacts/{created['id']}", headers=auth_headers)
    assert r.status_code == 204
    r2 = client.get(f"/api/contacts/{created['id']}", headers=auth_headers)
    assert r2.status_code == 404


def test_contacts_require_auth(client):
    r = client.get("/api/contacts")
    assert r.status_code == 403
