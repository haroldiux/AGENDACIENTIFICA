from unittest.mock import MagicMock

import pytest

from app.api.deps import get_current_active_user
from app.main import app
from app.models.models import RoleEnum, User


def _make_user(role: RoleEnum = RoleEnum.admin) -> User:
    return User(
        id=1,
        email="reports@example.com",
        hashed_password="hashed_pw",
        full_name="Reports User",
        role=role,
        is_active=True,
    )


@pytest.fixture
def authenticated_user():
    user = _make_user()
    app.dependency_overrides[get_current_active_user] = lambda: user
    yield user
    app.dependency_overrides.clear()


@pytest.fixture
def mock_pdf_task(monkeypatch):
    mock = MagicMock()
    mock.delay.return_value = MagicMock(id="pdf-task-id")
    monkeypatch.setattr("app.api.v1.reports.generate_pdf_report_task", mock)
    return mock


@pytest.fixture
def mock_excel_task(monkeypatch):
    mock = MagicMock()
    mock.delay.return_value = MagicMock(id="excel-task-id")
    monkeypatch.setattr("app.api.v1.reports.generate_excel_report_task", mock)
    return mock


@pytest.fixture(autouse=True)
def mock_celery_broker(monkeypatch):
    """Bypass Celery broker health check in report generation endpoint."""
    monkeypatch.setattr("app.api.v1.reports._check_celery_broker", lambda: None)


def test_generate_conflict_pdf_report_dispatches_with_report_type(client, authenticated_user, mock_pdf_task):
    response = client.post(
        "/api/v1/reports/generate",
        json={
            "career_id": 1,
            "gestion_id": 2,
            "format": "pdf",
            "report_type": "conflict",
        },
    )

    assert response.status_code == 200
    assert response.json()["task_id"] == "pdf-task-id"
    mock_pdf_task.delay.assert_called_once_with(1, 2, "conflict")


def test_generate_conflict_excel_report_dispatches_with_report_type(client, authenticated_user, mock_excel_task):
    response = client.post(
        "/api/v1/reports/generate",
        json={
            "career_id": 1,
            "gestion_id": 2,
            "format": "excel",
            "report_type": "conflict",
        },
    )

    assert response.status_code == 200
    assert response.json()["task_id"] == "excel-task-id"
    mock_excel_task.delay.assert_called_once_with(1, 2, "conflict")


def test_generate_table_pdf_report_keeps_existing_behavior(client, authenticated_user, mock_pdf_task):
    response = client.post(
        "/api/v1/reports/generate",
        json={
            "career_id": 1,
            "gestion_id": 2,
            "format": "pdf",
            "report_type": "table",
        },
    )

    assert response.status_code == 200
    mock_pdf_task.delay.assert_called_once_with(1, 2, "table")


def test_generate_research_agenda_pdf_report_keeps_existing_behavior(client, authenticated_user, mock_pdf_task):
    response = client.post(
        "/api/v1/reports/generate",
        json={
            "career_id": 1,
            "gestion_id": 2,
            "format": "pdf",
            "report_type": "research-agenda",
        },
    )

    assert response.status_code == 200
    mock_pdf_task.delay.assert_called_once_with(1, 2, "research-agenda")


def test_generate_table_excel_report_keeps_existing_behavior(client, authenticated_user, mock_excel_task):
    response = client.post(
        "/api/v1/reports/generate",
        json={
            "career_id": 1,
            "gestion_id": 2,
            "format": "excel",
            "report_type": "table",
        },
    )

    assert response.status_code == 200
    mock_excel_task.delay.assert_called_once_with(1, 2, "table")


def test_generate_research_agenda_excel_report_keeps_existing_behavior(client, authenticated_user, mock_excel_task):
    response = client.post(
        "/api/v1/reports/generate",
        json={
            "career_id": 1,
            "gestion_id": 2,
            "format": "excel",
            "report_type": "research-agenda",
        },
    )

    assert response.status_code == 200
    mock_excel_task.delay.assert_called_once_with(1, 2, "research-agenda")
