import os
import pytest
from datetime import date
from fastapi.testclient import TestClient

from app.models.models import (
    Gestion,
    Sede,
    Career,
    AcademicActivity,
    ScientificActivity,
    ScientificActivityType,
    ScientificActivityStatus,
    ScientificActivityEvidence,
    ActivityCategory,
)

def test_get_public_metadata(client: TestClient, db_session):
    # Setup test metadata
    gestion = Gestion(name="2026-I", start_date=date(2026, 1, 1), end_date=date(2026, 6, 30))
    sede = Sede(name="Cochabamba Test Sede")
    career = Career(name="Ingenieria de Sistemas", faculty="Facultad de Tecnologia")
    category = ActivityCategory(name="Examenes", code="EXAM", scope="both", color="#FF0000", is_active=True)

    db_session.add_all([gestion, sede, career, category])
    db_session.commit()

    response = client.get("/api/v1/public-portal/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "gestiones" in data
    assert "sedes" in data
    assert "careers" in data
    assert "categories" in data
    assert len(data["gestiones"]) >= 1
    assert any(g["name"] == "2026-I" for g in data["gestiones"])
    assert any(s["name"] == "Cochabamba Test Sede" for s in data["sedes"])
    assert any(c["name"] == "Ingenieria de Sistemas" for c in data["careers"])
    assert any(cat["code"] == "EXAM" for cat in data["categories"])


def test_get_public_calendar_empty(client: TestClient):
    response = client.get("/api/v1/public-portal/calendar")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert isinstance(data["items"], list)


def test_get_public_calendar_filtering(client: TestClient, db_session):
    gestion = Gestion(name="2026-II", start_date=date(2026, 7, 1), end_date=date(2026, 12, 31))
    career = Career(name="Medicina Portal", faculty="Salud")
    db_session.add_all([gestion, career])
    db_session.commit()

    academic_act = AcademicActivity(
        career_id=career.id,
        gestion_id=gestion.id,
        title="Evaluacion Final de Anatomia",
        start_date=date(2026, 11, 10),
        end_date=date(2026, 11, 12),
        category="Evaluacion",
    )

    scientific_act = ScientificActivity(
        career_id=career.id,
        gestion_id=gestion.id,
        title="Simposio Internacional de Bioquimica",
        activity_type=ScientificActivityType.congreso,
        start_date=date(2026, 11, 15),
        end_date=date(2026, 11, 17),
        responsible_name="Dr. Carlos Mendoza",
        status=ScientificActivityStatus.scheduled,
        notes="Evento publico abierto a investigadores",
    )

    db_session.add_all([academic_act, scientific_act])
    db_session.commit()

    # Query calendar without filters
    res = client.get("/api/v1/public-portal/calendar")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 2

    # Filter by search term
    res_search = client.get("/api/v1/public-portal/calendar?search=Anatomia")
    assert res_search.status_code == 200
    search_items = res_search.json()["items"]
    assert len(search_items) == 1
    assert search_items[0]["title"] == "Evaluacion Final de Anatomia"

    # Filter by gestion_id and career_id
    res_filtered = client.get(f"/api/v1/public-portal/calendar?gestion_id={gestion.id}&career_id={career.id}")
    assert res_filtered.status_code == 200
    assert len(res_filtered.json()["items"]) == 2


def test_get_public_event_detail(client: TestClient, db_session):
    gestion = Gestion(name="2026-III", start_date=date(2026, 1, 1), end_date=date(2026, 12, 31))
    career = Career(name="Farmacia", faculty="Salud")
    db_session.add_all([gestion, career])
    db_session.commit()

    scientific_act = ScientificActivity(
        career_id=career.id,
        gestion_id=gestion.id,
        title="Taller de Farmacologia Clinica",
        activity_type=ScientificActivityType.webinar,
        start_date=date(2026, 9, 1),
        end_date=date(2026, 9, 2),
        responsible_name="Dra. Ana Gomez",
        status=ScientificActivityStatus.scheduled,
        notes="Presentacion de casos clinicos",
    )
    db_session.add(scientific_act)
    db_session.commit()

    res = client.get(f"/api/v1/public-portal/events/scientific/{scientific_act.id}")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Taller de Farmacologia Clinica"
    assert data["source_type"] == "scientific"
    assert data["responsible_name"] == "Dra. Ana Gomez"
    assert data["career"]["name"] == "Farmacia"


def test_download_public_evidence_success(client: TestClient, db_session, tmp_path):
    # Create test file within current project / uploads directory
    test_dir = os.path.join(os.getcwd(), "uploads", "evidences", "test_public")
    os.makedirs(test_dir, exist_ok=True)
    test_file_path = os.path.join(test_dir, "sample_document.pdf")
    with open(test_file_path, "wb") as f:
        f.write(b"%PDF-1.4 Mock PDF Content for Public Testing")

    gestion = Gestion(name="2026-IV", start_date=date(2026, 1, 1), end_date=date(2026, 12, 31))
    db_session.add(gestion)
    db_session.commit()

    sci_act = ScientificActivity(
        gestion_id=gestion.id,
        title="Conferencia de Nanotecnologia",
        activity_type=ScientificActivityType.congreso,
        start_date=date(2026, 10, 1),
        end_date=date(2026, 10, 2),
        responsible_name="Dr. Roberto Paz",
    )
    db_session.add(sci_act)
    db_session.commit()

    evidence = ScientificActivityEvidence(
        scientific_activity_id=sci_act.id,
        filename="sample_document.pdf",
        file_path=test_file_path,
        file_type="application/pdf",
        file_size=len(b"%PDF-1.4 Mock PDF Content for Public Testing"),
    )
    db_session.add(evidence)
    db_session.commit()

    res = client.get(f"/api/v1/public-portal/evidences/{evidence.id}/download")
    assert res.status_code == 200
    assert b"Mock PDF Content" in res.content

    # Cleanup temp file
    if os.path.exists(test_file_path):
        os.remove(test_file_path)


def test_download_public_evidence_not_found(client: TestClient):
    res = client.get("/api/v1/public-portal/evidences/999999/download")
    assert res.status_code == 404


def test_download_public_evidence_path_traversal_prevention(client: TestClient, db_session):
    gestion = Gestion(name="2026-V", start_date=date(2026, 1, 1), end_date=date(2026, 12, 31))
    db_session.add(gestion)
    db_session.commit()

    sci_act = ScientificActivity(
        gestion_id=gestion.id,
        title="Jornada de Inmunologia",
        activity_type=ScientificActivityType.master_class,
        start_date=date(2026, 10, 5),
        end_date=date(2026, 10, 6),
        responsible_name="Dra. Elena Ramos",
    )
    db_session.add(sci_act)
    db_session.commit()

    # Evidence record with malicious path traversal attempt
    malicious_evidence = ScientificActivityEvidence(
        scientific_activity_id=sci_act.id,
        filename="passwd",
        file_path="../../etc/passwd",
        file_type="text/plain",
        file_size=100,
    )
    db_session.add(malicious_evidence)
    db_session.commit()

    res = client.get(f"/api/v1/public-portal/evidences/{malicious_evidence.id}/download")
    assert res.status_code == 400
    assert "path traversal" in res.json()["detail"].lower()
