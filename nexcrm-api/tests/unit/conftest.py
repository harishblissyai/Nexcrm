import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app

TEST_DB = "sqlite:///./data/test.db"

engine = create_engine(TEST_DB, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client):
    r = client.post("/api/auth/register", json={
        "email": "test@nexcrm.io",
        "full_name": "Test User",
        "password": "secret123",
    })
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def auth_headers(client):
    client.post("/api/auth/register", json={
        "email": "test@nexcrm.io",
        "full_name": "Test User",
        "password": "secret123",
    })
    r = client.post("/api/auth/login", json={
        "email": "test@nexcrm.io",
        "password": "secret123",
    })
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
