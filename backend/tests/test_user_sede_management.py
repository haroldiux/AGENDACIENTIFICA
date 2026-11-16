import pytest
from app.models.models import RoleEnum, User, Sede, Career
from app.api.deps import check_activity_scope_permission
from fastapi import HTTPException

def test_scope_permission_director_academico_sede_allowed():
    user = User(
        id=101,
        email="dir.academico@unitepc.edu.bo",
        role=RoleEnum.director_academico_sede,
        sede_id=1,
    )
    # Allowed: same sede, academic pillar
    check_activity_scope_permission(user, career_id=None, sede_id=1, pilar="academica")

def test_scope_permission_director_academico_sede_blocked_on_other_sede():
    user = User(
        id=101,
        email="dir.academico@unitepc.edu.bo",
        role=RoleEnum.director_academico_sede,
        sede_id=1,
    )
    # Blocked: different sede
    with pytest.raises(HTTPException) as exc:
        check_activity_scope_permission(user, career_id=None, sede_id=2, pilar="academica")
    assert exc.value.status_code == 403

def test_scope_permission_director_academico_sede_blocked_on_research():
    user = User(
        id=101,
        email="dir.academico@unitepc.edu.bo",
        role=RoleEnum.director_academico_sede,
        sede_id=1,
    )
    # Blocked: research pillar
    with pytest.raises(HTTPException) as exc:
        check_activity_scope_permission(user, career_id=None, sede_id=1, pilar="investigacion")
    assert exc.value.status_code == 403

def test_scope_permission_jefe_investigacion_blocked_on_academic():
    career = Career(id=5, name="Medicina", faculty="Salud")
    user = User(
        id=102,
        email="jefe.inv@unitepc.edu.bo",
        role=RoleEnum.jefe_investigacion,
        careers=[career],
    )
    # Blocked: academic pillar
    with pytest.raises(HTTPException) as exc:
        check_activity_scope_permission(user, career_id=5, sede_id=None, pilar="academica")
    assert exc.value.status_code == 403

def test_scope_permission_director_investigacion_allows_all_pillars_in_sede():
    user = User(
        id=103,
        email="dir.inv@unitepc.edu.bo",
        role=RoleEnum.director_investigacion,
        sede_id=1,
    )
    # Allowed in their sede across all 4 pillars
    for pil in ["investigacion", "academica", "interaccion_social", "internacionalizacion"]:
        check_activity_scope_permission(user, career_id=None, sede_id=1, pilar=pil)
