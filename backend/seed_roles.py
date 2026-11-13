import sys
import os
from sqlalchemy.orm import Session

# Ensure we can import the backend app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.models import RoleEnum, User, Sede
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
        # Ensure official Director of Research Dra. María Lorena Orellana Aguilar
        cbba_sede = db.query(Sede).filter(Sede.name.ilike("%Cochabamba%")).first()
        cbba_id = cbba_sede.id if cbba_sede else None

        directora_email = "morellana_med@unitepc.edu.bo"
        directora = db.query(User).filter(User.email == directora_email).first()
        if not directora:
            directora = User(
                email=directora_email,
                full_name="Dra. María Lorena Orellana Aguilar",
                role=RoleEnum.director_investigacion,
                sede_id=cbba_id,
                hashed_password=password_hash,
                is_active=True
            )
            db.add(directora)
            try:
                db.commit()
                created_count += 1
                print(f"Created official Director of Research: {directora_email}")
            except Exception as e:
                db.rollback()
                print(f"Failed to create user {directora_email}: {e}")
        else:
            if cbba_id and directora.sede_id != cbba_id:
                directora.sede_id = cbba_id
                db.commit()
            print(f"User already exists: {directora_email}")

        print(f"Total users created: {created_count}")
        
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles()
