"""
Generate executive PDF Guide for Dra. María Lorena Orellana Aguilar
UNITEPC - Agenda Científica
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#4A5568"))

        # Header bar
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.5)
        self.line(40, letter[1] - 38, letter[0] - 40, letter[1] - 38)
        self.drawString(42, letter[1] - 32, "UNIVERSIDAD TÉCNICA PRIVADA COSMOS — AGENDA CIENTÍFICA INSTITUCIONAL")
        self.drawRightString(letter[0] - 42, letter[1] - 32, "DIRECCIÓN DE INVESTIGACIÓN")

        # Footer bar
        self.line(40, 42, letter[0] - 40, 42)
        self.drawString(42, 30, "Documento de Uso Oficial e Institucional — UNITEPC 2026/2027")
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(letter[0] - 42, 30, page_str)
        self.restoreState()


def generate_guide_pdf(output_path: str):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=52,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F294A"),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#2B6CB0"),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0F294A"),
        spaceBefore=10,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#1A365D"),
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#2D3748"),
        spaceAfter=5
    )

    body_bold = ParagraphStyle(
        'BodyBoldCustom',
        parent=body_style,
        fontName='Helvetica-Bold',
    )

    step_title_style = ParagraphStyle(
        'StepTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#0F294A"),
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#1A365D")
    )

    story = []

    # Title & Header
    story.append(Paragraph("AGENDA CIENTÍFICA UNITEPC", title_style))
    story.append(Paragraph("Guía Oficial de Inicio Rápido, Validación de Funcionalidades y Carga de Cronograma", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#C5A059"), spaceAfter=10))

    # Meta Info Card
    meta_data = [
        [
            Paragraph("<b>Destinataria:</b> Dra. María Lorena Orellana Aguilar", body_style),
            Paragraph("<b>Gestión Habilitada:</b> 1-2027", body_style)
        ],
        [
            Paragraph("<b>Cargo:</b> Directora Nacional de Investigación", body_style),
            Paragraph("<b>Alcance del Rol:</b> Planificación y Seguimiento Nacional", body_style)
        ],
        [
            Paragraph("<b>Institución:</b> Universidad Técnica Privada Cosmos (UNITEPC)", body_style),
            Paragraph("<b>Estado de Cuenta:</b> Activo / Habilitado", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[280, 252])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Credenciales Box (Destacado)
    story.append(Paragraph("1. Credenciales Oficiales de Acceso", h1_style))
    cred_data = [
        [Paragraph("<b>Portal Web del Sistema</b>", body_style), Paragraph("<font color='#0D6EFD'><u>https://agenda.unitepc.pro</u></font>", code_style)],
        [Paragraph("<b>Correo Institucional (Usuario)</b>", body_style), Paragraph("morellana_med@unitepc.edu.bo", code_style)],
        [Paragraph("<b>Contraseña Temporal Asignada</b>", body_style), Paragraph("unitepc123", code_style)],
        [Paragraph("<b>Nota de Seguridad</b>", body_style), Paragraph("Puede cambiar su contraseña de manera privada desde el módulo <i>'Mi Perfil'</i> en cualquier momento.", body_style)]
    ]
    cred_table = Table(cred_data, colWidths=[170, 362])
    cred_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#EEF4FB")),
        ('BACKGROUND', (1, 0), (1, -1), colors.HexColor("#FFFFFF")),
        ('BOX', (0, 0), (-1, -1), 1.2, colors.HexColor("#2B6CB0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(cred_table)
    story.append(Spacer(1, 12))

    # Pasos del Sistema
    story.append(Paragraph("2. Protocolo de Pruebas y Validación Paso a Paso", h1_style))
    story.append(Paragraph("A continuación se detallan las acciones clave preparadas para que verifique el funcionamiento del sistema con su rol de Directora de Investigación:", body_style))
    story.append(Spacer(1, 4))

    steps = [
        (
            "Paso 1: Inicio de Sesión y Reconocimiento del Dashboard",
            "#0F294A",
            [
                "Ingrese al enlace oficial en su navegador (Google Chrome, Firefox o Edge).",
                "Digite su correo institucional y su contraseña temporal.",
                "En el <b>Dashboard Principal</b>, apreciará las métricas consolidadas de investigación, gráficas por facultad y el panel de alertas tempranas sobre eventos cercanos.",
                "En la esquina superior derecha podrá alternar entre tema claro y oscuro según su preferencia."
            ]
        ),
        (
            "Paso 2: Carga de la Planificación 1-2027 mediante la Plantilla Excel",
            "#0F294A",
            [
                "En el menú lateral izquierdo, seleccione la opción <b>'Importar'</b>.",
                "Seleccione la gestión <b>'1-2027'</b> en el desplegable oficial.",
                "Adjunte el archivo provisto: <b>Plantilla_Direccion_Investigacion_1-2027_Dra_Maria_Lorena_Orellana.xlsx</b>.",
                "El sistema ejecutará una <b>pre-validación inteligente</b>: detectará las 7 actividades de investigación preparadas, comprobará la consistencia de fechas y descartará solapamientos.",
                "Presione <b>'Confirmar e Importar'</b>. El cronograma semestral quedará publicado instantáneamente."
            ]
        ),
        (
            "Paso 3: Visualización en el Calendario Integrado y Detección de Cruces",
            "#0F294A",
            [
                "En el menú lateral, haga clic en <b>'Calendario'</b>.",
                "Seleccione la vista de su agrado: <b>Mes</b>, <b>Semana</b> o <b>Agenda (Lista)</b>.",
                "Filtre por la gestión <b>1-2027</b>. Verá sus actividades científicas resaltadas.",
                "<b>Cruce con Actividades Académicas:</b> El sistema le permite contrastar sus congresos y eventos con las fechas de exámenes parciales y finales cargados por Vicerrectorado y Direcciones de Carrera, garantizando la máxima concurrencia de docentes y estudiantes."
            ]
        ),
        (
            "Paso 4: Registro Manual de Nuevas Actividades Científicas",
            "#0F294A",
            [
                "Para agendar un evento imprevisto o adicional sin usar Excel, ingrese a <b>'Actividades'</b>.",
                "Presione el botón <b>'+ Nueva Actividad'</b>.",
                "Complete: Título, Tipo (CONGRESO, SIMPOSIO, TALLER, FERIA, WEBINAR), fechas, horarios y nombre del responsable.",
                "Al tratarse de eventos nacionales de la Dirección de Investigación, el campo de Carrera puede dejarse en blanco para abarcar a toda la universidad.",
                "Guarde la actividad para que impacte de inmediato en el calendario de toda la comunidad."
            ]
        ),
        (
            "Paso 5: Seguimiento, Auditoría y Repositorio de Evidencias",
            "#0F294A",
            [
                "Como Directora Nacional, usted tiene potestad de supervisar las actividades de todas las carreras.",
                "En el módulo <b>'Actividades'</b>, filtre por cualquier carrera (ej. <i>Medicina</i> o <i>Ingeniería de Sistemas</i>).",
                "Haga clic en una actividad concluida y diríjase a la pestaña <b>'Evidencias'</b>.",
                "Podrá revisar o subir archivos de respaldo: actas, resoluciones, listas de asistencia, fotografías o informes en formato PDF, garantizando el archivo documental exigido para acreditaciones."
            ]
        ),
        (
            "Paso 6: Descarga de Reportes y Sincronización Móvil (iCal)",
            "#0F294A",
            [
                "En la sección <b>'Reportes'</b>, genere el resumen ejecutivo semestral de actividades científicas en formato <b>PDF imprimible</b> o <b>Excel analítico</b>.",
                "<b>Sincronización con Teléfono / Correo:</b> Desde el Calendario, utilice el botón <b>'Sincronizar Calendario (iCal)'</b> para suscribirse desde su Google Calendar o Microsoft Outlook, recibiendo alertas automáticas en su celular antes de cada evento."
            ]
        )
    ]

    for title, col, bullets in steps:
        step_flow = []
        step_flow.append(Paragraph(f"<b>{title}</b>", step_title_style))
        step_flow.append(Spacer(1, 2))
        for b in bullets:
            step_flow.append(Paragraph(f"• {b}", bullet_style))
        step_flow.append(Spacer(1, 4))

        # Wrap in a neat card
        card_table = Table([[step_flow]], colWidths=[532])
        card_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
            ('LINELEFT', (0, 0), (-1, -1), 3.5, colors.HexColor(col)),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(card_table)
        story.append(Spacer(1, 5))

    # Support / Footer Note
    support_box = [
        [
            Paragraph(
                "<b>Mesa de Ayuda y Soporte Técnico:</b> Ante cualquier consulta, habilitación de nuevas gestiones o ajuste de cronogramas, el equipo de sistemas se encuentra a su disposición permanente para brindarle acompañamiento técnico.",
                body_style
            )
        ]
    ]
    supp_table = Table(support_box, colWidths=[532])
    supp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#F59E0B")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(Spacer(1, 4))
    story.append(supp_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully generated at: {output_path}")


if __name__ == "__main__":
    out = os.path.abspath("material_demostracion/GUIA_INICIO_Y_PRUEBAS_DRA_ORELLANA_1-2027.pdf")
    generate_guide_pdf(out)
