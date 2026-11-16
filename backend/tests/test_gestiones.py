from datetime import date
import pytest
from app.api.deps import get_current_active_user
from app.main import app
from app.models.models import Gestion, User, RoleEnum, AcademicActivity, ScientificActivity, ScientificActivityType, ScientificActivityStatus


def create_user(role: RoleEnum = RoleEnum.admin, user_id: int = 1) -> User:
    return User(
        id=user_id,
        email="admin@example.com",
        hashed_password="pw",
        full_name="Admin User",
        role=role,
        is_active=True,
    )


def test_list_gestiones(client, db_session):
    user = create_user(RoleEnum.teacher)
    app.dependency_overrides[get_current_active_user] = lambda: user
    try:
        g1 = Gestion(name="1-2030", start_date=date(2030, 2, 1), end_date=date(2030, 6, 30))
        db_session.add(g1)
        db_session.commit()

        resp = client.get("/api/v1/gestiones/")
        assert resp.status_code == 200
        items = resp.json()
        assert any(item["name"] == "1-2030" for item in items)
    finally:
        app.dependency_overrides.clear()


def test_create_gestion_success(client, db_session):
    admin = create_user(RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: admin
    try:
        payload = {
            "name": "2-2030",
            "start_date": "2030-08-01",
            "end_date": "2030-12-15",
        }
        resp = client.post("/api/v1/gestiones/", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "2-2030"
        assert data["start_date"] == "2030-08-01"
        assert data["end_date"] == "2030-12-15"
    finally:
        app.dependency_overrides.clear()


def test_create_gestion_invalid_format(client, db_session):
    admin = create_user(RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: admin
    try:
        # Invalid semester format: 3-2030
        payload = {
            "name": "3-2030",
            "start_date": "2030-01-01",
            "end_date": "2030-06-01",
        }
        resp = client.post("/api/v1/gestiones/", json=payload)
        assert resp.status_code == 422
    finally:
        app.dependency_overrides.clear()


def test_create_gestion_invalid_dates(client, db_session):
    admin = create_user(RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: admin
    try:
        # start_date >= end_date
        payload = {
            "name": "1-2031",
            "start_date": "2031-06-01",
            "end_date": "2031-01-01",
        }
        resp = client.post("/api/v1/gestiones/", json=payload)
        assert resp.status_code == 400
        assert "anterior" in resp.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


def test_create_gestion_duplicate_name(client, db_session):
    admin = create_user(RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: admin
    try:
        g = Gestion(name="1-2032", start_date=date(2032, 2, 1), end_date=date(2032, 6, 30))
        db_session.add(g)
        db_session.commit()

        payload = {
            "name": "1-2032",
            "start_date": "2032-02-01",
            "end_date": "2032-06-30",
        }
        resp = client.post("/api/v1/gestiones/", json=payload)
        assert resp.status_code == 400
        assert "ya existe" in resp.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


def test_create_gestion_unauthorized(client, db_session):
    teacher = create_user(RoleEnum.teacher)
    app.dependency_overrides[get_current_active_user] = lambda: teacher
    try:
        payload = {
            "name": "2-2032",
            "start_date": "2032-08-01",
            "end_date": "2032-12-15",
        }
        resp = client.post("/api/v1/gestiones/", json=payload)
        assert resp.status_code == 403
    finally:
        app.dependency_overrides.clear()


def test_update_gestion(client, db_session):
    admin = create_user(RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: admin
    try:
        g = Gestion(name="1-2033", start_date=date(2033, 2, 1), end_date=date(2033, 6, 30))
        db_session.add(g)
        db_session.commit()
        db_session.refresh(g)

        resp = client.put(f"/api/v1/gestiones/{g.id}", json={"name": "2-2033"})
        assert resp.status_code == 200
        assert resp.json()["name"] == "2-2033"
    finally:
        app.dependency_overrides.clear()


def test_gestion_summary_and_delete_with_activities(client, db_session):
    admin = create_user(RoleEnum.admin)
    app.dependency_overrides[get_current_active_user] = lambda: admin
    try:
        g = Gestion(name="1-2034", start_date=date(2034, 2, 1), end_date=date(2034, 6, 30))
        db_session.add(g)
        db_session.commit()
        db_session.refresh(g)

        # Add academic activity
        acad = AcademicActivity(
            gestion_id=g.id,
            title="Examen Parcial",
            start_date=date(2034, 3, 1),
            end_date=date(2034, 3, 1),
            category="EVALUACION",
        )
        db_session.add(acad)

        # Add scientific activity
        sci = ScientificActivity(
            gestion_id=g.id,
            title="Webinar Robótica",
            activity_type=ScientificActivityType.webinar,
            start_date=date(2034, 4, 1),
            end_date=date(2034, 4, 1),
            responsible_name="Dr. Robot",
            status=ScientificActivityStatus.scheduled,
        )
        db_session.add(sci)
        db_session.commit()

        # Check summary
        summary_resp = client.get(f"/api/v1/gestiones/{g.id}/summary")
        assert summary_resp.status_code == 200
        summary_data = summary_resp.json()
        assert summary_data["academic_count"] == 1
        assert summary_data["scientific_count"] == 1
        assert summary_data["total_activities"] == 2

        # Attempt to delete: must be rejected with 400
        del_resp = client.delete(f"/api/v1/gestiones/{g.id}")
        assert del_resp.status_code == 400
        assert "no se puede eliminar" in del_resp.json()["detail"].lower()

        # Clear activities
        clear_resp = client.post(f"/api/v1/gestiones/{g.id}/clear-activities")
        assert clear_resp.status_code == 200
        clear_data = clear_resp.json()
        assert clear_data["deleted_academic"] == 1
        assert clear_data["deleted_scientific"] == 1
        assert clear_data["total_deleted"] == 2

        # Summary should now be 0
        summary_resp2 = client.get(f"/api/v1/gestiones/{g.id}/summary")
        assert summary_resp2.json()["total_activities"] == 0

        # Now deletion should succeed
        del_resp2 = client.delete(f"/api/v1/gestiones/{g.id}")
        assert del_resp2.status_code == 200
    finally:
        app.dependency_overrides.clear()
