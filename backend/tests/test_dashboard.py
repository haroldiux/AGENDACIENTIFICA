from datetime import date, timedelta
import pytest
from app.api.deps import get_current_active_user
from app.main import app
from app.models.models import (
    AcademicActivity,
    Career,
    Gestion,
    RoleEnum,
    ScientificActivity,
    ScientificActivityStatus,
    ScientificActivityType,
    User,
)


def _create_user(db_session, email="admin@example.com", role=RoleEnum.admin, careers=None):
    user = User(
        email=email,
        hashed_password="hashed_pw",
        full_name="Test User",
        role=role,
        is_active=True,
    )
    if careers:
        user.careers.extend(careers)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_dashboard_stats_zero_division_and_structure(client, db_session):
    user = _create_user(db_session, email="admin1@example.com", role=RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: user

    try:
        # Create active gestion
        today = date.today()
        gestion = Gestion(
            name="Gestion 2026 Test",
            start_date=today - timedelta(days=30),
            end_date=today + timedelta(days=30),
        )
        db_session.add(gestion)
        db_session.commit()

        response = client.get("/api/v1/dashboard/stats")
        assert response.status_code == 200
        data = response.json()

        assert data["active_gestion"]["id"] == gestion.id
        assert data["active_gestion"]["name"] == "Gestion 2026 Test"
        assert data["counts"]["total_scientific"] == 0
        assert data["counts"]["completion_rate"] == 0.0
        assert len(data["monthly_timeline"]) == 12
        assert isinstance(data["career_breakdown"], list)
        assert isinstance(data["recent_audits"], list)
        assert isinstance(data["next_events"], list)
    finally:
        app.dependency_overrides.clear()


def test_dashboard_stats_role_scoping(client, db_session):
    c1 = Career(name="Sistemas", faculty="Ingenieria")
    c2 = Career(name="Medicina", faculty="Salud")
    db_session.add_all([c1, c2])
    db_session.commit()

    coord = _create_user(
        db_session,
        email="coord@example.com",
        role=RoleEnum.coordinator,
        careers=[c1],
    )
    app.dependency_overrides[get_current_active_user] = lambda: coord

    try:
        # Authorized career query
        res_ok = client.get(f"/api/v1/dashboard/stats?career_id={c1.id}")
        assert res_ok.status_code == 200

        # Unauthorized career query -> HTTP 403
        res_forbidden = client.get(f"/api/v1/dashboard/stats?career_id={c2.id}")
        assert res_forbidden.status_code == 403
    finally:
        app.dependency_overrides.clear()


def test_dashboard_stats_date_windows(client, db_session):
    user = _create_user(db_session, email="admin2@example.com", role=RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: user

    try:
        today = date.today()
        gestion = Gestion(
            name="Gestion Date Test",
            start_date=today - timedelta(days=10),
            end_date=today + timedelta(days=60),
        )
        c = Career(name="Industrial", faculty="Ingenieria")
        db_session.add_all([gestion, c])
        db_session.commit()

        # Scientific activity starting in 3 days (within 7 and 30 days)
        act1 = ScientificActivity(
            title="Act 7 Days",
            activity_type=ScientificActivityType.congreso,
            start_date=today + timedelta(days=3),
            end_date=today + timedelta(days=4),
            responsible_name="Dr. Test",
            status=ScientificActivityStatus.scheduled,
            gestion_id=gestion.id,
            career_id=c.id,
        )
        # Scientific activity starting in 15 days (within 30 days, not 7 days)
        act2 = ScientificActivity(
            title="Act 30 Days",
            activity_type=ScientificActivityType.webinar,
            start_date=today + timedelta(days=15),
            end_date=today + timedelta(days=16),
            responsible_name="Dr. Test 2",
            status=ScientificActivityStatus.completed,
            gestion_id=gestion.id,
            career_id=c.id,
        )
        db_session.add_all([act1, act2])
        db_session.commit()

        response = client.get(f"/api/v1/dashboard/stats?gestion_id={gestion.id}")
        assert response.status_code == 200
        data = response.json()

        assert data["counts"]["total_scientific"] == 2
        assert data["counts"]["upcoming_7_days"] == 1
        assert data["counts"]["upcoming_30_days"] == 2
        assert data["counts"]["completed_scientific"] == 1
        assert data["counts"]["completion_rate"] == 50.0
    finally:
        app.dependency_overrides.clear()
