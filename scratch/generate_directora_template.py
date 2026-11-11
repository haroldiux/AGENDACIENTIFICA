import os
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

CAREERS = [
    (1, "Medicina", "Facultad de Ciencias de la Salud"),
    (2, "Odontología", "Facultad de Ciencias de la Salud"),
    (3, "Enfermería", "Facultad de Ciencias de la Salud"),
    (4, "Medicina Veterinaria y Zootecnia", "Facultad de Ciencias de la Salud"),
    (5, "Fisioterapia y Kinesiología", "Facultad de Ciencias de la Salud"),
    (6, "Bioquímica y Farmacia", "Facultad de Ciencias de la Salud"),
    (7, "Fonoaudiología", "Facultad de Ciencias de la Salud"),
    (8, "Nutrición y Dietética", "Facultad de Ciencias de la Salud"),
    (9, "Tec. Superior Prótesis Dental", "Facultad de Ciencias de la Salud"),
    (10, "Ingeniería de Sonido", "Facultad de Ciencias de la Ingeniería"),
    (11, "Ingeniería de Sistemas", "Facultad de Ciencias de la Ingeniería"),
    (12, "Ingeniería Electrónica", "Facultad de Ciencias de la Ingeniería"),
    (13, "Ingeniería Biomédica", "Facultad de Ciencias de la Ingeniería"),
    (14, "Contaduría Pública", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    (15, "Economía", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    (16, "Administración de Empresas", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    (17, "Ingeniería Comercial", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    (18, "Contaduría Pública (Complementaria)", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    (19, "Administración de Empresas (Complementaria)", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    (20, "Ingeniería Comercial (Complementaria)", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    (21, "Comunicación Social", "Facultad de Ciencias Sociales y Jurídicas"),
    (22, "Derecho", "Facultad de Ciencias Sociales y Jurídicas"),
    (23, "Artes y Escultura", "Facultad de Ciencias Sociales y Jurídicas"),
    (24, "Cinematografía", "Facultad de Ciencias Sociales y Jurídicas"),
]

GESTIONES = [
    (1, "1-2024"),
    (2, "2-2024"),
    (3, "1-2025"),
    (4, "2-2025"),
    (5, "1-2026"),
    (6, "2-2026"),
    (7, "1-2027"),
    (8, "2-2027"),
]

CATEGORIES = [
    ("INICIO_FIN", "Inicio y Cierre de Semestre", "academic"),
    ("EXAMEN", "Exámenes y Evaluaciones", "academic"),
    ("FERIADO", "Feriados y Efemérides", "academic"),
    ("ADMINISTRATIVO", "Actividades Administrativas", "both"),
    ("CURSO", "Cursos y Talleres Curriculares", "academic"),
    ("GENERAL", "Actividades Generales", "both"),
    ("CONGRESO", "Congresos y Simposios", "scientific"),
    ("WEBINAR", "Webinars y Seminarios", "scientific"),
    ("DEFENSA", "Defensas de Tesis y Proyectos", "scientific"),
    ("FERIA", "Ferias Científicas y Tecnológicas", "scientific"),
    ("OLIMPIADA", "Olimpiadas y Hackathons", "scientific"),
    ("MASTER_CLASS", "Clases Magistrales y Conferencias", "scientific"),
]

def generate_directora_investigacion_2027():
    wb = openpyxl.Workbook()

    def style_header_row(ws, headers: list, fill_color: str):
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
            col_letter = get_column_letter(col_idx)
            if header in ["titulo", "nombre_responsable"]:
                ws.column_dimensions[col_letter].width = 40
            elif header in ["carrera", "tipo_actividad", "categoria"]:
                ws.column_dimensions[col_letter].width = 30
            else:
                ws.column_dimensions[col_letter].width = 18
        ws.row_dimensions[1].height = 30

    # Sheet 1: Academic
    ws_ac = wb.active
    ws_ac.title = "Actividades Académicas"
    academic_headers = ["titulo", "fecha_inicio", "fecha_fin", "categoria", "carrera", "gestion", "es_cientifica"]
    style_header_row(ws_ac, academic_headers, "009E96")
    ws_ac.cell(
        row=2,
        column=1,
        value="ℹ NOTA PARA LA DIRECTORA DE INVESTIGACIÓN: Esta hoja corresponde a la planificación académica (exámenes y clases cargados por Vicerrectorado y Direcciones de Carrera). Déjala vacía; tus actividades se cargan en la pestaña 'Actividades Científicas'."
    ).font = Font(italic=True, color="64748B", size=9)

    # Sheet 2: Scientific
    ws_sc = wb.create_sheet(title="Actividades Científicas")
    scientific_headers = ["titulo", "fecha_inicio", "fecha_fin", "tipo_actividad", "nombre_responsable", "carrera", "gestion", "es_cientifica"]
    style_header_row(ws_sc, scientific_headers, "6B3392")

    # Sheet 3: Reference
    ws_ref = wb.create_sheet(title="Referencia")
    ws_ref.column_dimensions["A"].width = 22
    ws_ref.column_dimensions["B"].width = 52
    ws_ref.column_dimensions["D"].width = 8
    ws_ref.column_dimensions["E"].width = 34
    ws_ref.column_dimensions["F"].width = 36
    ws_ref.column_dimensions["H"].width = 8
    ws_ref.column_dimensions["I"].width = 18
    ws_ref.column_dimensions["K"].width = 16
    ws_ref.column_dimensions["L"].width = 30
    ws_ref.column_dimensions["M"].width = 16

    dark_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    green_fill = PatternFill(start_color="009E96", end_color="009E96", fill_type="solid")
    purple_fill = PatternFill(start_color="6B3392", end_color="6B3392", fill_type="solid")
    blue_fill = PatternFill(start_color="2563EB", end_color="2563EB", fill_type="solid")
    white_bold = Font(bold=True, color="FFFFFF", size=10)
    alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

    ws_ref.cell(row=1, column=1, value="📋 Campos del archivo Excel").font = white_bold
    ws_ref.cell(row=1, column=1).fill = dark_fill
    ws_ref.cell(row=1, column=1).alignment = Alignment(horizontal="center", vertical="center")
    ws_ref.merge_cells("A1:B1")

    for col, txt in [(1, "Columna"), (2, "Descripción y formato")]:
        c = ws_ref.cell(row=2, column=col, value=txt)
        c.fill = green_fill
        c.font = white_bold
        c.alignment = Alignment(horizontal="center", vertical="center")

    field_rows = [
        ("titulo", "Nombre de la actividad científica (requerido)"),
        ("fecha_inicio", "Fecha inicio: DD/MM/AAAA (ej. 15/03/2027)"),
        ("fecha_fin", "Fecha fin: DD/MM/AAAA (igual a inicio si dura 1 día)"),
        ("tipo_actividad", "CONGRESO, WEBINAR, DEFENSA, FERIA, OLIMPIADA, MASTER_CLASS"),
        ("nombre_responsable", "Dra. María Lorena Orellana Aguilar o responsable del evento"),
        ("carrera", "Dejar en blanco para eventos de alcance institucional/nacional (todas las carreras)"),
        ("gestion", "Seleccionar 1-2027"),
        ("es_cientifica", "SI"),
    ]
    for r_idx, (col_a, col_b) in enumerate(field_rows, start=3):
        ca = ws_ref.cell(row=r_idx, column=1, value=col_a)
        cb = ws_ref.cell(row=r_idx, column=2, value=col_b)
        ca.font = Font(bold=True, color="009E96", size=9)
        cb.font = Font(color="334155", size=9)
        if r_idx % 2 == 0:
            ca.fill = alt_fill
            cb.fill = alt_fill

    # Careers
    ws_ref.cell(row=1, column=4, value="🎓 Carreras Oficiales UNITEPC").font = white_bold
    ws_ref.cell(row=1, column=4).fill = green_fill
    ws_ref.cell(row=1, column=4).alignment = Alignment(horizontal="center", vertical="center")
    ws_ref.merge_cells("D1:F1")
    for col, txt in [(4, "ID"), (5, "Nombre de Carrera"), (6, "Facultad")]:
        c = ws_ref.cell(row=2, column=col, value=txt)
        c.fill = green_fill
        c.font = white_bold
        c.alignment = Alignment(horizontal="center", vertical="center")

    for r_idx, (c_id, c_name, c_fac) in enumerate(CAREERS, start=3):
        for col, val in [(4, c_id), (5, c_name), (6, c_fac)]:
            c = ws_ref.cell(row=r_idx, column=col, value=val)
            c.font = Font(color="1E293B", size=9)
            if col == 4:
                c.alignment = Alignment(horizontal="center", vertical="center")
            if r_idx % 2 == 0:
                c.fill = alt_fill

    # Gestiones
    ws_ref.cell(row=1, column=8, value="📅 Gestiones").font = white_bold
    ws_ref.cell(row=1, column=8).fill = purple_fill
    ws_ref.cell(row=1, column=8).alignment = Alignment(horizontal="center", vertical="center")
    ws_ref.merge_cells("H1:I1")
    for col, txt in [(8, "ID"), (9, "Gestión")]:
        c = ws_ref.cell(row=2, column=col, value=txt)
        c.fill = purple_fill
        c.font = white_bold
        c.alignment = Alignment(horizontal="center", vertical="center")

    for r_idx, (g_id, g_name) in enumerate(GESTIONES, start=3):
        for col, val in [(8, g_id), (9, g_name)]:
            c = ws_ref.cell(row=r_idx, column=col, value=val)
            c.font = Font(bold=(g_name == "1-2027"), color="059669" if g_name == "1-2027" else "1E293B", size=9)
            c.alignment = Alignment(horizontal="center", vertical="center")
            if r_idx % 2 == 0:
                c.fill = alt_fill

    # Data Validations
    dv_bool_sc = DataValidation(type="list", formula1='"SI,NO"', allow_blank=True)
    ws_sc.add_data_validation(dv_bool_sc)
    dv_bool_sc.add("H2:H200")

    career_ref = f"'Referencia'!E3:E{2 + len(CAREERS)}"
    dv_car_sc = DataValidation(type="list", formula1=career_ref, allow_blank=True)
    ws_sc.add_data_validation(dv_car_sc)
    dv_car_sc.add("F2:F200")

    gestion_ref = f"'Referencia'!I3:I{2 + len(GESTIONES)}"
    dv_ges_sc = DataValidation(type="list", formula1=gestion_ref, allow_blank=True)
    ws_sc.add_data_validation(dv_ges_sc)
    dv_ges_sc.add("G2:G200")

    dv_types = DataValidation(type="list", formula1='"CONGRESO,WEBINAR,DEFENSA,FERIA,OLIMPIADA,MASTER_CLASS"', allow_blank=True)
    ws_sc.add_data_validation(dv_types)
    dv_types.add("D2:D200")

    # Format Date Columns
    for r in range(2, 201):
        ws_ac.cell(row=r, column=2).number_format = "DD/MM/YYYY"
        ws_ac.cell(row=r, column=3).number_format = "DD/MM/YYYY"
        ws_sc.cell(row=r, column=2).number_format = "DD/MM/YYYY"
        ws_sc.cell(row=r, column=3).number_format = "DD/MM/YYYY"

    # Add rows for Dra. María Lorena Orellana Aguilar for Gestión 1-2027
    directora_name = "Dra. María Lorena Orellana Aguilar"
    rows_scientific_2027 = [
        ["XVI Congreso Internacional de Investigación Científica e Innovación UNITEPC 2027", "15/03/2027", "17/03/2027", "CONGRESO", f"{directora_name} (Directora de Investigación)", None, "1-2027", "SI"],
        ["Taller Nacional de Formulación de Proyectos de Investigación y Fondos Concursables 1-2027", "05/04/2027", "06/04/2027", "WEBINAR", directora_name, None, "1-2027", "SI"],
        ["Ciclo de Capacitación Docente: Publicación en Revistas Indexadas Scopus, WoS y SciELO", "22/04/2027", "23/04/2027", "WEBINAR", f"Comité Editorial / {directora_name}", None, "1-2027", "SI"],
        ["Seguimiento Semestral: Primera Auditoría y Evaluación de Avance de Proyectos por Carrera", "10/05/2027", "12/05/2027", "DEFENSA", f"Dirección de Investigación — {directora_name}", None, "1-2027", "SI"],
        ["Feria Científica Nacional de Innovación y Desarrollo Tecnológico UNITEPC 2027", "27/05/2027", "28/05/2027", "FERIA", "Comisión Nacional de Investigación UNITEPC", None, "1-2027", "SI"],
        ["Simposio Nacional de Bioética y Seguridad en Ensayos e Investigaciones Biomédicas", "10/06/2027", "10/06/2027", "MASTER_CLASS", f"Comité de Bioética / {directora_name}", None, "1-2027", "SI"],
        ["Seguimiento Semestral: Cierre de Indicadores y Evaluación de Cumplimiento de Metas 1-2027", "21/06/2027", "23/06/2027", "DEFENSA", f"Dirección de Investigación — {directora_name}", None, "1-2027", "SI"],
        ["Encuentro Anual de Sociedades Científicas y Semilleros de Investigación UNITEPC", "28/06/2027", "29/06/2027", "CONGRESO", f"Coordinación de Semilleros / {directora_name}", None, "1-2027", "SI"],
    ]

    row_font = Font(name="Calibri", size=10, color="0F172A")
    thin_border = Border(
        bottom=Side(border_style="thin", color="E2E8F0"),
        right=Side(border_style="thin", color="E2E8F0"),
        left=Side(border_style="thin", color="E2E8F0"),
    )
    for r_idx, row in enumerate(rows_scientific_2027, start=2):
        ws_sc.row_dimensions[r_idx].height = 22
        for c_idx, val in enumerate(row, start=1):
            cell = ws_sc.cell(row=r_idx, column=c_idx, value=val)
            cell.font = row_font
            cell.border = thin_border
            if c_idx in [2, 3, 6, 7, 8]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    out_file = os.path.join("material_demostracion", "Plantilla_Direccion_Investigacion_1-2027_Dra_Maria_Lorena_Orellana.xlsx")
    wb.save(out_file)
    print("Generated successfully:", out_file)

if __name__ == "__main__":
    generate_directora_investigacion_2027()
