from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Gestion
from app.schemas.schemas import GestionCreate, GestionResponse

router = APIRouter()

@router.get("/", response_model=List[GestionResponse])
def get_gestiones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    gestiones = db.query(Gestion).offset(skip).limit(limit).all()
    return gestiones

@router.post("/", response_model=GestionResponse, status_code=status.HTTP_201_CREATED)
def create_gestion(gestion: GestionCreate, db: Session = Depends(get_db)):
    db_gestion = Gestion(**gestion.model_dump())
    db.add(db_gestion)
    db.commit()
    db.refresh(db_gestion)
    return db_gestion
