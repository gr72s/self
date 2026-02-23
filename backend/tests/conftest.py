import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.core.database import Base, get_db
from main import app


# Test environment
os.environ["SELF_ENV"] = "testing"
settings = get_settings()


engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a test database session."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    try:
        from app.models import User
        from app.services.auth import AuthService

        if not db.query(User).first():
            AuthService.create_user(
                db,
                username="testuser",
                password="testpassword",
                nickname="Test User",
            )
            db.commit()

        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client."""

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db):
    """Get test user."""
    from app.models import User

    return db.query(User).first()


@pytest.fixture(scope="function")
def test_token(client, test_user):
    """Get access token for test user."""
    response = client.post(
        "/api/users/login",
        data={
            "username": "testuser",
            "password": "testpassword",
        },
    )

    assert response.status_code == 200
    return response.json()["access_token"]
