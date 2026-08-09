import sys
import os
import bcrypt

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.models import User, Career
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lista mínima de prueba: un único usuario por rol funcional.
# Todas las contraseñas se resetean a admin123 para facilitar las pruebas de entrega.
INITIAL_USERS = [
    {
        "email": "admin@unitepc.edu.bo",
        "full_name": "Super Admin Institucional",
        "role": "super_admin",
    },
    {
        "email": "vicerrectorado@unitepc.edu.bo",
        "full_name": "Dr. Fernando Morales (Vicerrectorado)",
        "role": "vicerrectorado",
    },
    {
        "email": "investigacion@unitepc.edu.bo",
        "full_name": "Dra. Elena Rostova (Dir. Investigación)",
        "role": "director_investigacion",
    },
    {
        "email": "jefe.sistemas@unitepc.edu.bo",
        "full_name": "Ing. Roberto Carlos (Jefe Inv. Sistemas)",
        "role": "jefe_investigacion",
        "careers": ["Ingeniería de Sistemas"],
    },
    {
        "email": "haroldiux.18@gmail.com",
        "full_name": "Ing. Carlos Mendoza (Coordinador Sistemas)",
        "role": "coordinator",
        "careers": ["Ingeniería de Sistemas"],
        "phone_number": "+59178311416",
        "telegram_chat_id": "1025664701",
    },
    {
        "email": "docente.investigador@unitepc.edu.bo",
        "full_name": "Dr. Hugo Banzer (Investigador)",
        "role": "research",
    },
    {
        "email": "docente@unitepc.edu.bo",
        "full_name": "Lic. Mariana Torrez (Docente)",
        "role": "teacher",
    },
]


def seed_users():
    db = SessionLocal()
    try:
        careers_map = {c.name: c for c in db.query(Career).all()}
        hashed_pwd = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8")

        for udata in INITIAL_USERS:
            existing = db.query(User).filter(User.email == udata["email"]).first()
            if existing:
                logger.info(f"User {udata['email']} already exists. Updating role, password and profile...")
                existing.role = udata["role"]
                existing.full_name = udata["full_name"]
                existing.hashed_password = hashed_pwd
                existing.is_active = True
                existing.phone_number = udata.get("phone_number")
                existing.telegram_chat_id = udata.get("telegram_chat_id")
                user = existing
            else:
                user = User(
                    email=udata["email"],
                    hashed_password=hashed_pwd,
                    full_name=udata["full_name"],
                    role=udata["role"],
                    is_active=True,
                    phone_number=udata.get("phone_number"),
                    telegram_chat_id=udata.get("telegram_chat_id"),
                )
                db.add(user)
                logger.info(f"Created user {udata['email']} ({udata['role']})")

            # Sincronizar carreras (limpia y reasigna)
            if "careers" in udata:
                target_careers = [careers_map[name] for name in udata["careers"] if name in careers_map]
                user.careers = target_careers
            else:
                user.careers = []

        db.commit()
        logger.info("User seeding completed successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding users: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Seeding test users into database...")
    seed_users()
