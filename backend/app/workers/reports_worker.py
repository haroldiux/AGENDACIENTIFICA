import os
import uuid
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.models import AcademicActivity, ScientificActivity
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

REPORTS_DIR = "/tmp/reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

@celery_app.task
def generate_pdf_report_task(career_id: int = None, gestion_id: int = None):
    db = SessionLocal()
    try:
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
        
        filename = f"report_{uuid.uuid4().hex}.pdf"
        filepath = os.path.join(REPORTS_DIR, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        title = Paragraph("Reporte de Actividades", styles['Title'])
        elements.append(title)
        elements.append(Spacer(1, 12))
        
        elements.append(Paragraph("Actividades Académicas", styles['Heading2']))
        if academic_activities:
            data = [["Título", "Fecha Inicio", "Fecha Fin", "Categoría"]]
            for act in academic_activities:
                data.append([
                    act.title, 
                    str(act.start_date), 
                    str(act.end_date), 
                    act.category
                ])
            t = Table(data)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.grey),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.beige),
                ('GRID', (0,0), (-1,-1), 1, colors.black),
            ]))
            elements.append(t)
        else:
            elements.append(Paragraph("No hay actividades académicas.", styles['Normal']))
            
        elements.append(Spacer(1, 12))
        
        elements.append(Paragraph("Actividades Científicas", styles['Heading2']))
        if scientific_activities:
            data = [["Título", "Tipo", "Fecha Inicio", "Fecha Fin", "Estado"]]
            for act in scientific_activities:
                data.append([
                    act.title, 
                    act.activity_type.value if hasattr(act.activity_type, 'value') else act.activity_type,
                    str(act.start_date), 
                    str(act.end_date), 
                    act.status.value if hasattr(act.status, 'value') else act.status
                ])
            t = Table(data)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.grey),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.beige),
                ('GRID', (0,0), (-1,-1), 1, colors.black),
            ]))
            elements.append(t)
        else:
            elements.append(Paragraph("No hay actividades científicas.", styles['Normal']))
            
        doc.build(elements)
        
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
        f.write("Simulated Excel content for career {} and gestion {}".format(career_id, gestion_id))
        
    return {"status": "completed", "file_path": filepath, "file_name": filename}
