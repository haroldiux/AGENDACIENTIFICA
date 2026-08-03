from unittest.mock import MagicMock

import pytest


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


def test_generate_conflict_pdf_report_dispatches_with_report_type(client, mock_pdf_task):
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


def test_generate_conflict_excel_report_dispatches_with_report_type(client, mock_excel_task):
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


def test_generate_table_pdf_report_keeps_existing_behavior(client, mock_pdf_task):
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


def test_generate_research_agenda_pdf_report_keeps_existing_behavior(client, mock_pdf_task):
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


def test_generate_table_excel_report_keeps_existing_behavior(client, mock_excel_task):
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


def test_generate_research_agenda_excel_report_keeps_existing_behavior(client, mock_excel_task):
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
