from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import ScientificActivity, Career, Gestion
from app.schemas.schemas import ScientificActivityCreate, ScientificActivityUpdate, ScientificActivityStatusUpdate, ScientificActivityResponse

router = APIRouter()

@router.get("/", response_model=List[ScientificActivityResponse])
def get_scientific_activities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    activities = db.query(ScientificActivity).offset(skip).limit(limit).all()
    return activities

@router.post("/", response_model=ScientificActivityResponse, status_code=status.HTTP_201_CREATED)
def create_scientific_activity(activity: ScientificActivityCreate, db: Session = Depends(get_db)):
    career = db.query(Career).filter(Career.id == activity.career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
        
    gestion = db.query(Gestion).filter(Gestion.id == activity.gestion_id).first()
    if not gestion:
        raise HTTPException(status_code=404, detail="Gestion not found")

    db_activity = ScientificActivity(**activity.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.put("/{id}", response_model=ScientificActivityResponse)
def update_scientific_activity(id: int, activity_update: ScientificActivityUpdate, db: Session = Depends(get_db)):
    db_activity = db.query(ScientificActivity).filter(ScientificActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    update_data = activity_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_activity, key, value)
        
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scientific_activity(id: int, db: Session = Depends(get_db)):
    db_activity = db.query(ScientificActivity).filter(ScientificActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    db.delete(db_activity)
    db.commit()
    return None

@router.put("/{id}/status", response_model=ScientificActivityResponse)
def update_scientific_status(id: int, status_update: ScientificActivityStatusUpdate, db: Session = Depends(get_db)):
    db_activity = db.query(ScientificActivity).filter(ScientificActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    db_activity.status = status_update.status
    if status_update.evidence_url is not None:
        db_activity.evidence_url = status_update.evidence_url
        
    db.commit()
    db.refresh(db_activity)
    return db_activity
