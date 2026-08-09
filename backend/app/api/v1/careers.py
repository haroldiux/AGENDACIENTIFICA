from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_read_only_get
from app.models.models import Career, User
from app.schemas.schemas import CareerCreate, CareerResponse

router = APIRouter()

@router.get("/", response_model=List[CareerResponse])
def get_careers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    careers = db.query(Career).offset(skip).limit(limit).all()
    return careers

@router.post("/", response_model=CareerResponse, status_code=status.HTTP_201_CREATED)
def create_career(
    career: CareerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    db_career = Career(**career.model_dump())
    db.add(db_career)
    db.commit()
    db.refresh(db_career)
    return db_career

@router.get("/{id}", response_model=CareerResponse)
def get_career(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    career = db.query(Career).filter(Career.id == id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    return career
