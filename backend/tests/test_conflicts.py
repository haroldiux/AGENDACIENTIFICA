from datetime import date

import pytest

from app.models.models import (
    AcademicActivity,
    Career,
    Gestion,
    ScientificActivity,
    ScientificActivityStatus,
    ScientificActivityType,
)
from app.schemas.schemas import ConflictListResponse
from app.services.conflict_service import _overlaps, find_conflicts
from app.api.deps import get_current_active_user
from app.main import app
from app.models.models import User, RoleEnum


def _make_user(role: RoleEnum = RoleEnum.admin) -> User:
    return User(
        id=1,
        email="conflicts@example.com",
        hashed_password="hashed_pw",
        full_name="Conflicts User",
        role=role,
        is_active=True,
    )


@pytest.fixture
def authenticated_user():
    user = _make_user()
    app.dependency_overrides[get_current_active_user] = lambda: user
    yield user
    app.dependency_overrides.clear()


# --- Unit tests for overlap predicate ---

def test_overlaps_same_day():
    academic_start = date(2026, 3, 1)
    academic_end = date(2026, 3, 3)
    scientific_start = date(2026, 3, 3)
    scientific_end = date(2026, 3, 5)
    assert _overlaps(academic_start, academic_end, scientific_start, scientific_end) is True


def test_overlaps_contained():
    academic_start = date(2026, 3, 1)
    academic_end = date(2026, 3, 10)
    scientific_start = date(2026, 3, 3)
    scientific_end = date(2026, 3, 5)
    assert _overlaps(academic_start, academic_end, scientific_start, scientific_end) is True


def test_overlaps_touching():
    academic_start = date(2026, 3, 1)
    academic_end = date(2026, 3, 3)
    scientific_start = date(2026, 3, 4)
    scientific_end = date(2026, 3, 5)
    assert _overlaps(academic_start, academic_end, scientific_start, scientific_end) is False


def test_overlaps_disjoint():
    academic_start = date(2026, 3, 1)
    academic_end = date(2026, 3, 3)
    scientific_start = date(2026, 3, 5)
    scientific_end = date(2026, 3, 7)
    assert _overlaps(academic_start, academic_end, scientific_start, scientific_end) is False


# --- Service integration tests ---

def _seed_career_and_gestion(db_session):
    career = Career(name="Test Career", faculty="Test Faculty")
    gestion = Gestion(
        name="2026",
        start_date=date(2026, 1, 1),
        end_date=date(2026, 12, 31),
    )
    db_session.add_all([career, gestion])
    db_session.flush()
    return career, gestion


def test_find_conflicts_excludes_cancelled_scientific(db_session):
    career, gestion = _seed_career_and_gestion(db_session)

    academic = AcademicActivity(
        title="Academic Overlapping",
        start_date=date(2026, 3, 1),
        end_date=date(2026, 3, 10),
        category="test",
        career_id=career.id,
        gestion_id=gestion.id,
    )
    scientific = ScientificActivity(
        title="Cancelled Scientific",
        activity_type=ScientificActivityType.congreso,
        start_date=date(2026, 3, 3),
        end_date=date(2026, 3, 5),
        responsible_name="Dr. Cancelled",
        career_id=career.id,
        gestion_id=gestion.id,
        status=ScientificActivityStatus.cancelled,
    )
    db_session.add_all([academic, scientific])
    db_session.commit()

    conflicts = find_conflicts(db_session, career.id, gestion.id)
    assert conflicts == []


# --- Endpoint integration tests ---

def test_get_conflicts_returns_overlapping_pair(client, authenticated_user, db_session):
    career, gestion = _seed_career_and_gestion(db_session)

    academic = AcademicActivity(
        title="Academic One",
        start_date=date(2026, 3, 1),
        end_date=date(2026, 3, 3),
        category="test",
        career_id=career.id,
        gestion_id=gestion.id,
    )
    scientific = ScientificActivity(
        title="Scientific One",
        activity_type=ScientificActivityType.congreso,
        start_date=date(2026, 3, 3),
        end_date=date(2026, 3, 5),
        responsible_name="Dr. One",
        career_id=career.id,
        gestion_id=gestion.id,
        status=ScientificActivityStatus.scheduled,
    )
    db_session.add_all([academic, scientific])
    db_session.commit()

    response = client.get(f"/api/v1/conflicts?career_id={career.id}&gestion_id={gestion.id}")

    assert response.status_code == 200
    payload = response.json()
    parsed = ConflictListResponse.model_validate(payload)
    assert len(parsed.conflicts) == 1
    item = parsed.conflicts[0]
    assert item.academic_id == academic.id
    assert item.academic_title == "Academic One"
    assert item.scientific_id == scientific.id
    assert item.scientific_title == "Scientific One"
    assert item.scientific_type == ScientificActivityType.congreso
    assert item.scientific_start_date == date(2026, 3, 3)
    assert item.scientific_end_date == date(2026, 3, 5)


def test_get_conflicts_filters_by_career_and_gestion(client, authenticated_user, db_session):
    career_a, gestion_a = _seed_career_and_gestion(db_session)
    career_b = Career(name="Other Career", faculty="Other Faculty")
    db_session.add(career_b)
    db_session.flush()

    academic_a = AcademicActivity(
        title="Academic A",
        start_date=date(2026, 3, 1),
        end_date=date(2026, 3, 3),
        category="test",
        career_id=career_a.id,
        gestion_id=gestion_a.id,
    )
    scientific_a = ScientificActivity(
        title="Scientific A",
        activity_type=ScientificActivityType.webinar,
        start_date=date(2026, 3, 3),
        end_date=date(2026, 3, 5),
        responsible_name="Dr. A",
        career_id=career_a.id,
        gestion_id=gestion_a.id,
        status=ScientificActivityStatus.scheduled,
    )
    academic_b = AcademicActivity(
        title="Academic B",
        start_date=date(2026, 3, 1),
        end_date=date(2026, 3, 3),
        category="test",
        career_id=career_b.id,
        gestion_id=gestion_a.id,
    )
    scientific_b = ScientificActivity(
        title="Scientific B",
        activity_type=ScientificActivityType.feria,
        start_date=date(2026, 3, 3),
        end_date=date(2026, 3, 5),
        responsible_name="Dr. B",
        career_id=career_b.id,
        gestion_id=gestion_a.id,
        status=ScientificActivityStatus.scheduled,
    )
    db_session.add_all([academic_a, scientific_a, academic_b, scientific_b])
    db_session.commit()

    response = client.get(f"/api/v1/conflicts?career_id={career_a.id}&gestion_id={gestion_a.id}")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["conflicts"]) == 1
    assert payload["conflicts"][0]["academic_title"] == "Academic A"


def test_get_conflicts_missing_gestion_id_returns_422(client, authenticated_user):
    response = client.get("/api/v1/conflicts?career_id=1")
    assert response.status_code == 422
