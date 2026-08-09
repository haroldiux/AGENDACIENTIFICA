import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import SessionLocal

def fix_enum():
    db: Session = SessionLocal()
    try:
        # En postgres, para agregar valores a un enum existente:
        roles_to_add = [
            "super_admin",
            "vicerrectorado",
            "director_investigacion",
            "jefe_investigacion"
        ]
        
        for role in roles_to_add:
            try:
                db.execute(text(f"ALTER TYPE roleenum ADD VALUE '{role}';"))
                db.commit()
                print(f"Added {role} to roleenum.")
            except Exception as e:
                db.rollback()
                print(f"{role} already exists or error: {e}")
                
    except Exception as e:
        print(f"Global error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_enum()
