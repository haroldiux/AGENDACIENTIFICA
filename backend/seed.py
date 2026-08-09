"""
Seeder de demostración para Agenda Científica UNITEPC.

Uso (dentro del contenedor backend):
    docker compose exec backend python seed.py

Crea:
- 3 sedes
- 24 carreras oficiales de UNITEPC agrupadas por facultad
- 3 gestiones (2024, 2025, 2026)
- ~50 actividades científicas distribuidas entre carreras y gestiones
- Algunas actividades incluyen caracteres especiales (&, <, >) para validar
  el escape del PDF.

El script es idempotente: limpia las tablas de datos de prueba antes de insertar.
No toca la tabla de usuarios.
"""

import sys
from datetime import date, timedelta
from random import choice, randint, sample

from sqlalchemy import delete

from app.db.session import SessionLocal
from app.models.models import (
    AcademicActivity,
    Career,
    Gestion,
    Sede,
    ScientificActivity,
    ScientificActivityEvidence,
    ScientificActivityStatus,
    ScientificActivityType,
    sede_career_association,
    user_career_association,
)


SEDES = [
    "Sede El Alto",
    "Sede La Paz",
    "Sede Cochabamba",
]

GESTIONES = [
    {"name": "1-2024", "start_date": date(2024, 1, 1), "end_date": date(2024, 6, 30)},
    {"name": "2-2024", "start_date": date(2024, 7, 1), "end_date": date(2024, 12, 31)},
    {"name": "1-2025", "start_date": date(2025, 1, 1), "end_date": date(2025, 6, 30)},
    {"name": "2-2025", "start_date": date(2025, 7, 1), "end_date": date(2025, 12, 31)},
    {"name": "1-2026", "start_date": date(2026, 1, 1), "end_date": date(2026, 6, 30)},
    {"name": "2-2026", "start_date": date(2026, 7, 1), "end_date": date(2026, 12, 31)},
]

CAREERS = [
    # Facultad de Ciencias de la Salud
    ("Medicina", "Facultad de Ciencias de la Salud"),
    ("Odontología", "Facultad de Ciencias de la Salud"),
    ("Enfermería", "Facultad de Ciencias de la Salud"),
    ("Medicina Veterinaria y Zootecnia", "Facultad de Ciencias de la Salud"),
    ("Fisioterapia y Kinesiología", "Facultad de Ciencias de la Salud"),
    ("Bioquímica y Farmacia", "Facultad de Ciencias de la Salud"),
    ("Fonoaudiología", "Facultad de Ciencias de la Salud"),
    ("Nutrición y Dietética", "Facultad de Ciencias de la Salud"),
    ("Tec. Superior Prótesis Dental", "Facultad de Ciencias de la Salud"),
    # Facultad de Ciencias de la Ingeniería
    ("Ingeniería de Sonido", "Facultad de Ciencias de la Ingeniería"),
    ("Ingeniería de Sistemas", "Facultad de Ciencias de la Ingeniería"),
    ("Ingeniería Electrónica", "Facultad de Ciencias de la Ingeniería"),
    ("Ingeniería Biomédica", "Facultad de Ciencias de la Ingeniería"),
    # Facultad de Ciencias Económicas Financieras Empresariales y Administrativas
    ("Contaduría Pública", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Economía", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Administración de Empresas", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Ingeniería Comercial", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Contaduría Pública (Complementaria)", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Administración de Empresas (Complementaria)", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Ingeniería Comercial (Complementaria)", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    # Facultad de Ciencias Sociales y Jurídicas
    ("Comunicación Social", "Facultad de Ciencias Sociales y Jurídicas"),
    ("Derecho", "Facultad de Ciencias Sociales y Jurídicas"),
    ("Artes y Escultura", "Facultad de Ciencias Sociales y Jurídicas"),
    ("Cinematografía", "Facultad de Ciencias Sociales y Jurídicas"),
]

ACTIVITY_TITLES = [
    "Congreso Nacional de Investigación",
    "Webinar: Metodologías Cuantitativas",
    "Defensa de Tesis de Grado",
    "Feria de Ciencia y Tecnología",
    "Olimpiada de Programación",
    "Master Class: Inteligencia Artificial",
    "Seminario de Bioética",
    "Jornada de Vinculación con el Sector Productivo",
    "Taller de Escritura Académica",
    "Encuentro de Jóvenes Investigadores",
    "Exposición de Proyectos de Innovación",
    "Panel: Desafíos de la Investigación Boliviana",
    "Curso-Taller de Análisis de Datos",
    "Concurso de Prototipos Sostenibles",
    "Foro de Emprendimiento Científico",
    "Simposio de Derecho e Inteligencia Artificial",
    "Capacitación en Herramientas Digitales",
    "Presentación de Avances de Investigación",
    "Hackaton Universitario",
    "Mesa Redonda: Ética y Tecnología",
]

RESPONSIBLES = [
    "Dr. Carlos Mamani",
    "Dra. Ana Quispe",
    "Ing. Rodrigo Paredes",
    "Lic. María Condori",
    "Dr. Juan Peréz",
    "Dra. Elena Rojas",
    "MSc. Luis Ticona",
    "Mg. Patricia Flores",
    "Dr. Jorge Blanco",
    "Dra. Carmen Choque",
]

ACADEMIC_CATEGORIES = [
    "Clase magistral",
    "Taller",
    "Seminario",
    "Conferencia",
    "Práctica de campo",
]


def random_date(start: date, end: date) -> date:
    delta = end - start
    return start + timedelta(days=randint(0, delta.days))


def seed():
    db = SessionLocal()
    try:
        print("Limpiando datos de prueba anteriores...")
        db.execute(delete(ScientificActivityEvidence))
        db.execute(delete(ScientificActivity))
        db.execute(delete(AcademicActivity))
        db.execute(delete(user_career_association))
        db.execute(delete(sede_career_association))
        db.execute(delete(Career))
        db.execute(delete(Sede))
        db.execute(delete(Gestion))
        db.commit()

        print("Creando sedes...")
        sedes = [Sede(name=name) for name in SEDES]
        db.add_all(sedes)
        db.flush()

        print("Creando gestiones...")
        gestiones = [Gestion(**g) for g in GESTIONES]
        db.add_all(gestiones)
        db.flush()

        print("Creando carreras...")
        careers = []
        for name, faculty in CAREERS:
            career = Career(name=name, faculty=faculty)
            # Asociar cada carrera a 1-2 sedes aleatorias
            career.sedes = sample(sedes, k=randint(1, min(2, len(sedes))))
            careers.append(career)
            db.add(career)
        db.flush()

        print("Creando actividades científicas...")
        scientific_activities = []
        for i, title in enumerate(ACTIVITY_TITLES):
            career = choice(careers)
            gestion = choice(gestiones)
            start = random_date(gestion.start_date, gestion.end_date)
            end = start + timedelta(days=randint(1, 5))
            if end > gestion.end_date:
                end = gestion.end_date

            # Dos actividades con caracteres especiales para validar escape del PDF
            if i == 0:
                title = "Ciencia & Tecnología: Innovación <b>aplicada</b>"
                notes = "Nota con caracteres especiales: I+D & innovación. Verificar escape en PDF."
            elif i == 1:
                title = "Congreso de Investigación e Innovación"
                notes = "Charla sobre ciencia \u0026 sociedad con ejemplos reales."
            else:
                notes = choice([
                    "Actividad organizada por el departamento de investigación científica.",
                    "Dirigida a estudiantes y docentes de la carrera.",
                    "Se entregará certificado de participación.",
                    "Evento con financiamiento institucional.",
                    None,
                ])

            activity = ScientificActivity(
                career_id=career.id,
                gestion_id=gestion.id,
                title=title,
                activity_type=choice(list(ScientificActivityType)),
                start_date=start,
                end_date=end,
                responsible_name=choice(RESPONSIBLES),
                status=choice(list(ScientificActivityStatus)),
                notes=notes,
                evidence_url="https://unitepc.edu.bo/investigacion" if randint(0, 3) == 0 else None,
            )
            scientific_activities.append(activity)

        # Crear actividades adicionales para carreras específicas (más densidad)
        priority_careers = [c for c in careers if c.name in {"Medicina", "Ingeniería de Sistemas", "Derecho"}]
        for idx in range(30):
            career = choice(priority_careers)
            gestion = choice(gestiones)
            start = random_date(gestion.start_date, gestion.end_date)
            end = start + timedelta(days=randint(1, 5))
            if end > gestion.end_date:
                end = gestion.end_date
            scientific_activities.append(
                ScientificActivity(
                    career_id=career.id,
                    gestion_id=gestion.id,
                    title=f"{choice(['Taller', 'Seminario', 'Webinar', 'Defensa'])} #{idx+1} - {career.name}",
                    activity_type=choice(list(ScientificActivityType)),
                    start_date=start,
                    end_date=end,
                    responsible_name=choice(RESPONSIBLES),
                    status=choice(list(ScientificActivityStatus)),
                    notes="Actividad de investigación científica de la carrera.",
                )
            )

        db.add_all(scientific_activities)

        print("Creando actividades académicas de muestra...")
        academic_activities = []
        for idx in range(15):
            career = choice(careers)
            gestion = choice(gestiones)
            start = random_date(gestion.start_date, gestion.end_date)
            end = start + timedelta(days=randint(1, 3))
            if end > gestion.end_date:
                end = gestion.end_date
            academic_activities.append(
                AcademicActivity(
                    career_id=career.id,
                    gestion_id=gestion.id,
                    title=f"Actividad académica de ejemplo #{idx+1}",
                    start_date=start,
                    end_date=end,
                    category=choice(ACADEMIC_CATEGORIES),
                    origin_color=choice(["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]),
                )
            )
        db.add_all(academic_activities)

        db.commit()

        print(f"\nSeeding completo:")
        print(f"  - Sedes: {len(sedes)}")
        print(f"  - Gestiones: {len(gestiones)}")
        print(f"  - Carreras: {len(careers)}")
        print(f"  - Actividades científicas: {len(scientific_activities)}")
        print(f"  - Actividades académicas: {len(academic_activities)}")
        print("\nRecargá http://localhost:3000/calendario para ver la agenda.")

    except Exception as e:
        db.rollback()
        print(f"Error durante el seeding: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
