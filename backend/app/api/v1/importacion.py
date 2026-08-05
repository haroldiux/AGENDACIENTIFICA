from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
from pydantic import ValidationError
from io import BytesIO
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from app.db.session import get_db
from app.models.models import AcademicActivity, ScientificActivity, Career, Gestion
from app.schemas.schemas import ActivityRowValidator

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _style_header_row(ws, headers: list, fill_color: str):
    """Apply header styling to the first row."""
    fill = PatternFill(start_color=fill_color, end_color=fill_color, fill_type="solid")
    font = Font(bold=True, color="FFFFFF", size=11)
    border = Border(
        bottom=Side(border_style="thin", color="CCCCCC"),
        right=Side(border_style="thin", color="CCCCCC"),
    )
    for col_idx, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.fill = fill
        cell.font = font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border
        ws.column_dimensions[get_column_letter(col_idx)].width = 22
    ws.row_dimensions[1].height = 30


def _add_example_row(ws, values: list):
    """Add a light-gray example row."""
    fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    font = Font(color="64748B", italic=True, size=10)
    for col_idx, value in enumerate(values, start=1):
        cell = ws.cell(row=2, column=col_idx, value=value)
        cell.fill = fill
        cell.font = font
        cell.alignment = Alignment(horizontal="center", vertical="center")


# ---------------------------------------------------------------------------
# Template Download
# ---------------------------------------------------------------------------

@router.get("/template/download")
def download_template(db: Session = Depends(get_db)):
    """Return a bilingual blank Excel template with career/gestion reference."""
    wb = openpyxl.Workbook()

    # ---- fetch live data ----
    careers = db.query(Career).order_by(Career.id).all()
    gestiones = db.query(Gestion).order_by(Gestion.id).all()

    # ---- Sheet 1: Academic Activities ----
    ws_ac = wb.active
    ws_ac.title = "Actividades Académicas"
    academic_headers = [
        "titulo",
        "fecha_inicio",
        "fecha_fin",
        "categoria",
        "id_carrera",
        "id_gestion",
        "es_cientifica",
    ]
    _style_header_row(ws_ac, academic_headers, "009E96")
    _add_example_row(ws_ac, [
        "Inicio de clases",
        "2026-02-11",
        "2026-02-11",
        "GENERAL",
        careers[0].id if careers else 1,
        gestiones[0].id if gestiones else 1,
        "FALSE",
    ])
    ws_ac.cell(row=3, column=1, value="⚠ La fila 2 es ejemplo – bórrala antes de importar")
    ws_ac.cell(row=3, column=1).font = Font(color="EF4444", bold=True, size=9)

    # ---- Sheet 2: Scientific Activities ----
    ws_sc = wb.create_sheet(title="Actividades Científicas")
    scientific_headers = [
        "titulo",
        "fecha_inicio",
        "fecha_fin",
        "tipo_actividad",
        "nombre_responsable",
        "id_carrera",
        "id_gestion",
        "es_cientifica",
    ]
    _style_header_row(ws_sc, scientific_headers, "6B3392")
    _add_example_row(ws_sc, [
        "Congreso de Investigación",
        "2026-03-15",
        "2026-03-17",
        "CONGRESO",
        "Dr. Juan Pérez",
        careers[0].id if careers else 1,
        gestiones[0].id if gestiones else 1,
        "TRUE",
    ])
    ws_sc.cell(row=3, column=1, value="⚠ La fila 2 es ejemplo – bórrala antes de importar")
    ws_sc.cell(row=3, column=1).font = Font(color="EF4444", bold=True, size=9)

    # ---- Sheet 3: Reference (fields + careers + gestiones) ----
    ws_ref = wb.create_sheet(title="Referencia")

    # --- Column widths ---
    ws_ref.column_dimensions["A"].width = 22
    ws_ref.column_dimensions["B"].width = 55
    ws_ref.column_dimensions["D"].width = 10
    ws_ref.column_dimensions["E"].width = 35
    ws_ref.column_dimensions["F"].width = 25
    ws_ref.column_dimensions["H"].width = 10
    ws_ref.column_dimensions["I"].width = 22

    dark_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    green_fill = PatternFill(start_color="009E96", end_color="009E96", fill_type="solid")
    purple_fill = PatternFill(start_color="6B3392", end_color="6B3392", fill_type="solid")
    white_bold = Font(bold=True, color="FFFFFF", size=11)
    center = Alignment(horizontal="center", vertical="center")

    # --- Fields section header ---
    ws_ref.cell(row=1, column=1, value="📋 Campos del archivo Excel").font = white_bold
    ws_ref.cell(row=1, column=1).fill = dark_fill
    ws_ref.cell(row=1, column=1).alignment = center
    ws_ref.merge_cells("A1:B1")
    ws_ref.row_dimensions[1].height = 24

    # sub-header
    for col, txt in [(1, "Columna (nombre exacto)"), (2, "Descripción y valores válidos")]:
        c = ws_ref.cell(row=2, column=col, value=txt)
        c.fill = green_fill
        c.font = white_bold
        c.alignment = center

    field_rows = [
        ("titulo", "Nombre de la actividad (texto libre, requerido)"),
        ("fecha_inicio", "Fecha inicio: formato YYYY-MM-DD, p.ej. 2026-02-11"),
        ("fecha_fin", "Fecha fin: formato YYYY-MM-DD  (igual a inicio si dura 1 día)"),
        ("categoria", "Solo académicas: GENERAL · FERIADO · PARCIAL · FINAL · TALLER"),
        ("tipo_actividad", "Solo científicas: CONGRESO · SEMINARIO · TALLER · WEBINAR · MASTER_CLASS · INVESTIGACION"),
        ("nombre_responsable", "Solo científicas: nombre del docente o investigador responsable"),
        ("id_carrera", "Número entero – ver tabla 'Carreras' a la derecha ▶"),
        ("id_gestion", "Número entero – ver tabla 'Gestiones' a la derecha ▶"),
        ("es_cientifica", "FALSE para actividades académicas  |  TRUE para científicas"),
    ]
    alt_fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    for r_off, (col_a, col_b) in enumerate(field_rows, start=3):
        row = r_off
        ca = ws_ref.cell(row=row, column=1, value=col_a)
        cb = ws_ref.cell(row=row, column=2, value=col_b)
        ca.font = Font(bold=True, color="009E96", size=10)
        cb.font = Font(color="334155", size=10)
        if r_off % 2 == 0:
            ca.fill = alt_fill
            cb.fill = alt_fill

    # --- Careers table (column D-F) ---
    ws_ref.cell(row=1, column=4, value="🎓 Carreras (id_carrera)").font = white_bold
    ws_ref.cell(row=1, column=4).fill = green_fill
    ws_ref.cell(row=1, column=4).alignment = center
    ws_ref.merge_cells("D1:F1")

    for col, txt in [(4, "ID"), (5, "Nombre de la Carrera"), (6, "Facultad")]:
        c = ws_ref.cell(row=2, column=col, value=txt)
        c.fill = green_fill
        c.font = white_bold
        c.alignment = center

    for r_off, career in enumerate(careers, start=3):
        row = r_off
        for col, val in [(4, career.id), (5, career.name), (6, career.faculty)]:
            c = ws_ref.cell(row=row, column=col, value=val)
            c.font = Font(color="1E293B", size=10)
            c.alignment = Alignment(horizontal="center" if col == 4 else "left", vertical="center")
            if r_off % 2 == 0:
                c.fill = alt_fill

    # --- Gestiones table (column H-I) ---
    ws_ref.cell(row=1, column=8, value="📅 Gestiones (id_gestion)").font = white_bold
    ws_ref.cell(row=1, column=8).fill = purple_fill
    ws_ref.cell(row=1, column=8).alignment = center
    ws_ref.merge_cells("H1:I1")

    for col, txt in [(8, "ID"), (9, "Nombre de la Gestión")]:
        c = ws_ref.cell(row=2, column=col, value=txt)
        c.fill = purple_fill
        c.font = white_bold
        c.alignment = center

    for r_off, gestion in enumerate(gestiones, start=3):
        row = r_off
        for col, val in [(8, gestion.id), (9, gestion.name)]:
            c = ws_ref.cell(row=row, column=col, value=val)
            c.font = Font(color="1E293B", size=10)
            c.alignment = Alignment(horizontal="center", vertical="center")
            if r_off % 2 == 0:
                c.fill = alt_fill

    # ---- Stream ----
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=plantilla_actividades.xlsx"},
    )



# ---------------------------------------------------------------------------
# Upload Excel
# ---------------------------------------------------------------------------

@router.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file format. Only Excel files are supported.")
    
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(e)}")
        
    records = df.to_dict('records')

    # Accept Spanish column names (from the downloadable template)
    COLUMN_MAP = {
        "titulo": "title",
        "fecha_inicio": "start_date",
        "fecha_fin": "end_date",
        "categoria": "category",
        "tipo_actividad": "activity_type",
        "nombre_responsable": "responsible_name",
        "id_carrera": "career_id",
        "id_gestion": "gestion_id",
        "es_cientifica": "is_scientific",
    }
    renamed_records = []
    for record in records:
        renamed = {COLUMN_MAP.get(k, k): v for k, v in record.items()}
        # normalize is_scientific: accept "TRUE"/"FALSE" strings
        if "is_scientific" in renamed and isinstance(renamed["is_scientific"], str):
            renamed["is_scientific"] = renamed["is_scientific"].strip().upper() == "TRUE"
        renamed_records.append(renamed)
    records = renamed_records

    valid_academic = []
    valid_scientific = []
    errors = []
    
    for i, record in enumerate(records):
        clean_record = {k: v for k, v in record.items() if pd.notnull(v)}
        try:
            validated = ActivityRowValidator(**clean_record)
            
            if validated.is_scientific:
                if not validated.activity_type:
                    errors.append({"row": i + 2, "error": "activity_type is required for scientific activities"})
                    continue
                valid_scientific.append({
                    "title": validated.title,
                    "start_date": validated.start_date,
                    "end_date": validated.end_date,
                    "activity_type": validated.activity_type.value,
                    "responsible_name": validated.responsible_name or "Unknown",
                    "career_id": validated.career_id,
                    "gestion_id": validated.gestion_id,
                    "status": "scheduled",
                })
            else:
                if not validated.category:
                    errors.append({"row": i + 2, "error": "category is required for academic activities"})
                    continue
                valid_academic.append({
                    "title": validated.title,
                    "start_date": validated.start_date,
                    "end_date": validated.end_date,
                    "category": validated.category,
                    "career_id": validated.career_id,
                    "gestion_id": validated.gestion_id,
                })
        except ValidationError as e:
            errors.append({"row": i + 2, "error": str(e)})
    
    inserted_count = 0
    try:
        if valid_academic:
            db.bulk_insert_mappings(AcademicActivity, valid_academic)
            inserted_count += len(valid_academic)
        if valid_scientific:
            db.bulk_insert_mappings(ScientificActivity, valid_scientific)
            inserted_count += len(valid_scientific)
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database insertion failed: {str(e)}")
    
    return {
        "inserted_count": inserted_count,
        "errors": errors
    }
