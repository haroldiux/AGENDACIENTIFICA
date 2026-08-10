from datetime import date
from app.models.models import AcademicActivity, ScientificActivity, ScientificActivityType, ScientificActivityStatus, Gestion, Career


def test_export_ics_rfc5545_format(client, db_session):
    # Setup test data
    g = Gestion(name="2026-I", start_date=date(2026, 1, 1), end_date=date(2026, 12, 31))
    c = Career(name="Ingenieria de Sistemas", faculty="Tecnologia")
    db_session.add_all([g, c])
    db_session.commit()
    db_session.refresh(g)
    db_session.refresh(c)

    # 1. Academic activity (all day)
    act_acad = AcademicActivity(
        title="Inicio de Clases iCal",
        start_date=date(2026, 3, 1),
        end_date=date(2026, 3, 1),
        category="ACADEMICO",
        career_id=c.id,
        gestion_id=g.id,
    )

    # 2. Scientific activity (with time)
    act_sci = ScientificActivity(
        title="Congreso Internacional iCal",
        activity_type=ScientificActivityType.congreso,
        start_date=date(2026, 5, 10),
        end_date=date(2026, 5, 10),
        start_time="09:00",
        end_time="17:00",
        responsible_name="Dr. Alan Turing",
        status=ScientificActivityStatus.scheduled,
        career_id=c.id,
        gestion_id=g.id,
    )

    db_session.add_all([act_acad, act_sci])
    db_session.commit()

    # Request export-ics
    resp = client.get(f"/api/v1/fusion/export-ics?career_id={c.id}&gestion_id={g.id}")
    assert resp.status_code == 200
    assert "text/calendar" in resp.headers["content-type"]
    
    ics_text = resp.text
    assert "BEGIN:VCALENDAR" in ics_text
    assert "VERSION:2.0" in ics_text
    assert "PRODID:-//UNITEPC//Agenda Cientifica v1.0//ES" in ics_text
    assert "BEGIN:VEVENT" in ics_text
    assert "SUMMARY:Inicio de Clases iCal" in ics_text
    assert "SUMMARY:Congreso Internacional iCal" in ics_text
    assert "DTSTART;VALUE=DATE:20260301" in ics_text
    assert "DTSTART:20260510T090000Z" in ics_text
    assert "DTEND:20260510T170000Z" in ics_text
    assert "END:VCALENDAR" in ics_text


def test_export_ics_date_filters(client, db_session):
    g = Gestion(name="2026-II", start_date=date(2026, 1, 1), end_date=date(2026, 12, 31))
    db_session.add(g)
    db_session.commit()
    db_session.refresh(g)

    act1 = AcademicActivity(
        title="Actividad Enero",
        start_date=date(2026, 1, 15),
        end_date=date(2026, 1, 15),
        category="GENERAL",
        gestion_id=g.id,
    )
    act2 = AcademicActivity(
        title="Actividad Noviembre",
        start_date=date(2026, 11, 20),
        end_date=date(2026, 11, 20),
        category="GENERAL",
        gestion_id=g.id,
    )
    db_session.add_all([act1, act2])
    db_session.commit()

    resp = client.get(f"/api/v1/fusion/export-ics?start_date=2026-11-01&end_date=2026-11-30")
    assert resp.status_code == 200
    ics_text = resp.text
    assert "Actividad Noviembre" in ics_text
    assert "Actividad Enero" not in ics_text
