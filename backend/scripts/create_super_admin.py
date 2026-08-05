import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.models import User, RoleEnum
from app.core.security import get_password_hash
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_super_admin() -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.SUPER_ADMIN_EMAIL).first()
        if user:
            logger.info(f"Super admin user {settings.SUPER_ADMIN_EMAIL} already exists.")
            return

        hashed_password = get_password_hash(settings.SUPER_ADMIN_PASSWORD)
        super_admin = User(
            email=settings.SUPER_ADMIN_EMAIL,
            hashed_password=hashed_password,
            full_name="Super Admin",
            role=RoleEnum.super_admin,
            is_active=True
        )
        db.add(super_admin)
        db.commit()
        logger.info(f"Super admin user {settings.SUPER_ADMIN_EMAIL} created successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating super admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Creating initial super admin user...")
    create_super_admin()
