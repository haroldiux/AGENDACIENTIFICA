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

def create_base_workbook():
    wb = openpyxl.Workbook()

    # Style Helpers
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
                ws.column_dimensions[col_letter].width = 38
            elif header in ["carrera", "tipo_actividad", "categoria"]:
                ws.column_dimensions[col_letter].width = 28
            else:
                ws.column_dimensions[col_letter].width = 18
        ws.row_dimensions[1].height = 28

    # Sheet 1: Academic
    ws_ac = wb.active
    ws_ac.title = "Actividades Académicas"
    academic_headers = [
        "titulo",
        "fecha_inicio",
        "fecha_fin",
        "categoria",
        "carrera",
        "gestion",
        "es_cientifica",
    ]
    style_header_row(ws_ac, academic_headers, "009E96")

    # Sheet 2: Scientific
    ws_sc = wb.create_sheet(title="Actividades Científicas")
    scientific_headers = [
        "titulo",
        "fecha_inicio",
        "fecha_fin",
        "tipo_actividad",
        "nombre_responsable",
        "carrera",
        "gestion",
        "es_cientifica",
    ]
    style_header_row(ws_sc, scientific_headers, "6B3392")

    # Sheet 3: Referencia
    ws_ref = wb.create_sheet(title="Referencia")
    ws_ref.column_dimensions["A"].width = 22
    ws_ref.column_dimensions["B"].width = 50
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
    ws_ref.row_dimensions[1].height = 22

    for col, txt in [(1, "Columna"), (2, "Descripción y formato")]:
        c = ws_ref.cell(row=2, column=col, value=txt)
        c.fill = green_fill
        c.font = white_bold
        c.alignment = Alignment(horizontal="center", vertical="center")

    field_rows = [
        ("titulo", "Nombre de la actividad (requerido)"),
        ("fecha_inicio", "Fecha inicio: DD/MM/AAAA (ej. 03/08/2026)"),
        ("fecha_fin", "Fecha fin: DD/MM/AAAA (igual a inicio si dura 1 día)"),
        ("categoria", "Solo académicas: INICIO_FIN, EXAMEN, FERIADO, ADMINISTRATIVO, CURSO, GENERAL"),
        ("tipo_actividad", "Solo científicas: CONGRESO, WEBINAR, DEFENSA, FERIA, OLIMPIADA, MASTER_CLASS"),
        ("nombre_responsable", "Solo científicas: Nombre y cargo del responsable"),
        ("carrera", "Nombre de la carrera o dejar en blanco para actividades globales/nacionales"),
        ("gestion", "Gestión semestral: ej. 2-2026"),
        ("es_cientifica", "SI para científicas | NO para académicas"),
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
            c.font = Font(color="1E293B", size=9)
            c.alignment = Alignment(horizontal="center", vertical="center")
            if r_idx % 2 == 0:
                c.fill = alt_fill

    # Categorias
    ws_ref.cell(row=1, column=11, value="🏷 Categorías / Tipos").font = white_bold
    ws_ref.cell(row=1, column=11).fill = blue_fill
    ws_ref.cell(row=1, column=11).alignment = Alignment(horizontal="center", vertical="center")
    ws_ref.merge_cells("K1:M1")
    for col, txt in [(11, "Código"), (12, "Nombre"), (13, "Ámbito")]:
        c = ws_ref.cell(row=2, column=col, value=txt)
        c.fill = blue_fill
        c.font = white_bold
        c.alignment = Alignment(horizontal="center", vertical="center")

    for r_idx, (code, name, scope) in enumerate(CATEGORIES, start=3):
        for col, val in [(11, code), (12, name), (13, scope)]:
            c = ws_ref.cell(row=r_idx, column=col, value=val)
            c.font = Font(color="1E293B", size=9)
            if col != 12:
                c.alignment = Alignment(horizontal="center", vertical="center")
            if r_idx % 2 == 0:
                c.fill = alt_fill

    # Validations
    dv_bool = DataValidation(type="list", formula1='"SI,NO"', allow_blank=True)
    ws_ac.add_data_validation(dv_bool)
    dv_bool.add("G2:G200")

    dv_bool_sc = DataValidation(type="list", formula1='"SI,NO"', allow_blank=True)
    ws_sc.add_data_validation(dv_bool_sc)
    dv_bool_sc.add("H2:H200")

    career_ref = f"'Referencia'!E3:E{2 + len(CAREERS)}"
    dv_car_ac = DataValidation(type="list", formula1=career_ref, allow_blank=True)
    ws_ac.add_data_validation(dv_car_ac)
    dv_car_ac.add("E2:E200")

    dv_car_sc = DataValidation(type="list", formula1=career_ref, allow_blank=True)
    ws_sc.add_data_validation(dv_car_sc)
    dv_car_sc.add("F2:F200")

    gestion_ref = f"'Referencia'!I3:I{2 + len(GESTIONES)}"
    dv_ges_ac = DataValidation(type="list", formula1=gestion_ref, allow_blank=True)
    ws_ac.add_data_validation(dv_ges_ac)
    dv_ges_ac.add("F2:F200")

    dv_ges_sc = DataValidation(type="list", formula1=gestion_ref, allow_blank=True)
    ws_sc.add_data_validation(dv_ges_sc)
    dv_ges_sc.add("G2:G200")

    dv_types = DataValidation(type="list", formula1='"CONGRESO,WEBINAR,DEFENSA,FERIA,OLIMPIADA,MASTER_CLASS"', allow_blank=True)
    ws_sc.add_data_validation(dv_types)
    dv_types.add("D2:D200")

    dv_cat = DataValidation(type="list", formula1='"INICIO_FIN,EXAMEN,FERIADO,ADMINISTRATIVO,CURSO,GENERAL"', allow_blank=True)
    ws_ac.add_data_validation(dv_cat)
    dv_cat.add("D2:D200")

    # Format Date Columns
    for r in range(2, 201):
        ws_ac.cell(row=r, column=2).number_format = "DD/MM/YYYY"
        ws_ac.cell(row=r, column=3).number_format = "DD/MM/YYYY"
        ws_sc.cell(row=r, column=2).number_format = "DD/MM/YYYY"
        ws_sc.cell(row=r, column=3).number_format = "DD/MM/YYYY"

    return wb, ws_ac, ws_sc


def add_rows(ws, rows_data):
    row_font = Font(name="Calibri", size=10, color="0F172A")
    thin_border = Border(
        bottom=Side(border_style="thin", color="E2E8F0"),
        right=Side(border_style="thin", color="E2E8F0"),
        left=Side(border_style="thin", color="E2E8F0"),
    )
    for r_idx, row in enumerate(rows_data, start=2):
        ws.row_dimensions[r_idx].height = 22
        for c_idx, val in enumerate(row, start=1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = row_font
            cell.border = thin_border
            if c_idx in [2, 3, 6, 7, 8]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")


# ==============================================================================
# 1. VICERRECTORADO ACADÉMICO NACIONAL
# ==============================================================================
def generate_vicerrectorado_template():
    wb, ws_ac, ws_sc = create_base_workbook()
    
    # Planificación Académica Nacional para TODAS las carreras (carrera = None/vacio)
    rows_academic = [
        ["Inauguración Oficial y Apertura del Semestre Académico 2-2026", "03/08/2026", "03/08/2026", "INICIO_FIN", None, "2-2026", "NO"],
        ["Periodo Ordinario de Registro, Inscripción y Ajuste de Materias", "03/08/2026", "08/08/2026", "ADMINISTRATIVO", None, "2-2026", "NO"],
        ["Feriado Nacional — Aniversario de la Independencia de Bolivia", "06/08/2026", "06/08/2026", "FERIADO", None, "2-2026", "NO"],
        ["Feriado Departamental — Efeméride de Cochabamba", "14/09/2026", "14/09/2026", "FERIADO", None, "2-2026", "NO"],
        ["Primera Semana Nacional de Evaluaciones Parciales", "14/09/2026", "19/09/2026", "EXAMEN", None, "2-2026", "NO"],
        ["Receso Académico Institucional de Medio Término", "05/10/2026", "09/10/2026", "INICIO_FIN", None, "2-2026", "NO"],
        ["Segunda Semana Nacional de Evaluaciones Parciales", "26/10/2026", "31/10/2026", "EXAMEN", None, "2-2026", "NO"],
        ["Periodo Nacional de Evaluaciones Finales Ordinarias", "23/11/2026", "28/11/2026", "EXAMEN", None, "2-2026", "NO"],
        ["Semana Nacional de Evaluaciones de Segundo Turno", "30/11/2026", "05/12/2026", "EXAMEN", None, "2-2026", "NO"],
        ["Cierre Nacional del Semestre y Entrega de Actas al Vicerrectorado", "07/12/2026", "11/12/2026", "ADMINISTRATIVO", None, "2-2026", "NO"],
    ]
    add_rows(ws_ac, rows_academic)

    # Info banner in sheet scientific explaining role scope
    ws_sc.cell(row=2, column=1, value="ℹ Nota de Rol: Vicerrectorado Académico Nacional no carga actividades científicas (estas son planificadas por la Dirección de Investigación y las Jefaturas de Carrera).").font = Font(italic=True, color="64748B", size=9)

    out_path = os.path.join("material_demostracion", "01_Rol_VICERRECTORADO_ACADEMICO_NACIONAL_2-2026.xlsx")
    wb.save(out_path)
    print(f"Generated: {out_path}")


# ==============================================================================
# 2. DIRECCIÓN DE INVESTIGACIÓN
# ==============================================================================
def generate_direccion_investigacion_template():
    wb, ws_ac, ws_sc = create_base_workbook()

    # Planificación Científica Nacional y Seguimiento Semestral a todas las carreras
    rows_scientific = [
        ["XV Congreso Internacional Multidisciplinario de Investigación Científica UNITEPC", "24/08/2026", "26/08/2026", "CONGRESO", "Dr. Alejandro Morales (Director Nacional de Investigación)", None, "2-2026", "SI"],
        ["Taller Nacional: Formulación de Proyectos Científicos y Fondos Concursables", "01/09/2026", "02/09/2026", "WEBINAR", "Dirección de Investigación", None, "2-2026", "SI"],
        ["Ciclo de Capacitación: Redacción y Publicación en Revistas Scopus y SciELO", "10/09/2026", "11/09/2026", "WEBINAR", "Comité Editorial Científico UNITEPC", None, "2-2026", "SI"],
        ["Seguimiento Semestral: Auditoría y Corte de Avance de Proyectos Científicos por Carrera", "28/09/2026", "30/09/2026", "DEFENSA", "Equipo Técnico de Seguimiento a la Investigación", None, "2-2026", "SI"],
        ["Feria Nacional Multidisciplinaria de Innovación Científica y Tecnológica UNITEPC", "15/10/2026", "16/10/2026", "FERIA", "Comisión Nacional de Ferias Científicas", None, "2-2026", "SI"],
        ["Simposio Nacional: Bioética y Buenas Prácticas en Investigación con Seres Vivos", "22/10/2026", "22/10/2026", "MASTER_CLASS", "Comité de Bioética en Investigación UNITEPC", None, "2-2026", "SI"],
        ["Seguimiento Semestral: Evaluación Final de Cumplimiento de Metas y Cierre de Indicadores", "18/11/2026", "20/11/2026", "DEFENSA", "Dirección Nacional de Investigación", None, "2-2026", "SI"],
        ["Encuentro Anual de Semilleros y Sociedades Científicas Estudiantiles UNITEPC", "26/11/2026", "27/11/2026", "CONGRESO", "Coordinación Nacional de Semilleros", None, "2-2026", "SI"],
    ]
    add_rows(ws_sc, rows_scientific)

    # Info banner in sheet academic
    ws_ac.cell(row=2, column=1, value="ℹ Nota de Rol: Dirección de Investigación no carga actividades académicas (las académicas son emitidas por Vicerrectorado y Direcciones de Carrera).").font = Font(italic=True, color="64748B", size=9)

    out_path = os.path.join("material_demostracion", "02_Rol_DIRECCION_DE_INVESTIGACION_2-2026.xlsx")
    wb.save(out_path)
    print(f"Generated: {out_path}")


# ==============================================================================
# 3. JEFATURA DE INVESTIGACIÓN POR CARRERA (Ingeniería de Sistemas)
# ==============================================================================
def generate_jefatura_investigacion_sistemas_template():
    wb, ws_ac, ws_sc = create_base_workbook()

    # Planificación de Nuevas Actividades de Investigación de su Carrera
    rows_scientific = [
        ["Webinar Especializado: Arquitecturas Distribuidas y Microservicios Resilientes", "18/08/2026", "18/08/2026", "WEBINAR", "Ing. Carlos Méndez (Jefe de Investigación Sistemas)", "Ingeniería de Sistemas", "2-2026", "SI"],
        ["Hackathon UNITEPC: Desarrollo de Soluciones con IA Generativa y Visión por Computadora", "22/09/2026", "23/09/2026", "OLIMPIADA", "Ing. Carlos Méndez / Ing. Laura Torrez", "Ingeniería de Sistemas", "2-2026", "SI"],
        ["Feria Tecnológica de Internet de las Cosas (IoT), Domótica y Robótica Aplicada", "08/10/2026", "09/10/2026", "FERIA", "Ing. Marco Antonio Siles", "Ingeniería de Sistemas", "2-2026", "SI"],
        ["Jornada de Defensa Pública de Perfiles y Proyectos de Investigación de Sistemas", "05/11/2026", "06/11/2026", "DEFENSA", "Tribunal de Investigación de Ingeniería de Sistemas", "Ingeniería de Sistemas", "2-2026", "SI"],
        ["Master Class Internacional: Computación Cuántica y Criptografía Post-Cuántica", "19/11/2026", "19/11/2026", "MASTER_CLASS", "Dr. Hernán Villarroel (Docente Investigador)", "Ingeniería de Sistemas", "2-2026", "SI"],
        ["Publicación y Lanzamiento del Volumen Semestral de la Revista Científica 'Bytes UNITEPC'", "03/12/2026", "03/12/2026", "CONGRESO", "Jefatura de Investigación de Sistemas", "Ingeniería de Sistemas", "2-2026", "SI"],
    ]
    add_rows(ws_sc, rows_scientific)

    ws_ac.cell(row=2, column=1, value="ℹ Nota de Rol: La Jefatura de Investigación por Carrera no carga exámenes ni fechas de clases (esto compete a la Dirección de Carrera).").font = Font(italic=True, color="64748B", size=9)

    out_path = os.path.join("material_demostracion", "03_Rol_JEFATURA_DE_INVESTIGACION_Sistemas_2-2026.xlsx")
    wb.save(out_path)
    print(f"Generated: {out_path}")


# ==============================================================================
# 4. DIRECCIÓN DE CARRERA (Medicina)
# ==============================================================================
def generate_direccion_carrera_medicina_template():
    wb, ws_ac, ws_sc = create_base_workbook()

    # Planificación de Actividades Académicas y Curriculares de la Carrera de Medicina
    rows_academic = [
        ["Acto de Bienvenida e Inducción de Estudiantes a Campos Clínicos y Hospitalarios", "10/08/2026", "11/08/2026", "INICIO_FIN", "Medicina", "2-2026", "NO"],
        ["Primera Ronda de Rotaciones Hospitalarias de Pregrado y Práctica Comunitaria", "17/08/2026", "21/08/2026", "CURSO", "Medicina", "2-2026", "NO"],
        ["Examen Parcial de Anatomía Humana, Embriología y Fisiología Médica", "21/09/2026", "23/09/2026", "EXAMEN", "Medicina", "2-2026", "NO"],
        ["Evaluación Clínica Objetiva Estructurada - ECOE de Medio Término", "28/09/2026", "30/09/2026", "EXAMEN", "Medicina", "2-2026", "NO"],
        ["Segunda Ronda de Rotaciones Hospitalarias y Simulación Clínica de Urgencias", "19/10/2026", "23/10/2026", "CURSO", "Medicina", "2-2026", "NO"],
        ["Entrega y Revisión Oficial de Récords Quirúrgicos de Internado Rotatorio", "16/11/2026", "17/11/2026", "ADMINISTRATIVO", "Medicina", "2-2026", "NO"],
        ["Examen Final Teórico-Práctico de Cirugía, Pediatría y Medicina Interna", "30/11/2026", "02/12/2026", "EXAMEN", "Medicina", "2-2026", "NO"],
        ["Defensas de Grado y Actos de Titulación de Nuevos Médicos Cirujanos UNITEPC", "09/12/2026", "11/12/2026", "ADMINISTRATIVO", "Medicina", "2-2026", "NO"],
    ]
    add_rows(ws_ac, rows_academic)

    ws_sc.cell(row=2, column=1, value="ℹ Nota de Rol: Las actividades científicas de Medicina son gestionadas por la Jefatura de Investigación de la Facultad.").font = Font(italic=True, color="64748B", size=9)

    out_path = os.path.join("material_demostracion", "04_Rol_DIRECCION_DE_CARRERA_Medicina_2-2026.xlsx")
    wb.save(out_path)
    print(f"Generated: {out_path}")


# ==============================================================================
# 5. DIRECCIÓN DE CARRERA (Ingeniería de Sistemas) - Complementaria para contraste
# ==============================================================================
def generate_direccion_carrera_sistemas_template():
    wb, ws_ac, ws_sc = create_base_workbook()

    # Planificación de Actividades Académicas de Ingeniería de Sistemas (permite ver el choque con el Hackathon!)
    rows_academic = [
        ["Inducción y Verificación de Laboratorios de Cómputo, Servidores y Redes Cisco", "05/08/2026", "06/08/2026", "INICIO_FIN", "Ingeniería de Sistemas", "2-2026", "NO"],
        ["Primer Examen Parcial de Ingeniería de Software, Bases de Datos y Algoritmos", "21/09/2026", "23/09/2026", "EXAMEN", "Ingeniería de Sistemas", "2-2026", "NO"],
        ["Revisión Oficial de Avance Curricular y Perfiles de Proyectos de Grado I y II", "19/10/2026", "20/10/2026", "ADMINISTRATIVO", "Ingeniería de Sistemas", "2-2026", "NO"],
        ["Examen Final Práctico de Arquitectura de Sistemas y Cloud Computing", "30/11/2026", "02/12/2026", "EXAMEN", "Ingeniería de Sistemas", "2-2026", "NO"],
        ["Defensas de Grado y Exámenes de Grado de Licenciatura en Ingeniería de Sistemas", "07/12/2026", "09/12/2026", "ADMINISTRATIVO", "Ingeniería de Sistemas", "2-2026", "NO"],
    ]
    add_rows(ws_ac, rows_academic)

    ws_sc.cell(row=2, column=1, value="ℹ Nota de Rol: Las actividades científicas (Hackathon, Ferias) son gestionadas por la Jefatura de Investigación de Sistemas.").font = Font(italic=True, color="64748B", size=9)

    out_path = os.path.join("material_demostracion", "05_Rol_DIRECCION_DE_CARRERA_Sistemas_2-2026.xlsx")
    wb.save(out_path)
    print(f"Generated: {out_path}")


if __name__ == "__main__":
    generate_vicerrectorado_template()
    generate_direccion_investigacion_template()
    generate_jefatura_investigacion_sistemas_template()
    generate_direccion_carrera_medicina_template()
    generate_direccion_carrera_sistemas_template()
    print("All role templates successfully generated!")
