from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.api import deps
from app.models.models import AcademicActivity, ScientificActivity, Career, Gestion, User
from app.schemas.schemas import ActivityCreate, ScientificActivityStatus

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_activity(
    activity: ActivityCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_read_only_get),
) -> Any:
    deps.check_activity_scope_permission(current_user, activity.career_id)

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
    return {
        "id": new_act.id,
        "title": new_act.title,
        "start_date": str(new_act.start_date),
        "end_date": str(new_act.end_date),
        "career_id": new_act.career_id,
        "gestion_id": new_act.gestion_id,
        "is_scientific": activity.is_scientific,
    }
