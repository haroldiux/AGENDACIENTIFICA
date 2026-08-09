import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import User, Career, RoleEnum
from app.core.security import get_password_hash

def create_researcher():
    db = SessionLocal()
    try:
        email = "research@unitepc.edu.bo"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                hashed_password=get_password_hash("unitepc123"),
                role=RoleEnum.research,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created {email}")
        else:
            user.hashed_password = get_password_hash("unitepc123")
            user.role = RoleEnum.research
            db.commit()
            print(f"Updated {email}")
            
        career = db.query(Career).first()
        if career and career not in user.careers:
            user.careers.append(career)
            db.commit()
            print(f"Assigned career {career.name}")
    finally:
        db.close()

if __name__ == "__main__":
    create_researcher()
