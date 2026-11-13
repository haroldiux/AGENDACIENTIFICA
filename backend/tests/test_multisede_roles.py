import pytest
from datetime import date
from sqlalchemy.orm import Session

from app.models.models import User, RoleEnum, Career, Gestion, Sede, AcademicActivity, ScientificActivity
from app.core.security import get_password_hash, create_access_token

@pytest.fixture
def test_setup_multisede(db_session: Session):
    # 1. Create Sedes
    sede_cbba = Sede(name="Sede Cochabamba")
    sede_lpz = Sede(name="Sede La Paz")
    db_session.add_all([sede_cbba, sede_lpz])
    db_session.flush()

    # 2. Create Gestion
    gestion = Gestion(name="1-2027", start_date=date(2027, 1, 1), end_date=date(2027, 6, 30))
    db_session.add(gestion)
    db_session.flush()

    # 3. Create Career
    career = Career(name="Medicina", faculty="Salud")
    career.sedes.extend([sede_cbba, sede_lpz])
    db_session.add(career)
    db_session.flush()

    # 4. Create Users
    pw_hash = get_password_hash("testpass123")

    vr_sede = User(
        email="vr.lpz@unitepc.edu.bo",
        full_name="Vicerrector La Paz",
        role=RoleEnum.vicerrector_sede,
        sede_id=sede_lpz.id,
        hashed_password=pw_hash,
        is_active=True,
    )
    dir_acad_sede = User(
        email="dir.acad.lpz@unitepc.edu.bo",
        full_name="Director Académico La Paz",
        role=RoleEnum.director_academico_sede,
        sede_id=sede_lpz.id,
        hashed_password=pw_hash,
        is_active=True,
    )
    jefe_inv = User(
        email="jefe.inv.med@unitepc.edu.bo",
        full_name="Jefe Inv Medicina",
        role=RoleEnum.jefe_investigacion,
        hashed_password=pw_hash,
        is_active=True,
    )
    jefe_inv.careers.append(career)

    dir_inv_cbba = User(
        email="dir.inv.cbba@unitepc.edu.bo",
        full_name="Directora Inv Cochabamba",
        role=RoleEnum.director_investigacion,
        sede_id=sede_cbba.id,
        hashed_password=pw_hash,
        is_active=True,
    )

    db_session.add_all([vr_sede, dir_acad_sede, jefe_inv, dir_inv_cbba])
    db_session.commit()

    return {
        "sede_cbba": sede_cbba,
        "sede_lpz": sede_lpz,
        "gestion": gestion,
        "career": career,
        "vr_sede": vr_sede,
        "dir_acad_sede": dir_acad_sede,
        "jefe_inv": jefe_inv,
        "dir_inv_cbba": dir_inv_cbba,
    }


def auth_header(user: User):
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}


def test_director_academico_sede_can_create_academic_activity(client, db_session: Session, test_setup_multisede):
    setup = test_setup_multisede
    user = setup["dir_acad_sede"]
    headers = auth_header(user)

    payload = {
        "title": "Exámenes Parciales Sede La Paz",
        "start_date": "2027-03-15",
        "end_date": "2027-03-20",
        "career_id": setup["career"].id,
        "sede_id": setup["sede_lpz"].id,
        "gestion_id": setup["gestion"].id,
        "is_scientific": False,
        "category": "EXAMEN",
        "pilar": "academica",
        "regimen": "semestral",
        "plan_estudio": "Plan 2023",
    }
    resp = client.post("/api/v1/actividades/", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["pilar"] == "academica"
    assert data["sede_id"] == setup["sede_lpz"].id


def test_director_academico_sede_rejected_for_scientific_activity(client, db_session: Session, test_setup_multisede):
    setup = test_setup_multisede
    user = setup["dir_acad_sede"]
    headers = auth_header(user)

    payload = {
        "title": "Congreso de Cirugía",
        "start_date": "2027-04-10",
        "end_date": "2027-04-12",
        "career_id": setup["career"].id,
        "sede_id": setup["sede_lpz"].id,
        "gestion_id": setup["gestion"].id,
        "is_scientific": True,
        "activity_type": "congreso",
        "responsible_name": "Dr. Prueba",
        "pilar": "investigacion",
    }
    resp = client.post("/api/v1/actividades/", json=payload, headers=headers)
    assert resp.status_code == 403
    assert "Dirección Académica de Sede sólo puede gestionar actividades académicas" in resp.json()["detail"]


def test_jefe_investigacion_rejected_for_academic_activity(client, db_session: Session, test_setup_multisede):
    setup = test_setup_multisede
    user = setup["jefe_inv"]
    headers = auth_header(user)

    payload = {
        "title": "Primer Parcial de Anatomía",
        "start_date": "2027-03-10",
        "end_date": "2027-03-10",
        "career_id": setup["career"].id,
        "gestion_id": setup["gestion"].id,
        "is_scientific": False,
        "category": "EXAMEN",
        "pilar": "academica",
    }
    resp = client.post("/api/v1/actividades/", json=payload, headers=headers)
    assert resp.status_code == 403
    assert "Jefatura de Investigación sólo puede gestionar actividades de investigación" in resp.json()["detail"]


def test_jefe_investigacion_can_create_scientific_activity(client, db_session: Session, test_setup_multisede):
    setup = test_setup_multisede
    user = setup["jefe_inv"]
    headers = auth_header(user)

    payload = {
        "title": "Webinar Avances en Farmacología",
        "start_date": "2027-04-15",
        "end_date": "2027-04-15",
        "career_id": setup["career"].id,
        "gestion_id": setup["gestion"].id,
        "is_scientific": True,
        "activity_type": "webinar",
        "responsible_name": "Dr. Farmacología",
        "pilar": "investigacion",
    }
    resp = client.post("/api/v1/actividades/", json=payload, headers=headers)
    assert resp.status_code == 201


def test_director_investigacion_allows_all_pillars_for_own_sede(client, db_session: Session, test_setup_multisede):
    setup = test_setup_multisede
    user = setup["dir_inv_cbba"]
    headers = auth_header(user)

    # 1. Scientific
    payload_sci = {
        "title": "Feria de Ciencias Cochabamba",
        "start_date": "2027-05-20",
        "end_date": "2027-05-21",
        "career_id": setup["career"].id,
        "sede_id": setup["sede_cbba"].id,
        "gestion_id": setup["gestion"].id,
        "is_scientific": True,
        "activity_type": "feria",
        "responsible_name": "Dra. Lorena Orellana",
        "pilar": "investigacion",
    }
    resp_sci = client.post("/api/v1/actividades/", json=payload_sci, headers=headers)
    assert resp_sci.status_code == 201

    # 2. Interaccion Social
    payload_soc = {
        "title": "Campaña de Vacunación Comunitaria",
        "start_date": "2027-05-25",
        "end_date": "2027-05-26",
        "career_id": setup["career"].id,
        "sede_id": setup["sede_cbba"].id,
        "gestion_id": setup["gestion"].id,
        "is_scientific": False,
        "category": "INTERACCION_SOCIAL",
        "pilar": "interaccion_social",
    }
    resp_soc = client.post("/api/v1/actividades/", json=payload_soc, headers=headers)
    assert resp_soc.status_code == 201
