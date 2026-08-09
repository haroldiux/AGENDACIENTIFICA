"""Setup test data for notification verification.

Creates upcoming academic and scientific activities for "Ingeniería de Sistemas"
and sets the coordinator user's WhatsApp number.
"""
import sys
import os
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.models import (
    User,
    Career,
    Gestion,
    AcademicActivity,
    ScientificActivity,
    ScientificActivityType,
    ScientificActivityStatus,
)


def setup():
    db = SessionLocal()
    try:
        career = db.query(Career).filter(Career.name == "Ingeniería de Sistemas").first()
        if not career:
            print("Career 'Ingeniería de Sistemas' not found")
            return

        gestion = db.query(Gestion).filter(Gestion.name == "Gestión 2026").first()
        if not gestion:
            print("Gestion 'Gestión 2026' not found")
            return

        user = db.query(User).filter(
            (User.email == "coordinador.sistemas@unitepc.edu.bo") |
            (User.email == "haroldiux.18@gmail.com")
        ).first()
        if not user:
            print("Coordinator user not found")
            return

        # Ensure user has the career assigned and contact info configured
        if career not in user.careers:
            user.careers.append(career)
        user.phone_number = "+59178311416"
        user.email = "haroldiux.18@gmail.com"
        user.telegram_chat_id = "1025664701"

        # Create an academic activity for next week
        next_week = date.today() + timedelta(days=3)
        academic_title = f"Reunión Académica UAT Sistemas {next_week}"
        existing_academic = db.query(AcademicActivity).filter(
            AcademicActivity.title == academic_title
        ).first()
        if not existing_academic:
            academic = AcademicActivity(
                title=academic_title,
                start_date=next_week,
                end_date=next_week,
                category="REUNION",
                career_id=career.id,
                gestion_id=gestion.id,
            )
            db.add(academic)

        # Create a scientific activity for next week
        scientific_title = f"Webinar de Investigación UAT Sistemas {next_week}"
        existing_scientific = db.query(ScientificActivity).filter(
            ScientificActivity.title == scientific_title
        ).first()
        if not existing_scientific:
            scientific = ScientificActivity(
                title=scientific_title,
                activity_type=ScientificActivityType.webinar,
                start_date=next_week,
                end_date=next_week,
                responsible_name=user.full_name or "Coordinador Sistemas",
                career_id=career.id,
                gestion_id=gestion.id,
                status=ScientificActivityStatus.scheduled,
            )
            db.add(scientific)

        db.commit()
        print(f"Configured user {user.email} with phone {user.phone_number}")
        print(f"Created/verified activities for career {career.name} on {next_week}")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    setup()
