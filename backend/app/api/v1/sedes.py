from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.models.models import Sede, User
from app.schemas.schemas import SedeCreate, SedeResponse

router = APIRouter()

@router.get("/", response_model=List[SedeResponse])
def get_sedes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.require_read_only_get),
):
    return db.query(Sede).offset(skip).limit(limit).all()

@router.post("/", response_model=SedeResponse, status_code=status.HTTP_201_CREATED)
def create_sede(
    sede: SedeCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_read_only_get),
):
    db_sede = db.query(Sede).filter(Sede.name == sede.name).first()
    if db_sede:
        raise HTTPException(status_code=400, detail="Sede already registered")
    
    new_sede = Sede(name=sede.name)
    db.add(new_sede)
    db.commit()
    db.refresh(new_sede)
    return new_sede

@router.get("/{sede_id}", response_model=SedeResponse)
def get_sede(
    sede_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_read_only_get),
):
    sede = db.query(Sede).filter(Sede.id == sede_id).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede not found")
    return sede

@router.delete("/{sede_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sede(
    sede_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_read_only_get),
):
    sede = db.query(Sede).filter(Sede.id == sede_id).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede not found")
    db.delete(sede)
    db.commit()
    return None
