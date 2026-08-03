from datetime import date
from unittest.mock import MagicMock, patch

import pytest

from app.schemas.schemas import ConflictItem, ScientificActivityType
from app.workers.reports_worker import (
    build_conflict_pdf,
    build_conflict_excel,
    generate_pdf_report_task,
    generate_excel_report_task,
)


def _sample_conflicts():
    return [
        ConflictItem(
            academic_id=1,
            academic_title="Academic One",
            academic_start_date=date(2026, 3, 1),
            academic_end_date=date(2026, 3, 3),
            scientific_id=2,
            scientific_title="Scientific One",
            scientific_type=ScientificActivityType.congreso,
            scientific_start_date=date(2026, 3, 3),
            scientific_end_date=date(2026, 3, 5),
        ),
        ConflictItem(
            academic_id=3,
            academic_title="Academic Two",
            academic_start_date=date(2026, 4, 8),
            academic_end_date=date(2026, 4, 15),
            scientific_id=4,
            scientific_title="Scientific Two",
            scientific_type=ScientificActivityType.webinar,
            scientific_start_date=date(2026, 4, 10),
            scientific_end_date=date(2026, 4, 12),
        ),
    ]


def test_build_conflict_pdf_creates_non_empty_file():
    conflicts = _sample_conflicts()

    result = build_conflict_pdf(conflicts, career_id=1, gestion_id=1)

    assert result["status"] == "completed"
    assert result["file_path"]
    assert result["file_name"]
    import os

    assert os.path.exists(result["file_path"])
    assert os.path.getsize(result["file_path"]) > 0


def test_build_conflict_pdf_empty_conflicts_creates_file():
    result = build_conflict_pdf([], career_id=1, gestion_id=1)

    assert result["status"] == "completed"
    assert result["file_path"]
    import os

    assert os.path.exists(result["file_path"])


def test_build_conflict_excel_creates_non_empty_file():
    conflicts = _sample_conflicts()

    result = build_conflict_excel(conflicts, career_id=1, gestion_id=1)

    assert result["status"] == "completed"
    assert result["file_path"]
    assert result["file_name"]
    import os

    assert os.path.exists(result["file_path"])
    assert os.path.getsize(result["file_path"]) > 0


def test_build_conflict_excel_empty_conflicts_creates_file():
    result = build_conflict_excel([], career_id=1, gestion_id=1)

    assert result["status"] == "completed"
    assert result["file_path"]
    import os

    assert os.path.exists(result["file_path"])


def test_generate_pdf_report_task_conflict_branch_uses_service(monkeypatch):
    conflicts = _sample_conflicts()
    mock_db = MagicMock()
    mock_session_local = MagicMock(return_value=mock_db)
    monkeypatch.setattr("app.workers.reports_worker.SessionLocal", mock_session_local)

    with patch("app.workers.reports_worker.conflict_service.find_conflicts", return_value=conflicts) as mock_find:
        result = generate_pdf_report_task(career_id=1, gestion_id=2, report_type="conflict")

    assert result["status"] == "completed"
    assert result["file_path"]
    assert result["file_name"]
    mock_session_local.assert_called_once()
    mock_find.assert_called_once_with(mock_db, 1, 2)


def test_generate_excel_report_task_conflict_branch_uses_service(monkeypatch):
    conflicts = _sample_conflicts()
    mock_db = MagicMock()
    mock_session_local = MagicMock(return_value=mock_db)
    monkeypatch.setattr("app.workers.reports_worker.SessionLocal", mock_session_local)

    with patch("app.workers.reports_worker.conflict_service.find_conflicts", return_value=conflicts) as mock_find:
        result = generate_excel_report_task(career_id=1, gestion_id=2, report_type="conflict")

    assert result["status"] == "completed"
    assert result["file_path"]
    assert result["file_name"]
    mock_session_local.assert_called_once()
    mock_find.assert_called_once_with(mock_db, 1, 2)
