import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.core.security import create_access_token

# In-memory SQLite for fast, isolated test suite
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers_user1(client):
    # Register and login user 1
    resp = client.post("/api/v1/auth/register", json={
        "email": "user1@example.com",
        "password": "Password123!",
        "full_name": "Alice Smith",
        "terms_accepted": True
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_user2(client):
    # Register and login user 2
    resp = client.post("/api/v1/auth/register", json={
        "email": "user2@example.com",
        "password": "Password123!",
        "full_name": "Bob Jones",
        "terms_accepted": True
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
