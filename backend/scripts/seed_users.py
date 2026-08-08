import sys
import os
import bcrypt

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.models import User, Career
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        "email": "jefe.medicina@unitepc.edu.bo",
        "full_name": "Dr. Marcelo Paz (Jefe Inv. Medicina)",
        "role": "jefe_investigacion",
        "careers": ["Medicina"],
    },
    {
        "email": "coordinador.sistemas@unitepc.edu.bo",
        "full_name": "Ing. Carlos Mendoza (Coordinador Sistemas)",
        "role": "coordinator",
        "careers": ["Ingeniería de Sistemas"],
    },
    {
        "email": "coordinador.medicina@unitepc.edu.bo",
        "full_name": "Dra. Patricia Soliz (Coordinadora Medicina)",
        "role": "coordinator",
        "careers": ["Medicina"],
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
                logger.info(f"User {udata['email']} already exists. Updating role and password...")
                existing.role = udata["role"]
                existing.full_name = udata["full_name"]
                existing.hashed_password = hashed_pwd
            else:
                user = User(
                    email=udata["email"],
                    hashed_password=hashed_pwd,
                    full_name=udata["full_name"],
                    role=udata["role"],
                    is_active=True,
                )
                if "careers" in udata:
                    for car_name in udata["careers"]:
                        if car_name in careers_map:
                            user.careers.append(careers_map[car_name])
                db.add(user)
                logger.info(f"Created user {udata['email']} ({udata['role']})")

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
