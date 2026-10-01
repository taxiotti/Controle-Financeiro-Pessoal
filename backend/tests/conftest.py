import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app
from app.seed import seed


@pytest.fixture
def api(tmp_path, monkeypatch):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
    )

    @event.listens_for(engine, "connect")
    def foreign_keys(connection, _):
        connection.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    monkeypatch.setattr(settings, "dev_user_password", "test-password")
    with Session(engine) as db:
        seed(db)

    def override_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = override_db
    client = TestClient(app)
    login = client.post("/api/auth/login", json={
        "email": settings.dev_user_email.strip().lower(),
        "senha": "test-password",
    })
    assert login.status_code == 200, login.text
    client.headers["Authorization"] = f"Bearer {login.json()['accessToken']}"
    yield client, engine
    client.close()
    app.dependency_overrides.clear()
    engine.dispose()
