import pytest
from app.db.base import Base
from app.db.session import get_db
from fastapi.testclient import TestClient
from main import app
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker


# --- SQLite Pragma Listener ---
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()


# --- SQLite In-Memory Engine ---
@pytest.fixture(scope="session")
def engine():
    """
    Creates and yields a SQLite in-memory database engine for testing.
    Scope is 'session' so engine is reused across all tests.
    Yields a connection that is closed after all tests complete.
    """
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    connection = engine.connect()
    yield connection
    connection.close()


# --- Database Session ---
@pytest.fixture(scope="function")
def db_session(engine):
    """
    Creates a fresh database session for each test function.
    Drops and recreates all tables before each test.
    Yields a SQLAlchemy session that is closed after the test.
    Depends on the engine fixture.
    """
    # Renew DB before each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """
    Creates a FastAPI TestClient with an overridden database session.
    Scope is 'function' so each test gets a fresh client.
    Overrides the get_db dependency to use the test database session.
    Depends on db_session fixture.
    """

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    del app.dependency_overrides[get_db]
