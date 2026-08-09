import sys
import os
import bcrypt

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.models import User, Career, ScientificActivityEvidence, user_career_association
from sqlalchemy import asc
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Un único usuario por rol funcional. Contraseña uniforme para pruebas.
KEEP_USERS = {
    "admin@unitepc.edu.bo": {
        "role": "super_admin",
        "full_name": "Super Admin Institucional",
        "careers": [],
    },
    "vicerrectorado@unitepc.edu.bo": {
        "role": "vicerrectorado",
        "full_name": "Dr. Fernando Morales (Vicerrectorado)",
        "careers": [],
    },
    "investigacion@unitepc.edu.bo": {
        "role": "director_investigacion",
        "full_name": "Dra. Elena Rostova (Dir. Investigación)",
        "careers": [],
    },
    "jefe.sistemas@unitepc.edu.bo": {
        "role": "jefe_investigacion",
        "full_name": "Ing. Roberto Carlos (Jefe Inv. Sistemas)",
        "careers": ["Ingeniería de Sistemas"],
    },
    "haroldiux.18@gmail.com": {
        "role": "coordinator",
        "full_name": "Ing. Carlos Mendoza (Coordinador Sistemas)",
        "careers": ["Ingeniería de Sistemas"],
        "phone_number": "+59178311416",
        "telegram_chat_id": "1025664701",
    },
    "docente.investigador@unitepc.edu.bo": {
        "role": "research",
        "full_name": "Dr. Hugo Banzer (Investigador)",
        "careers": [],
    },
    "docente@unitepc.edu.bo": {
        "role": "teacher",
        "full_name": "Lic. Mariana Torrez (Docente)",
        "careers": [],
    },
}

NEW_PASSWORD = "admin123"


def cleanup_users():
    db = SessionLocal()
    try:
        careers_map = {c.name: c for c in db.query(Career).all()}
        hashed_pwd = bcrypt.hashpw(NEW_PASSWORD.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        # Asegurar/actualizar usuarios que se conservan
        for email, data in KEEP_USERS.items():
            user = db.query(User).filter(User.email == email).first()
            if not user:
                logger.info(f"Creating kept user {email}")
                user = User(email=email, is_active=True)
                db.add(user)

            user.full_name = data["full_name"]
            user.role = data["role"]
            user.hashed_password = hashed_pwd
            user.is_active = True
            if "phone_number" in data:
                user.phone_number = data["phone_number"]
            else:
                user.phone_number = None
            if "telegram_chat_id" in data:
                user.telegram_chat_id = data["telegram_chat_id"]
            else:
                user.telegram_chat_id = None

            # Sincronizar carreras
            target_careers = [careers_map[name] for name in data.get("careers", []) if name in careers_map]
            user.careers = target_careers
            logger.info(f"Kept/updated {email} as {data['role']} with careers {[c.name for c in target_careers]}")

        db.flush()

        # Determinar usuarios a eliminar
        keep_emails = set(KEEP_USERS.keys())
        to_delete = db.query(User).filter(User.email.notin_(keep_emails)).all()
        keep_ids = {u.id for u in db.query(User).filter(User.email.in_(keep_emails)).all()}
        fallback_id = db.query(User).filter(User.email == "admin@unitepc.edu.bo").first().id

        for user in to_delete:
            logger.info(f"Deleting user {user.email} (id={user.id}, role={user.role})")
            # Limpiar asociaciones many-to-many
            db.execute(
                user_career_association.delete().where(user_career_association.c.user_id == user.id)
            )
            # Reasignar evidencias subidas por este usuario al super_admin para no perder rastro
            db.query(ScientificActivityEvidence).filter(
                ScientificActivityEvidence.uploaded_by_id == user.id
            ).update({ScientificActivityEvidence.uploaded_by_id: fallback_id}, synchronize_session=False)
            db.delete(user)

        db.commit()
        logger.info("User cleanup completed.")

        # Resumen final
        final = db.query(User).order_by(asc(User.id)).all()
        logger.info(f"Final user count: {len(final)}")
        for u in final:
            career_names = [c.name for c in u.careers]
            logger.info(
                f"  {u.email:45} | {u.role.value:25} | careers={career_names} | phone={u.phone_number} | tg={u.telegram_chat_id}"
            )
    except Exception as e:
        db.rollback()
        logger.error(f"Error cleaning users: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Cleaning up duplicate users, leaving one per functional role...")
    cleanup_users()
