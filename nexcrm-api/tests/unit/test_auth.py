import pytest


def test_register_success(client):
    r = client.post("/api/auth/register", json={
        "email": "new@nexcrm.io",
        "full_name": "New User",
        "password": "pass1234",
    })
    assert r.status_code == 201
    data = r.json()
    assert data["email"] == "new@nexcrm.io"
    assert data["full_name"] == "New User"
    assert "hashed_password" not in data


def test_register_duplicate_email(client, registered_user):
    r = client.post("/api/auth/register", json={
        "email": "test@nexcrm.io",
        "full_name": "Dupe",
        "password": "pass1234",
    })
    assert r.status_code == 400


def test_login_success(client, registered_user):
    r = client.post("/api/auth/login", json={
        "email": "test@nexcrm.io",
        "password": "secret123",
    })
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, registered_user):
    r = client.post("/api/auth/login", json={
        "email": "test@nexcrm.io",
        "password": "wrongpass",
    })
    assert r.status_code == 401


def test_login_unknown_email(client):
    r = client.post("/api/auth/login", json={
        "email": "nobody@nexcrm.io",
        "password": "pass1234",
    })
    assert r.status_code == 401


def test_me_authenticated(client, auth_headers):
    r = client.get("/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == "test@nexcrm.io"


def test_me_no_token(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 403


def test_me_invalid_token(client):
    r = client.get("/api/auth/me", headers={"Authorization": "Bearer badtoken"})
    assert r.status_code == 401
