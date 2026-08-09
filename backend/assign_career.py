import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import User, Career

def assign():
    db = SessionLocal()
    try:
        teacher = db.query(User).filter(User.email == "teacher@unitepc.edu.bo").first()
        career = db.query(Career).first()
        if teacher and career:
            if career not in teacher.careers:
                teacher.careers.append(career)
                db.commit()
                print(f"Assigned career {career.name} to teacher")
            else:
                print("Already assigned")
    finally:
        db.close()

if __name__ == "__main__":
    assign()
