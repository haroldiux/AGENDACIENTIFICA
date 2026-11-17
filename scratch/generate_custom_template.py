import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

def create_complete_template(output_path="plantilla_actividades_unitepc_2026.xlsx"):
    wb = openpyxl.Workbook()

    # Brand Colors
    teal_fill = PatternFill(start_color="009E96", end_color="009E96", fill_type="solid")
    purple_fill = PatternFill(start_color="6B3392", end_color="6B3392", fill_type="solid")
    dark_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    gray_header_fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
    zebra_even = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    zebra_odd = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

    font_white_bold = Font(bold=True, color="FFFFFF", size=11)
    font_cell = Font(size=10, color="0F172A")
    font_italic = Font(italic=True, size=9, color="64748B")

    thin_border = Border(
        left=Side(style="thin", color="E2E8F0"),
        right=Side(style="thin", color="E2E8F0"),
        top=Side(style="thin", color="E2E8F0"),
        bottom=Side(style="thin", color="E2E8F0")
    )

    center_align = Alignment(horizontal="center", vertical="center")
    left_align = Alignment(horizontal="left", vertical="center")

    # -------------------------------------------------------------
    # 1. Hoja: Actividades Académicas
    # -------------------------------------------------------------
    ws_ac = wb.active
    ws_ac.title = "Actividades Académicas"

    academic_headers = [
        "titulo",
        "fecha_inicio",
        "fecha_fin",
        "categoria",
        "carrera",
        "gestion",
        "es_cientifica"
    ]

    for col_idx, h in enumerate(academic_headers, start=1):
        cell = ws_ac.cell(row=1, column=col_idx, value=h)
        cell.fill = teal_fill
        cell.font = font_white_bold
        cell.alignment = center_align
    ws_ac.row_dimensions[1].height = 28

    academic_rows = [
        # Vicerrectorado Nacional (General Institucional)
        ("Inauguración Oficial del Segundo Semestre Académico 2026", "03/08/2026", "03/08/2026", "General", "", "2-2026", "NO"),
        ("Primer Periodo de Exámenes Parciales Institucional", "14/09/2026", "25/09/2026", "Examen Parcial", "", "2-2026", "NO"),
        ("Segundo Periodo de Exámenes Parciales Institucional", "19/10/2026", "30/10/2026", "Examen Parcial", "", "2-2026", "NO"),
        ("Evaluación Docente y Seguimiento Curricular Vicerrectorado", "18/11/2026", "20/11/2026", "Docencia y Gestión Académica", "", "2-2026", "NO"),
        ("Periodo de Exámenes Finales y Evaluación Institucional", "07/12/2026", "18/12/2026", "Examen Final", "", "2-2026", "NO"),
        ("Cierre de Gestión Académica 2-2026 y Publicación de Actas", "21/12/2026", "23/12/2026", "Docencia y Gestión Académica", "", "2-2026", "NO"),

        # Ingeniería de Sistemas - Académicas
        ("Jornadas de Inducción y Nivelación en Algoritmos y Datos", "10/08/2026", "14/08/2026", "General", "Ingeniería de Sistemas", "2-2026", "NO"),
        ("Revisión de Avance de Proyectos Integradores de Sistemas", "20/11/2026", "20/11/2026", "Docencia y Gestión Académica", "Ingeniería de Sistemas", "2-2026", "NO"),
        ("Defensa y Tribunal de Proyectos de Grado Sistemas", "30/11/2026", "04/12/2026", "Examen Final", "Ingeniería de Sistemas", "2-2026", "NO"),

        # Ingeniería de Sistemas - Interacción Social / Extensión
        ("Campeonato Relámpago de Fútbol 8 e Integración 'Copa Sistemas UNITEPC'", "21/11/2026", "22/11/2026", "Extensión e Interacción Social", "Ingeniería de Sistemas", "2-2026", "NO"),
        ("Campaña de Alfabetización Digital y Ciberseguridad Comunitaria", "28/11/2026", "28/11/2026", "Extensión e Interacción Social", "Ingeniería de Sistemas", "2-2026", "NO"),
        ("Torneo E-Sports y Confraternización Estudiantil de Sistemas", "05/12/2026", "05/12/2026", "Extensión e Interacción Social", "Ingeniería de Sistemas", "2-2026", "NO"),
    ]

    for row_idx, row_data in enumerate(academic_rows, start=2):
        ws_ac.row_dimensions[row_idx].height = 22
        fill = zebra_even if row_idx % 2 == 0 else zebra_odd
        for col_idx, val in enumerate(row_data, start=1):
            cell = ws_ac.cell(row=row_idx, column=col_idx, value=val)
            cell.fill = fill
            cell.font = font_cell
            cell.border = thin_border
            if col_idx in [2, 3]:
                cell.alignment = center_align
                cell.number_format = "DD/MM/YYYY"
            elif col_idx in [4, 5, 6, 7]:
                cell.alignment = center_align
            else:
                cell.alignment = left_align

    # -------------------------------------------------------------
    # 2. Hoja: Actividades Científicas
    # -------------------------------------------------------------
    ws_sc = wb.create_sheet(title="Actividades Científicas")

    scientific_headers = [
        "titulo",
        "fecha_inicio",
        "fecha_fin",
        "tipo_actividad",
        "nombre_responsable",
        "carrera",
        "gestion",
        "es_cientifica"
    ]

    for col_idx, h in enumerate(scientific_headers, start=1):
        cell = ws_sc.cell(row=1, column=col_idx, value=h)
        cell.fill = purple_fill
        cell.font = font_white_bold
        cell.alignment = center_align
    ws_sc.row_dimensions[1].height = 28

    scientific_rows = [
        # Vicerrectorado de Investigación (Institucional / Global)
        ("Congreso Internacional de Ciencia, Tecnología e Innovación UNITEPC 2026", "15/10/2026", "17/10/2026", "CONGRESO", "Dr. Marcelo Quiroga - Vicerrectorado de Investigación", "", "2-2026", "SI"),
        ("Webinar Internacional: Redacción y Publicación en Revistas Scopus y WoS", "19/11/2026", "19/11/2026", "WEBINAR", "Dra. Elena Ríos", "", "2-2026", "SI"),
        ("Feria Científica Nacional de Innovación Universitaria 'ExpoCiencia UNITEPC'", "26/11/2026", "27/11/2026", "FERIA", "Comité Científico UNITEPC", "", "2-2026", "SI"),
        ("Panel de Expertos: Ética en la Investigación y Propiedad Intelectual", "10/12/2026", "10/12/2026", "WEBINAR", "Lic. Patricia Mendoza", "", "2-2026", "SI"),

        # Ingeniería de Sistemas - Investigación y Desarrollo Tecnológico
        ("Hackathon Universitario de Inteligencia Artificial y Cloud Computing", "20/11/2026", "21/11/2026", "CONGRESO", "Ing. Carlos Meneses", "Ingeniería de Sistemas", "2-2026", "SI"),
        ("Workshop Práctico: Modelos LLM y Desarrollo de Software Seguro", "24/11/2026", "24/11/2026", "WEBINAR", "Ing. David Torrico", "Ingeniería de Sistemas", "2-2026", "SI"),
        ("Olimpiada de Programación Competitiva y Algoritmos Sistemas 2026", "03/12/2026", "04/12/2026", "OLIMPIADA", "Lic. Marco Antonio Balderrama", "Ingeniería de Sistemas", "2-2026", "SI"),
        ("Defensa Pública de Tesis y Proyectos de Investigación de Sistemas", "14/12/2026", "16/12/2026", "DEFENSA", "Tribunal de Investigación de Sistemas", "Ingeniería de Sistemas", "2-2026", "SI"),
    ]

    for row_idx, row_data in enumerate(scientific_rows, start=2):
        ws_sc.row_dimensions[row_idx].height = 22
        fill = zebra_even if row_idx % 2 == 0 else zebra_odd
        for col_idx, val in enumerate(row_data, start=1):
            cell = ws_sc.cell(row=row_idx, column=col_idx, value=val)
            cell.fill = fill
            cell.font = font_cell
            cell.border = thin_border
            if col_idx in [2, 3]:
                cell.alignment = center_align
                cell.number_format = "DD/MM/YYYY"
            elif col_idx in [4, 6, 7, 8]:
                cell.alignment = center_align
            else:
                cell.alignment = left_align

    # -------------------------------------------------------------
    # 3. Hoja: Referencia
    # -------------------------------------------------------------
    ws_ref = wb.create_sheet(title="Referencia")

    ws_ref.cell(row=1, column=1, value="📋 Guía de Columnas y Referencia de Datos").font = font_white_bold
    ws_ref.cell(row=1, column=1).fill = dark_fill
    ws_ref.cell(row=1, column=1).alignment = center_align
    ws_ref.merge_cells("A1:C1")
    ws_ref.row_dimensions[1].height = 26

    ref_headers = ["Columna", "Descripción", "Valores Recomendados / Ejemplo"]
    for c_idx, h in enumerate(ref_headers, start=1):
        cell = ws_ref.cell(row=2, column=c_idx, value=h)
        cell.fill = gray_header_fill
        cell.font = font_white_bold
        cell.alignment = center_align

    ref_info = [
        ("titulo", "Nombre de la actividad (requerido)", "Ej: Campeonato Relámpago de Fútbol 8"),
        ("fecha_inicio", "Fecha inicio formato DD/MM/AAAA", "Ej: 21/11/2026"),
        ("fecha_fin", "Fecha fin formato DD/MM/AAAA", "Ej: 22/11/2026"),
        ("categoria", "Categoría (para académicas e interacción social)", "General, Examen Parcial, Examen Final, Extensión e Interacción Social, Docencia y Gestión Académica"),
        ("tipo_actividad", "Tipo de actividad (para científicas)", "CONGRESO, WEBINAR, FERIA, OLIMPIADA, DEFENSA, TALLER, MASTER_CLASS"),
        ("nombre_responsable", "Responsable o docente a cargo", "Ej: Ing. Carlos Meneses"),
        ("carrera", "Nombre exacto de la carrera (dejar vacío si es para Vicerrectorado/Todas)", "Ingeniería de Sistemas, Medicina, Odontología... (o vacío para Global)"),
        ("gestion", "Gestión académica", "2-2026 (o 1-2027)"),
        ("es_cientifica", "Indica si suma al reporte de investigación científica", "SI (Científica) | NO (Académica o Interacción Social)"),
    ]

    for r_idx, (c1, c2, c3) in enumerate(ref_info, start=3):
        fill = zebra_even if r_idx % 2 == 0 else zebra_odd
        for c_idx, val in enumerate([c1, c2, c3], start=1):
            cell = ws_ref.cell(row=r_idx, column=c_idx, value=val)
            cell.fill = fill
            cell.font = font_cell
            cell.border = thin_border
            if c_idx == 1:
                cell.font = Font(bold=True, size=10, color="0F172A")

    # Column dimensions auto-adjust
    for ws in [ws_ac, ws_sc]:
        ws.column_dimensions["A"].width = 50  # titulo
        ws.column_dimensions["B"].width = 16  # fecha_inicio
        ws.column_dimensions["C"].width = 16  # fecha_fin
        ws.column_dimensions["D"].width = 30  # categoria / tipo_actividad
        ws.column_dimensions["E"].width = 35  # carrera / responsable
        ws.column_dimensions["F"].width = 25  # gestion / carrera
        ws.column_dimensions["G"].width = 14  # es_cientifica / gestion
        if ws == ws_sc:
            ws.column_dimensions["H"].width = 14  # es_cientifica

    ws_ref.column_dimensions["A"].width = 22
    ws_ref.column_dimensions["B"].width = 45
    ws_ref.column_dimensions["C"].width = 50

    wb.save(output_path)
    print(f"Template successfully generated at: {output_path}")

if __name__ == "__main__":
    create_complete_template()
