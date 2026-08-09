from datetime import date

import pytest

from app.api.deps import get_current_active_user
from app.core.security import get_password_hash
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


def _make_user(role: RoleEnum, user_id: int = 1, email: str = "test@example.com") -> User:
    """Build an in-memory mock user for dependency override."""
    return User(
        id=user_id,
        email=email,
        hashed_password="hashed_pw",
        full_name="Test User",
        role=role,
        is_active=True,
    )


def _seed_career_and_gestion(db_session):
    career = Career(name="Test Career", faculty="Test Faculty")
    gestion = Gestion(
        name="2026",
        start_date=date(2026, 1, 1),
        end_date=date(2026, 12, 31),
    )
    db_session.add_all([career, gestion])
    db_session.commit()
    db_session.refresh(career)
    db_session.refresh(gestion)
    return career, gestion


# -----------------------------------------------------------------------------
# JWT Authentication
# -----------------------------------------------------------------------------

def test_login_returns_token(client, db_session):
    user = User(
        email="auth@example.com",
        hashed_password=get_password_hash("secret"),
        full_name="Auth User",
        role=RoleEnum.admin,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        data={"username": "auth@example.com", "password": "secret"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client, db_session):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "missing@example.com", "password": "secret"},
    )
    assert response.status_code == 400
    assert "Incorrect email or password" in response.json()["detail"]


def test_protected_endpoint_requires_auth(client):
    response = client.get("/api/v1/academic/")
    assert response.status_code == 401


# -----------------------------------------------------------------------------
# Read-only GET-only enforcement
# -----------------------------------------------------------------------------

def test_read_only_user_can_get_activities(client, db_session):
    user = _make_user(RoleEnum.read_only)
    app.dependency_overrides[get_current_active_user] = lambda: user

    response = client.get("/api/v1/academic/")
    assert response.status_code == 200

    app.dependency_overrides.clear()


def test_read_only_user_cannot_create_activity(client, db_session):
    career, gestion = _seed_career_and_gestion(db_session)
    user = _make_user(RoleEnum.read_only)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "title": "Read-only attempt",
        "start_date": "2026-03-01",
        "end_date": "2026-03-01",
        "gestion_id": gestion.id,
        "career_id": career.id,
    }
    response = client.post("/api/v1/academic/", json=payload)
    assert response.status_code == 403
    assert "Read-only users are only allowed to perform GET requests" in response.json()["detail"]

    app.dependency_overrides.clear()


def test_read_only_user_cannot_update_activity(client, db_session):
    career, gestion = _seed_career_and_gestion(db_session)
    activity = AcademicActivity(
        title="Existing",
        start_date=date(2026, 3, 1),
        end_date=date(2026, 3, 1),
        category="GENERAL",
        career_id=career.id,
        gestion_id=gestion.id,
    )
    db_session.add(activity)
    db_session.commit()

    user = _make_user(RoleEnum.read_only)
    app.dependency_overrides[get_current_active_user] = lambda: user

    response = client.put(
        f"/api/v1/academic/{activity.id}",
        json={"title": "Updated"},
    )
    assert response.status_code == 403

    app.dependency_overrides.clear()


def test_read_only_user_cannot_generate_report(client, db_session):
    user = _make_user(RoleEnum.read_only)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "gestion_id": 1,
        "format": "pdf",
        "report_type": "table",
    }
    response = client.post("/api/v1/reports/generate", json=payload)
    assert response.status_code == 403

    app.dependency_overrides.clear()


def test_read_only_user_can_download_template(client, db_session):
    user = _make_user(RoleEnum.read_only)
    app.dependency_overrides[get_current_active_user] = lambda: user

    response = client.get("/api/v1/importacion/template/download")
    assert response.status_code == 200

    app.dependency_overrides.clear()


# -----------------------------------------------------------------------------
# Scope-aware permissions
# -----------------------------------------------------------------------------

def test_coordinator_can_create_activity_in_own_career(client, db_session):
    career, gestion = _seed_career_and_gestion(db_session)
    user = _make_user(RoleEnum.coordinator)
    user.careers.append(career)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "title": "Own career activity",
        "start_date": "2026-03-01",
        "end_date": "2026-03-01",
        "gestion_id": gestion.id,
        "career_id": career.id,
    }
    response = client.post("/api/v1/academic/", json=payload)
    assert response.status_code == 201

    app.dependency_overrides.clear()


def test_coordinator_cannot_create_activity_in_other_career(client, db_session):
    career_a, gestion = _seed_career_and_gestion(db_session)
    career_b = Career(name="Other Career", faculty="Other Faculty")
    db_session.add(career_b)
    db_session.commit()

    user = _make_user(RoleEnum.coordinator)
    user.careers.append(career_a)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "title": "Other career activity",
        "start_date": "2026-03-01",
        "end_date": "2026-03-01",
        "gestion_id": gestion.id,
        "career_id": career_b.id,
    }
    response = client.post("/api/v1/academic/", json=payload)
    assert response.status_code == 403
    assert "Not authorized to manage activities for this career" in response.json()["detail"]

    app.dependency_overrides.clear()


def test_coordinator_cannot_create_global_activity(client, db_session):
    _, gestion = _seed_career_and_gestion(db_session)
    user = _make_user(RoleEnum.coordinator)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "title": "Global activity",
        "start_date": "2026-03-01",
        "end_date": "2026-03-01",
        "gestion_id": gestion.id,
    }
    response = client.post("/api/v1/academic/", json=payload)
    assert response.status_code == 403
    assert "Not authorized to manage global institutional activities" in response.json()["detail"]

    app.dependency_overrides.clear()


def test_vicerrectorado_can_create_global_activity(client, db_session):
    _, gestion = _seed_career_and_gestion(db_session)
    user = _make_user(RoleEnum.vicerrectorado)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "title": "Global activity",
        "start_date": "2026-03-01",
        "end_date": "2026-03-01",
        "gestion_id": gestion.id,
    }
    response = client.post("/api/v1/academic/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["career_id"] is None

    app.dependency_overrides.clear()


def test_teacher_cannot_create_activity(client, db_session):
    career, gestion = _seed_career_and_gestion(db_session)
    user = _make_user(RoleEnum.teacher)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "title": "Teacher activity",
        "start_date": "2026-03-01",
        "end_date": "2026-03-01",
        "gestion_id": gestion.id,
        "career_id": career.id,
    }
    response = client.post("/api/v1/academic/", json=payload)
    assert response.status_code == 403
    assert "Not authorized to modify activities" in response.json()["detail"]

    app.dependency_overrides.clear()


def test_scope_permission_applies_to_scientific_update(client, db_session):
    career_a, gestion = _seed_career_and_gestion(db_session)
    career_b = Career(name="Other Career", faculty="Other Faculty")
    db_session.add(career_b)
    db_session.commit()

    activity = ScientificActivity(
        title="Research A",
        activity_type=ScientificActivityType.congreso,
        start_date=date(2026, 3, 1),
        end_date=date(2026, 3, 2),
        responsible_name="Dr. A",
        career_id=career_a.id,
        gestion_id=gestion.id,
        status=ScientificActivityStatus.scheduled,
    )
    db_session.add(activity)
    db_session.commit()

    user = _make_user(RoleEnum.jefe_investigacion)
    user.careers.append(career_b)
    app.dependency_overrides[get_current_active_user] = lambda: user

    response = client.put(
        f"/api/v1/scientific/{activity.id}",
        json={"title": "Hacked"},
    )
    assert response.status_code == 403

    app.dependency_overrides.clear()


def test_actividades_endpoint_enforces_scope(client, db_session):
    career, gestion = _seed_career_and_gestion(db_session)
    user = _make_user(RoleEnum.coordinator)
    user.careers.append(career)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "title": "Scoped via actividades",
        "start_date": "2026-03-01",
        "end_date": "2026-03-01",
        "gestion_id": gestion.id,
        "career_id": career.id,
        "is_scientific": False,
        "category": "GENERAL",
    }
    response = client.post("/api/v1/actividades/", json=payload)
    # The actividades endpoint does not define a response_model; we only
    # verify that scope permission is enforced and the request is accepted.
    assert response.status_code == 201

    app.dependency_overrides.clear()
