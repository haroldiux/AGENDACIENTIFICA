import pytest
from app.db.session import SessionLocal
from app.models.models import User, RoleEnum
from app.core.security import get_password_hash

@pytest.mark.skip(reason="quarantined: requires running PostgreSQL container with host 'db'")
def test_seed_users():
    db = SessionLocal()
    try:
        users = [
            {"email": "admin@unitepc.edu.bo", "role": RoleEnum.admin, "password": "password"},
            {"email": "teacher@unitepc.edu.bo", "role": RoleEnum.teacher, "password": "password"},
        ]
        
        for user_data in users:
            user = db.query(User).filter(User.email == user_data["email"]).first()
            if not user:
                user = User(
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    role=user_data["role"],
                    is_active=True
                )
                db.add(user)
            else:
                user.hashed_password = get_password_hash(user_data["password"])
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
