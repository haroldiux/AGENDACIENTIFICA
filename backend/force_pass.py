import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash

def fix_pass():
    db = SessionLocal()
    try:
        teacher = db.query(User).filter(User.email == "teacher@unitepc.edu.bo").first()
        if teacher:
            teacher.hashed_password = get_password_hash("unitepc123")
            db.commit()
            print("Password updated to unitepc123")
    finally:
        db.close()

if __name__ == "__main__":
    fix_pass()
