"""Shared fixtures for the Playwright E2E suite."""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

# Make backend code importable from the e2e folder
BACKEND_ROOT = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

# Force the backend (and this fixture code) to use the same SQLite database
DB_PATH = Path(__file__).resolve().parent / "test.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{DB_PATH}")

from sqlalchemy.orm import sessionmaker

from app.db.session import engine
from app.models.models import AcademicActivity, ScientificActivity
from e2e.seed import create_tables, seed_base_data, seed_all_test_users


@pytest.fixture(scope="function", autouse=True)
def _clean_e2e_test_data():
    """Remove activities created by previous E2E test runs."""
    Session = sessionmaker(bind=engine)
    with Session() as session:
        session.query(ScientificActivity).filter(
            ScientificActivity.title.like("%E2E%")
        ).delete(synchronize_session=False)
        session.query(AcademicActivity).filter(
            AcademicActivity.title.like("%E2E%")
        ).delete(synchronize_session=False)
        session.commit()
    yield


@pytest.fixture(scope="session", autouse=True)
def _setup_database():
    """Recreate the SQLite test database and seed reference data once per run."""
    create_tables(engine)
    Session = sessionmaker(bind=engine)
    with Session() as session:
        seed_base_data(session)
        seed_all_test_users(session)
    yield


@pytest.fixture(scope="function")
def db_session():
    """Provide a fresh DB session for a single test."""
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="session")
def base_url():
    return os.environ.get("BASE_URL", "http://localhost:3002")


@pytest.fixture(scope="session")
def api_url():
    return os.environ.get("API_URL", "http://localhost:8000/api/v1")


@pytest.fixture(scope="session")
def default_password():
    return "password"
