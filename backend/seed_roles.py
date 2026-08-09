import sys
import os
from sqlalchemy.orm import Session

# Ensure we can import the backend app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.models import RoleEnum, User
from app.core.security import get_password_hash

def seed_roles():
    db: Session = SessionLocal()
    try:
        created_count = 0
        password_hash = get_password_hash("unitepc123")
        
        for role in RoleEnum:
            email = f"{role.value}@unitepc.edu.bo"
            full_name = f"Test {role.value}"
            
            existing_user = db.query(User).filter(User.email == email).first()
            if not existing_user:
                new_user = User(
                    email=email,
                    full_name=full_name,
                    role=role.value,
                    hashed_password=password_hash,
                    is_active=True
                )
                db.add(new_user)
                try:
                    db.commit()
                    created_count += 1
                    print(f"Created user: {email} with role: {role.value}")
                except Exception as e:
                    db.rollback()
                    print(f"Failed to create user {email}: {e}")
            else:
                print(f"User already exists: {email}")
        print(f"Total users created: {created_count}")
        
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles()
