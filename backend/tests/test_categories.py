import pytest
from app.api.deps import get_current_active_user
from app.main import app
from app.models.models import ActivityCategory, User, RoleEnum, AcademicActivity, ScientificActivity, Career, Gestion
from datetime import date


def create_mock_user(role: RoleEnum, user_id: int = 1, email: str = "test@example.com") -> User:
    return User(
        id=user_id,
        email=email,
        hashed_password="hashed_pw",
        full_name="Test User",
        role=role,
        is_active=True,
    )


# --- Category DB Unit Tests ---

def test_create_category_model(db_session):
    category = ActivityCategory(
        name="Conferencia",
        code="CONF",
        scope="both",
        color="#123456",
        description="Conferencia institucional",
        is_active=True,
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)

    assert category.id is not None
    assert category.name == "Conferencia"
    assert category.code == "CONF"
    assert category.scope == "both"
    assert category.is_active is True


# --- Category API Integration Tests ---

def test_get_categories_empty_or_seeded(client, db_session):
    response = client.get("/api/v1/categories/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_category_authorized_vicerrectorado(client, db_session):
    user = create_mock_user(RoleEnum.vicerrectorado)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "name": "Simposio Académico",
        "code": "SIMPOSIO",
        "scope": "academic",
        "color": "#00FF00",
        "description": "Simposio de investigación",
    }
    response = client.post("/api/v1/categories/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Simposio Académico"
    assert data["code"] == "SIMPOSIO"
    assert data["scope"] == "academic"

    app.dependency_overrides.clear()


def test_create_category_forbidden_for_teacher(client, db_session):
    user = create_mock_user(RoleEnum.teacher)
    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "name": "Taller Docente",
        "code": "TALLER_DOC",
        "scope": "academic",
    }
    response = client.post("/api/v1/categories/", json=payload)
    assert response.status_code == 403
    assert "Not authorized" in response.json()["detail"]

    app.dependency_overrides.clear()


def test_create_category_duplicate_code(client, db_session):
    user = create_mock_user(RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: user

    cat = ActivityCategory(name="Duplicate Test", code="DUP_CODE", scope="both")
    db_session.add(cat)
    db_session.commit()

    payload = {
        "name": "Another Category",
        "code": "DUP_CODE",
        "scope": "both",
    }
    response = client.post("/api/v1/categories/", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

    app.dependency_overrides.clear()


def test_get_category_by_id(client, db_session):
    cat = ActivityCategory(name="Single Cat", code="SINGLE_CAT", scope="academic")
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(cat)

    response = client.get(f"/api/v1/categories/{cat.id}")
    assert response.status_code == 200
    assert response.json()["code"] == "SINGLE_CAT"


def test_get_category_not_found(client, db_session):
    response = client.get("/api/v1/categories/999999")
    assert response.status_code == 404


def test_update_category(client, db_session):
    user = create_mock_user(RoleEnum.super_admin)
    app.dependency_overrides[get_current_active_user] = lambda: user

    cat = ActivityCategory(name="Old Name", code="OLD_CODE", scope="scientific")
    db_session.add(cat)
    db_session.commit()

    update_payload = {
        "name": "Updated Name",
        "code": "NEW_CODE",
        "color": "#112233",
    }
    response = client.put(f"/api/v1/categories/{cat.id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["code"] == "NEW_CODE"
    assert data["color"] == "#112233"

    app.dependency_overrides.clear()


def test_soft_delete_category(client, db_session):
    user = create_mock_user(RoleEnum.director_investigacion)
    app.dependency_overrides[get_current_active_user] = lambda: user

    cat = ActivityCategory(name="To Delete", code="DEL_CODE", scope="both", is_active=True)
    db_session.add(cat)
    db_session.commit()

    response = client.delete(f"/api/v1/categories/{cat.id}")
    assert response.status_code == 200
    assert response.json()["is_active"] is False

    # Check listing default excludes inactive
    list_res = client.get("/api/v1/categories/")
    ids = [c["id"] for c in list_res.json()]
    assert cat.id not in ids

    # Check include_inactive=True includes it
    list_all_res = client.get("/api/v1/categories/?include_inactive=true")
    all_ids = [c["id"] for c in list_all_res.json()]
    assert cat.id in all_ids

    app.dependency_overrides.clear()


def test_scope_filtering(client, db_session):
    cat_academic = ActivityCategory(name="Academic Only", code="AC_ONLY", scope="academic")
    cat_scientific = ActivityCategory(name="Scientific Only", code="SC_ONLY", scope="scientific")
    cat_both = ActivityCategory(name="Both Scope", code="BOTH_SCOPE", scope="both")
    db_session.add_all([cat_academic, cat_scientific, cat_both])
    db_session.commit()

    res_ac = client.get("/api/v1/categories/?scope=academic")
    assert res_ac.status_code == 200
    codes_ac = [c["code"] for c in res_ac.json()]
    assert "AC_ONLY" in codes_ac
    assert "BOTH_SCOPE" in codes_ac
    assert "SC_ONLY" not in codes_ac

    res_sc = client.get("/api/v1/categories/?scope=scientific")
    assert res_sc.status_code == 200
    codes_sc = [c["code"] for c in res_sc.json()]
    assert "SC_ONLY" in codes_sc
    assert "BOTH_SCOPE" in codes_sc
    assert "AC_ONLY" not in codes_sc


def test_activity_with_category_id(client, db_session):
    user = create_mock_user(RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: user

    gestion = Gestion(name="2026", start_date=date(2026, 1, 1), end_date=date(2026, 12, 31))
    cat = ActivityCategory(name="Examen Parcial", code="PARCIAL", scope="academic")
    db_session.add_all([gestion, cat])
    db_session.commit()

    academic_payload = {
        "title": "Primer Parcial de Redes",
        "start_date": "2026-04-10",
        "end_date": "2026-04-10",
        "gestion_id": gestion.id,
        "category_id": cat.id,
    }
    res = client.post("/api/v1/academic/", json=academic_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["category_id"] == cat.id
    assert data["activity_category"]["code"] == "PARCIAL"

    app.dependency_overrides.clear()
