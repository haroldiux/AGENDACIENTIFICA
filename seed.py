import os
import sys
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

# Need to import app modules. We will run this inside the docker container
# so app path is accessible.
sys.path.append("/app")

from app.db.session import SessionLocal
from app.models.models import Gestion, Career, AcademicActivity, ScientificActivity, ScientificActivityType, ScientificActivityStatus

def run():
    db = SessionLocal()
    
    # 1. Update existing Gestiones
    print("Updating existing gestiones to semester format (e.g., 1-2024, 2-2024)")
    existing_gestiones = db.query(Gestion).all()
    for g in existing_gestiones:
        if not "-" in g.name:
            # If name is just "2024", change to "1-2024"
            g.name = f"1-{g.name}"
    db.commit()

    # 2. Create Gestion 1-2026
    gestion_2026 = db.query(Gestion).filter(Gestion.name == "1-2026").first()
    if not gestion_2026:
        gestion_2026 = Gestion(
            name="1-2026",
            start_date=date(2026, 1, 1),
            end_date=date(2026, 6, 30)
        )
        db.add(gestion_2026)
        db.commit()
        db.refresh(gestion_2026)
    
    # Create Gestion 2-2026 just in case
    gestion_2_2026 = db.query(Gestion).filter(Gestion.name == "2-2026").first()
    if not gestion_2_2026:
        gestion_2_2026 = Gestion(
            name="2-2026",
            start_date=date(2026, 7, 1),
            end_date=date(2026, 12, 31)
        )
        db.add(gestion_2_2026)
        db.commit()

    # Get Medicina career
    medicina = db.query(Career).filter(Career.name.ilike("%Medicina%")).first()
    if not medicina:
        medicina = Career(name="Medicina", faculty="Ciencias de la Salud")
        db.add(medicina)
        db.commit()
        db.refresh(medicina)

    # 3. Seed activities for Medicina 1-2026
    print("Seeding activities for Medicina, Gestion 1-2026")
    activities_data = [
        # mapped from July->Jan, Aug->Feb, Sept->Mar, Oct->Apr, Nov->May, Dec->Jun
        {"title": "Ingreso a Internado Rotatorio", "start": date(2026, 1, 1), "end": date(2026, 1, 1), "color": "#E5E7EB", "cat": "Academica"},
        {"title": "Reunión Consejo de Carrera", "start": date(2026, 1, 5), "end": date(2026, 1, 5), "color": "#FDBA74", "cat": "Academica"},
        {"title": "Taller de planificación académica (Docentes)", "start": date(2026, 1, 18), "end": date(2026, 1, 18), "color": "#D1D5DB", "cat": "Academica"},
        {"title": "Taller de investigación, psicopedagogía y salud pública e interacción social para decimo semestre", "start": date(2026, 1, 25), "end": date(2026, 1, 25), "color": "#D1D5DB", "cat": "Academica"},
        {"title": "Inicio de Actividades Académicas decimo semestre", "start": date(2026, 1, 28), "end": date(2026, 1, 28), "color": "#374151", "cat": "Academica"},
        {"title": "Reunión Consejo de Carrera", "start": date(2026, 2, 2), "end": date(2026, 2, 2), "color": "#FDBA74", "cat": "Academica"},
        {"title": "Curso de inducción a estudiantes de 2° a 10° semestre", "start": date(2026, 2, 5), "end": date(2026, 2, 8), "color": "#67E8F9", "cat": "Academica"},
        {"title": "Día del Estado Plurinacional (feriado)", "start": date(2026, 2, 6), "end": date(2026, 2, 7), "color": "#FCA5A5", "cat": "Academica"}, # Mapped from Independencia
        {"title": "Curso de inducción a estudiantes de 1° semestre", "start": date(2026, 2, 11), "end": date(2026, 2, 14), "color": "#67E8F9", "cat": "Academica"},
        {"title": "Inicio de clases de 1° a 9° semestre", "start": date(2026, 2, 11), "end": date(2026, 2, 11), "color": "#A7F3D0", "cat": "Academica"},
        {"title": "Reunión informativa con el plantel docente", "start": date(2026, 2, 15), "end": date(2026, 2, 15), "color": "#D1D5DB", "cat": "Academica"},
        {"title": "Cierre de convalidaciones", "start": date(2026, 2, 16), "end": date(2026, 2, 16), "color": "#FBCFE8", "cat": "Academica"},
        {"title": "Cierre de adición o retiro de materias", "start": date(2026, 2, 16), "end": date(2026, 2, 16), "color": "#A7F3D0", "cat": "Academica"},
        {"title": "Master Class área morfofisiología", "start": date(2026, 2, 18), "end": date(2026, 2, 18), "color": "#C4B5FD", "cat": "Cientifica", "type": ScientificActivityType.master_class},
        {"title": "Campaña permanente contra la violencia", "start": date(2026, 2, 25), "end": date(2026, 2, 25), "color": "#D1D5DB", "cat": "Academica"},
        {"title": "Master Class área clínica", "start": date(2026, 2, 27), "end": date(2026, 2, 27), "color": "#C4B5FD", "cat": "Cientifica", "type": ScientificActivityType.master_class},
        {"title": "Webinar del área de Patología", "start": date(2026, 2, 28), "end": date(2026, 2, 28), "color": "#FCA5A5", "cat": "Cientifica", "type": ScientificActivityType.webinar},
        
        {"title": "Exámenes de primer parcial decimo semestre", "start": date(2026, 3, 1), "end": date(2026, 3, 13), "color": "#FDE047", "cat": "Academica"},
        {"title": "Reunión Consejo de Carrera", "start": date(2026, 3, 5), "end": date(2026, 3, 5), "color": "#FDBA74", "cat": "Academica"},
        {"title": "Día del Padre", "start": date(2026, 3, 14), "end": date(2026, 3, 14), "color": "#FCA5A5", "cat": "Academica"}, # Mapped from aniversario cbba
        {"title": "Exámenes de los primeros parciales de 1° a 9° semestre", "start": date(2026, 3, 19), "end": date(2026, 4, 4), "color": "#FDE047", "cat": "Academica"},
        {"title": "Día del estudiante (trasladado)", "start": date(2026, 3, 21), "end": date(2026, 3, 21), "color": "#FCA5A5", "cat": "Academica"},
        {"title": "Campaña permanente contra la violencia", "start": date(2026, 3, 25), "end": date(2026, 3, 25), "color": "#D1D5DB", "cat": "Academica"},
        {"title": "Webinar del área de salud pública", "start": date(2026, 3, 30), "end": date(2026, 3, 30), "color": "#FCA5A5", "cat": "Cientifica", "type": ScientificActivityType.webinar},
        
        {"title": "Concurso de suturas", "start": date(2026, 4, 24), "end": date(2026, 4, 25), "color": "#C4B5FD", "cat": "Cientifica", "type": ScientificActivityType.olimpiada},
        {"title": "Reunión Consejo de Carrera", "start": date(2026, 4, 4), "end": date(2026, 4, 4), "color": "#FDBA74", "cat": "Academica"},
        {"title": "Feria de Ciencias de la Salud", "start": date(2026, 4, 10), "end": date(2026, 4, 10), "color": "#A7F3D0", "cat": "Cientifica", "type": ScientificActivityType.feria},
        {"title": "Curso de formación continua docente", "start": date(2026, 4, 15), "end": date(2026, 4, 16), "color": "#D1D5DB", "cat": "Academica"},
        {"title": "Defensa de Revisión de artículos científicos", "start": date(2026, 4, 17), "end": date(2026, 4, 17), "color": "#67E8F9", "cat": "Cientifica", "type": ScientificActivityType.defensa},
        {"title": "Defensa de Ateneo clínico quirúrgico", "start": date(2026, 4, 18), "end": date(2026, 4, 18), "color": "#67E8F9", "cat": "Cientifica", "type": ScientificActivityType.defensa},
        {"title": "Evaluación docente", "start": date(2026, 4, 27), "end": date(2026, 4, 30), "color": "#D1D5DB", "cat": "Academica"},
        {"title": "Exámenes de segundo parcial decimo semestre", "start": date(2026, 4, 20), "end": date(2026, 4, 30), "color": "#FDE047", "cat": "Academica"},
        
        {"title": "Reunión Consejo de Carrera", "start": date(2026, 5, 1), "end": date(2026, 5, 1), "color": "#FDBA74", "cat": "Academica"},
        {"title": "Día del Trabajador", "start": date(2026, 5, 2), "end": date(2026, 5, 2), "color": "#FCA5A5", "cat": "Academica"}, # Mapped from Todos Santos
        {"title": "Conclusión clases teorías 10° semestre", "start": date(2026, 5, 15), "end": date(2026, 5, 15), "color": "#D1D5DB", "cat": "Academica"},
        {"title": "Congreso internacional: Enfoque One Health", "start": date(2026, 5, 5), "end": date(2026, 5, 7), "color": "#67E8F9", "cat": "Cientifica", "type": ScientificActivityType.congreso},
        {"title": "Exámenes de segundo parcial de 1° a 9° semestre", "start": date(2026, 5, 7), "end": date(2026, 5, 22), "color": "#FDE047", "cat": "Academica"},
        {"title": "Exámenes teóricos finales decimo semestre", "start": date(2026, 5, 17), "end": date(2026, 5, 29), "color": "#D9F99D", "cat": "Academica"},
        {"title": "Seminario Integrador estudiantil", "start": date(2026, 5, 21), "end": date(2026, 5, 21), "color": "#D1D5DB", "cat": "Academica"},
        {"title": "Olimpiadas de Anatomía", "start": date(2026, 5, 22), "end": date(2026, 5, 29), "color": "#67E8F9", "cat": "Cientifica", "type": ScientificActivityType.olimpiada},
        {"title": "Webinar del área clínico-quirúrgico", "start": date(2026, 5, 29), "end": date(2026, 5, 29), "color": "#FCA5A5", "cat": "Cientifica", "type": ScientificActivityType.webinar},
        {"title": "Conclusión clases prácticas simulación 1° a 9° semestre", "start": date(2026, 5, 29), "end": date(2026, 5, 29), "color": "#374151", "cat": "Academica"},
        
        {"title": "Exámenes prácticos finales", "start": date(2026, 6, 1), "end": date(2026, 6, 6), "color": "#FDE047", "cat": "Academica"},
        {"title": "Exámenes de segundas instancias 10° semestre", "start": date(2026, 6, 3), "end": date(2026, 6, 4), "color": "#67E8F9", "cat": "Academica"},
        {"title": "Informe final decimo semestre", "start": date(2026, 6, 5), "end": date(2026, 6, 5), "color": "#C4B5FD", "cat": "Academica"},
        {"title": "Reunión Consejo de Carrera", "start": date(2026, 6, 6), "end": date(2026, 6, 6), "color": "#FDBA74", "cat": "Academica"},
        {"title": "Exámenes teóricos finales de 1° a 9° semestre", "start": date(2026, 6, 5), "end": date(2026, 6, 20), "color": "#FDE047", "cat": "Academica"},
        {"title": "Inicio matriculación", "start": date(2026, 6, 15), "end": date(2026, 6, 15), "color": "#A7F3D0", "cat": "Academica"},
        {"title": "Exámenes de segundas instancias de 1° a 9° semestre", "start": date(2026, 6, 22), "end": date(2026, 6, 23), "color": "#67E8F9", "cat": "Academica"},
        {"title": "Informes y cierre de gestión", "start": date(2026, 6, 22), "end": date(2026, 6, 22), "color": "#FCA5A5", "cat": "Academica"},
    ]

    for item in activities_data:
        if item["cat"] == "Academica":
            ac = AcademicActivity(
                career_id=medicina.id,
                gestion_id=gestion_2026.id,
                title=item["title"],
                start_date=item["start"],
                end_date=item["end"],
                category="General",
                origin_color=item["color"]
            )
            db.add(ac)
        else:
            sc = ScientificActivity(
                career_id=medicina.id,
                gestion_id=gestion_2026.id,
                title=item["title"],
                activity_type=item["type"],
                start_date=item["start"],
                end_date=item["end"],
                responsible_name="Dirección de Medicina",
                status=ScientificActivityStatus.scheduled
            )
            db.add(sc)
            
    db.commit()
    print("Seeding completed!")
    db.close()

if __name__ == "__main__":
    run()
