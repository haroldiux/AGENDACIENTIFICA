import pytest
from datetime import date
from unittest.mock import patch, MagicMock

from app.models.models import (
    AcademicActivity,
    ScientificActivity,
    ScientificActivityType,
    Career,
    Gestion,
    Sede,
    User,
    RoleEnum,
)
from app.services.conflict_service import find_conflicts
from app.schemas.schemas import ReportRequest


def test_find_conflicts_respects_sedes(db_session):
    sede_cbb = Sede(name="Sede Cochabamba")
    sede_scz = Sede(name="Sede Santa Cruz")
    gestion = Gestion(name="2027-1", start_date=date(2027, 1, 1), end_date=date(2027, 6, 30))
    career = Career(name="Medicina", faculty="Salud")
    db_session.add_all([sede_cbb, sede_scz, gestion, career])
    db_session.flush()

    # Academic in Cochabamba
    acad = AcademicActivity(
        title="Examen Parcial Cochabamba",
        start_date=date(2027, 3, 10),
        end_date=date(2027, 3, 15),
        category="examen",
        career_id=career.id,
        gestion_id=gestion.id,
        sede_id=sede_cbb.id,
    )
    # Scientific in Santa Cruz (different sede -> no conflict)
    sci_scz = ScientificActivity(
        title="Webinar Investigación Santa Cruz",
        start_date=date(2027, 3, 12),
        end_date=date(2027, 3, 14),
        activity_type=ScientificActivityType.webinar,
        responsible_name="Resp Santa Cruz",
        career_id=career.id,
        gestion_id=gestion.id,
        sede_id=sede_scz.id,
    )
    # Scientific in Cochabamba (same sede -> conflicts)
    sci_cbb = ScientificActivity(
        title="Congreso Cochabamba",
        start_date=date(2027, 3, 11),
        end_date=date(2027, 3, 13),
        activity_type=ScientificActivityType.congreso,
        responsible_name="Resp Cochabamba",
        career_id=career.id,
        gestion_id=gestion.id,
        sede_id=sede_cbb.id,
    )
    # Scientific National (sede_id is None -> conflicts with all)
    sci_national = ScientificActivity(
        title="Feria Nacional",
        start_date=date(2027, 3, 10),
        end_date=date(2027, 3, 10),
        activity_type=ScientificActivityType.feria,
        responsible_name="Resp Nacional",
        career_id=None,
        gestion_id=gestion.id,
        sede_id=None,
    )
    db_session.add_all([acad, sci_scz, sci_cbb, sci_national])
    db_session.commit()

    # Find conflicts for Sede Santa Cruz
    conflicts_scz = find_conflicts(db_session, career_id=None, gestion_id=gestion.id, sede_id=sede_scz.id)
    # acad is in Cochabamba, sci_scz is in SCZ (no conflict with acad)
    assert not any(c.scientific_title == "Webinar Investigación Santa Cruz" for c in conflicts_scz)

    # Find conflicts for Sede Cochabamba
    conflicts_cbb = find_conflicts(db_session, career_id=None, gestion_id=gestion.id, sede_id=sede_cbb.id)
    # sci_cbb conflicts with acad
    assert any(c.scientific_title == "Congreso Cochabamba" for c in conflicts_cbb)
    # sci_national also conflicts with acad
    assert any(c.scientific_title == "Feria Nacional" for c in conflicts_cbb)


def test_dashboard_stats_filters_by_sede(client, db_session):
    sede_cbb = Sede(name="Sede Cochabamba Dashboard")
    sede_lpz = Sede(name="Sede La Paz Dashboard")
    gestion = Gestion(name="2027-D", start_date=date(2027, 1, 1), end_date=date(2027, 6, 30))
    career = Career(name="Derecho", faculty="Sociales")
    db_session.add_all([sede_cbb, sede_lpz, gestion, career])
    db_session.flush()

    user_admin = User(
        email="superadmin@unitepc.edu.bo",
        hashed_password="pw",
        full_name="Admin User",
        role=RoleEnum.admin,
        is_active=True,
    )
    db_session.add(user_admin)
    db_session.flush()

    acad_cbb = AcademicActivity(
        title="Actividad CBB",
        start_date=date(2027, 2, 1),
        end_date=date(2027, 2, 5),
        category="academica",
        career_id=career.id,
        gestion_id=gestion.id,
        sede_id=sede_cbb.id,
    )
    acad_lpz = AcademicActivity(
        title="Actividad LPZ",
        start_date=date(2027, 2, 1),
        end_date=date(2027, 2, 5),
        category="academica",
        career_id=career.id,
        gestion_id=gestion.id,
        sede_id=sede_lpz.id,
    )
    db_session.add_all([acad_cbb, acad_lpz])
    db_session.commit()

    from app.api.deps import get_current_active_user
    from app.main import app

    app.dependency_overrides[get_current_active_user] = lambda: user_admin

    try:
        # All sedes
        resp_all = client.get(f"/api/v1/dashboard/stats?gestion_id={gestion.id}")
        assert resp_all.status_code == 200
        assert resp_all.json()["counts"]["total_academic"] == 2

        # Filter by Cochabamba
        resp_cbb = client.get(f"/api/v1/dashboard/stats?gestion_id={gestion.id}&sede_id={sede_cbb.id}")
        assert resp_cbb.status_code == 200
        assert resp_cbb.json()["counts"]["total_academic"] == 1

        # Sede scoped user can only see their sede
        user_vicerrector = User(
            email="vicerrector.cbb@unitepc.edu.bo",
            hashed_password="pw",
            full_name="Vicerrector CBB",
            role=RoleEnum.vicerrector_sede,
            sede_id=sede_cbb.id,
            is_active=True,
        )
        app.dependency_overrides[get_current_active_user] = lambda: user_vicerrector
        resp_vr = client.get(f"/api/v1/dashboard/stats?gestion_id={gestion.id}")
        assert resp_vr.status_code == 200
        assert resp_vr.json()["counts"]["total_academic"] == 1
    finally:
        app.dependency_overrides.clear()


def test_reports_generate_accepts_sede_id(client, db_session):
    user_admin = User(
        email="admin.rep@unitepc.edu.bo",
        hashed_password="pw",
        full_name="Admin Rep",
        role=RoleEnum.admin,
        is_active=True,
    )
    db_session.add(user_admin)
    db_session.commit()

    from app.api.deps import require_read_only_get
    from app.main import app

    app.dependency_overrides[require_read_only_get] = lambda: user_admin

    try:
        with patch("app.api.v1.reports._check_celery_broker"), \
             patch("app.api.v1.reports.generate_pdf_report_task.delay") as mock_delay:
            mock_delay.return_value = MagicMock(id="test-task-123")
            resp = client.post(
                "/api/v1/reports/generate",
                json={
                    "career_id": 1,
                    "gestion_id": 1,
                    "format": "pdf",
                    "report_type": "agenda-completa",
                    "sede_id": 5,
                },
            )
            assert resp.status_code == 200
            mock_delay.assert_called_once_with(1, 1, "agenda-completa", None, sede_id=5)
    finally:
        app.dependency_overrides.clear()
