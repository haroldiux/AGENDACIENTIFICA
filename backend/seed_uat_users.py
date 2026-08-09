import sys
import os

# add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import User, Role
from app.core.security import get_password_hash

def seed_users():
    db = SessionLocal()
    try:
        users = [
            {"email": "admin@unitepc.edu.bo", "role": Role.admin, "password": "password"},
            {"email": "teacher@unitepc.edu.bo", "role": Role.teacher, "password": "password"},
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
                print(f"Created {user_data['email']}")
            else:
                user.hashed_password = get_password_hash(user_data["password"])
                print(f"Updated password for {user_data['email']}")
        
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
