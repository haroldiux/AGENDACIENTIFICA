from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.api import deps
from app.models.models import AcademicActivity, ScientificActivity, Career, Gestion
from app.schemas.schemas import ActivityCreate, ScientificActivityStatus

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_activity(activity: ActivityCreate, db: Session = Depends(deps.get_db)) -> Any:
    # Verify relations
    career = db.query(Career).filter(Career.id == activity.career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    gestion = db.query(Gestion).filter(Gestion.id == activity.gestion_id).first()
    if not gestion:
        raise HTTPException(status_code=404, detail="Gestion not found")

    if activity.is_scientific:
        if not activity.activity_type or not activity.responsible_name:
            raise HTTPException(status_code=400, detail="Missing fields for scientific activity")
        new_act = ScientificActivity(
            title=activity.title,
            start_date=activity.start_date,
            end_date=activity.end_date,
            career_id=activity.career_id,
            gestion_id=activity.gestion_id,
            activity_type=activity.activity_type,
            responsible_name=activity.responsible_name,
            status=ScientificActivityStatus.scheduled
        )
    else:
        if not activity.category:
            raise HTTPException(status_code=400, detail="Missing fields for academic activity")
        new_act = AcademicActivity(
            title=activity.title,
            start_date=activity.start_date,
            end_date=activity.end_date,
            career_id=activity.career_id,
            gestion_id=activity.gestion_id,
            category=activity.category
        )
    
    db.add(new_act)
    db.commit()
    db.refresh(new_act)
    return new_act
