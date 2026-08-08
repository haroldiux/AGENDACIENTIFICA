import pytest
import io
import os
from fastapi import HTTPException
from app.main import app
from app.models.models import (
    RoleEnum,
    User,
    Career,
    Gestion,
    AcademicActivity,
    ScientificActivity,
    ScientificActivityEvidence,
)
from app.schemas.schemas import MergedCalendarItem
from app.api.deps import check_activity_scope_permission

def test_role_enum_new_roles():
    assert RoleEnum.vicerrectorado.value == "vicerrectorado"
    assert RoleEnum.director_investigacion.value == "director_investigacion"
    assert RoleEnum.jefe_investigacion.value == "jefe_investigacion"

def test_scope_permission_global_roles():
    vicerrector = User(id=1, email="vicerrector@test.com", role=RoleEnum.vicerrectorado)
    director = User(id=2, email="director@test.com", role=RoleEnum.director_investigacion)
    admin = User(id=3, email="admin@test.com", role=RoleEnum.super_admin)

    # All these roles should pass for global (career_id=None) and specific career
    check_activity_scope_permission(vicerrector, None)
    check_activity_scope_permission(vicerrector, 10)
    check_activity_scope_permission(director, None)
    check_activity_scope_permission(director, 10)
    check_activity_scope_permission(admin, None)

def test_scope_permission_career_scoped_roles():
    career1 = Career(id=1, name="Sistemas", faculty="Ingenieria")
    jefe = User(id=4, email="jefe@test.com", role=RoleEnum.jefe_investigacion)
    jefe.careers = [career1]

    coord = User(id=5, email="coord@test.com", role=RoleEnum.coordinator)
    coord.careers = [career1]

    # Can manage assigned career
    check_activity_scope_permission(jefe, 1)
    check_activity_scope_permission(coord, 1)

    # Cannot manage global activities
    with pytest.raises(HTTPException) as exc_info:
        check_activity_scope_permission(jefe, None)
    assert exc_info.value.status_code == 403

    # Cannot manage unassigned career
    with pytest.raises(HTTPException) as exc_info:
        check_activity_scope_permission(coord, 99)
    assert exc_info.value.status_code == 403

def test_scope_permission_teacher_role():
    teacher = User(id=6, email="teacher@test.com", role=RoleEnum.teacher)
    with pytest.raises(HTTPException) as exc_info:
        check_activity_scope_permission(teacher, 1)
    assert exc_info.value.status_code == 403

def test_fusion_calendar_global_and_career_activities(client, db_session):
    c1 = Career(id=1, name="Medicina", faculty="Salud")
    g1 = Gestion(id=1, name="2026-I", start_date=date(2026, 1, 1), end_date=date(2026, 6, 30))
    db_session.add_all([c1, g1])
    db_session.commit()

    global_act = AcademicActivity(
        title="Global Institutional Event",
        career_id=None,
        gestion_id=g1.id,
        start_date=date(2026, 3, 1),
        end_date=date(2026, 3, 2),
        category="Institucional"
    )
    career_act = ScientificActivity(
        title="Medicina Research Workshop",
        career_id=c1.id,
        gestion_id=g1.id,
        activity_type="congreso",
        start_date=date(2026, 4, 1),
        end_date=date(2026, 4, 2),
        responsible_name="Dr. Smith"
    )
    db_session.add_all([global_act, career_act])
    db_session.commit()

    # Query fusion calendar for career_id=1
    response = client.get(f"/api/v1/fusion/?career_id={c1.id}")
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    assert len(items) == 2
    global_item = next(i for i in items if i["title"] == "Global Institutional Event")
    assert global_item["scope"] == "global"
    assert global_item["career_id"] is None

    career_item = next(i for i in items if i["title"] == "Medicina Research Workshop")
    assert career_item["scope"] == "career"
    assert career_item["career_id"] == c1.id

from datetime import date

def test_evidence_endpoints(client, db_session, monkeypatch):
    c1 = Career(id=10, name="Derecho", faculty="Sociales")
    g1 = Gestion(id=10, name="2026-I", start_date=date(2026, 1, 1), end_date=date(2026, 6, 30))
    user = User(id=10, email="admin_test@test.com", hashed_password="pw", role=RoleEnum.admin)
    db_session.add_all([c1, g1, user])
    db_session.commit()

    from app.api.deps import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: user

    sa1 = ScientificActivity(
        title="Derecho Conference",
        career_id=c1.id,
        gestion_id=g1.id,
        activity_type="congreso",
        start_date=date(2026, 5, 1),
        end_date=date(2026, 5, 2),
        responsible_name="Dr. Miller"
    )
    db_session.add(sa1)
    db_session.commit()

    # Upload evidence file
    file_data = b"Dummy PDF content for evidence"
    response = client.post(
        f"/api/v1/scientific/{sa1.id}/evidence",
        files={"file": ("evidence1.pdf", io.BytesIO(file_data), "application/pdf")}
    )
    assert response.status_code == 201
    evidence_resp = response.json()
    assert evidence_resp["filename"] == "evidence1.pdf"
    assert evidence_resp["scientific_activity_id"] == sa1.id
    evidence_id = evidence_resp["id"]

    # List evidence files
    response_list = client.get(f"/api/v1/scientific/{sa1.id}/evidence")
    assert response_list.status_code == 200
    evidences = response_list.json()
    assert len(evidences) == 1
    assert evidences[0]["id"] == evidence_id

    # Delete evidence file
    response_del = client.delete(f"/api/v1/scientific/evidence/{evidence_id}")
    assert response_del.status_code == 204

    # Verify deleted
    response_list2 = client.get(f"/api/v1/scientific/{sa1.id}/evidence")
    assert response_list2.status_code == 200
    assert len(response_list2.json()) == 0

    app.dependency_overrides.clear()
