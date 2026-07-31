import os
import uuid
from collections import defaultdict
from datetime import datetime
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.models import AcademicActivity, ScientificActivity, Career, Gestion
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

REPORTS_DIR = "/tmp/reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

SPANISH_MONTHS = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
}


def _month_label(year, month):
    return f"{SPANISH_MONTHS[month]} {year}"


def _enum_value(value):
    return value.value if hasattr(value, "value") else value


def build_research_agenda_pdf(doc, activities, career_name, gestion_name):
    """Render a month-grouped, career-branded research agenda PDF."""
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"Agenda Científica: {career_name}", styles["Title"]))
    elements.append(Paragraph(f"Gestión: {gestion_name}", styles["Heading2"]))
    elements.append(
        Paragraph(
            f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            styles["Normal"],
        )
    )
    elements.append(Spacer(1, 20))

    if not activities:
        elements.append(
            Paragraph(
                "No hay actividades científicas para los filtros seleccionados.",
                styles["Normal"],
            )
        )
        doc.build(elements)
        return

    grouped = defaultdict(list)
    for act in activities:
        grouped[(act.start_date.year, act.start_date.month)].append(act)

    for (year, month) in sorted(grouped.keys()):
        elements.append(Paragraph(_month_label(year, month), styles["Heading2"]))
        elements.append(Spacer(1, 6))

        for act in grouped[(year, month)]:
            act_type = _enum_value(act.activity_type)
            status = _enum_value(act.status)
            date_range = f"{act.start_date} - {act.end_date}"
            notes = act.notes or "—"

            data = [
                [Paragraph(f"<b>{act.title}</b>", styles["Normal"])],
                [Paragraph(f"Tipo: {act_type}", styles["Normal"])],
                [Paragraph(f"Responsable: {act.responsible_name}", styles["Normal"])],
                [Paragraph(f"Fechas: {date_range}", styles["Normal"])],
                [Paragraph(f"Estado: {status}", styles["Normal"])],
                [Paragraph(f"Notas: {notes}", styles["Normal"])],
            ]
            card = Table(data, colWidths=[450])
            card.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F5F5F5")),
                        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#DDDDDD")),
                        ("LEFTPADDING", (0, 0), (-1, -1), 8),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                        ("TOPPADDING", (0, 0), (-1, -1), 6),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ]
                )
            )
            elements.append(card)
            elements.append(Spacer(1, 10))

        elements.append(Spacer(1, 12))

    doc.build(elements)


def _build_table_report(doc, career_id, gestion_id, db):
    """Render the original table-based PDF report."""
    ac_query = db.query(AcademicActivity)
    sc_query = db.query(ScientificActivity)

    if career_id:
        ac_query = ac_query.filter(AcademicActivity.career_id == career_id)
        sc_query = sc_query.filter(ScientificActivity.career_id == career_id)

    if gestion_id:
        ac_query = ac_query.filter(AcademicActivity.gestion_id == gestion_id)
        sc_query = sc_query.filter(ScientificActivity.gestion_id == gestion_id)

    academic_activities = ac_query.all()
    scientific_activities = sc_query.all()

    styles = getSampleStyleSheet()
    elements = []

    title = Paragraph("Reporte de Actividades", styles["Title"])
    elements.append(title)
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Actividades Académicas", styles["Heading2"]))
    if academic_activities:
        data = [["Título", "Fecha Inicio", "Fecha Fin", "Categoría"]]
        for act in academic_activities:
            data.append(
                [act.title, str(act.start_date), str(act.end_date), act.category]
            )
        t = Table(data)
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )
        elements.append(t)
    else:
        elements.append(Paragraph("No hay actividades académicas.", styles["Normal"]))

    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Actividades Científicas", styles["Heading2"]))
    if scientific_activities:
        data = [["Título", "Tipo", "Fecha Inicio", "Fecha Fin", "Estado"]]
        for act in scientific_activities:
            data.append(
                [
                    act.title,
                    _enum_value(act.activity_type),
                    str(act.start_date),
                    str(act.end_date),
                    _enum_value(act.status),
                ]
            )
        t = Table(data)
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )
        elements.append(t)
    else:
        elements.append(Paragraph("No hay actividades científicas.", styles["Normal"]))

    doc.build(elements)


@celery_app.task
def generate_pdf_report_task(
    career_id: int = None, gestion_id: int = None, report_type: str = "table"
):
    db = SessionLocal()
    try:
        filename = f"report_{uuid.uuid4().hex}.pdf"
        filepath = os.path.join(REPORTS_DIR, filename)
        doc = SimpleDocTemplate(filepath, pagesize=letter)

        if report_type == "research-agenda":
            career = (
                db.query(Career).filter(Career.id == career_id).first()
                if career_id
                else None
            )
            gestion = (
                db.query(Gestion).filter(Gestion.id == gestion_id).first()
                if gestion_id
                else None
            )
            career_name = career.name if career else "Todas las carreras"
            gestion_name = gestion.name if gestion else "Todas las gestiones"

            query = db.query(ScientificActivity)
            if career_id is not None:
                query = query.filter(ScientificActivity.career_id == career_id)
            if gestion_id is not None:
                query = query.filter(ScientificActivity.gestion_id == gestion_id)
            activities = query.order_by(ScientificActivity.start_date).all()

            build_research_agenda_pdf(doc, activities, career_name, gestion_name)
        else:
            _build_table_report(doc, career_id, gestion_id, db)

        return {"status": "completed", "file_path": filepath, "file_name": filename}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()


@celery_app.task
def generate_excel_report_task(career_id: int = None, gestion_id: int = None):
    import time

    # Simulate Excel generation
    time.sleep(2)
    filename = f"report_{career_id}_{gestion_id}.xlsx"
    filepath = os.path.join(REPORTS_DIR, filename)

    with open(filepath, "w") as f:
        f.write(
            "Simulated Excel content for career {} and gestion {}".format(
                career_id, gestion_id
            )
        )

    return {"status": "completed", "file_path": filepath, "file_name": filename}
