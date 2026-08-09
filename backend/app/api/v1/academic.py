from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_read_only_get, check_activity_scope_permission
from app.models.models import AcademicActivity, Career, Gestion, User, ActivityCategory
from app.schemas.schemas import AcademicActivityCreate, AcademicActivityUpdate, AcademicActivityResponse

router = APIRouter()

@router.get("/", response_model=List[AcademicActivityResponse])
def get_academic_activities(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    activities = db.query(AcademicActivity).offset(skip).limit(limit).all()
    return activities

@router.post("/", response_model=AcademicActivityResponse, status_code=status.HTTP_201_CREATED)
def create_academic_activity(
    activity: AcademicActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    check_activity_scope_permission(current_user, activity.career_id)

    if activity.career_id is not None:
        career = db.query(Career).filter(Career.id == activity.career_id).first()
        if not career:
            raise HTTPException(status_code=404, detail="Career not found")
        
    gestion = db.query(Gestion).filter(Gestion.id == activity.gestion_id).first()
    if not gestion:
        raise HTTPException(status_code=404, detail="Gestion not found")

    activity_data = activity.model_dump()
    if activity.category_id is not None:
        cat = db.query(ActivityCategory).filter(ActivityCategory.id == activity.category_id).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Activity category not found")
        if not activity_data.get("category") or activity_data.get("category") == "GENERAL":
            activity_data["category"] = cat.code

    db_activity = AcademicActivity(**activity_data)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.put("/{id}", response_model=AcademicActivityResponse)
def update_academic_activity(
    id: int,
    activity_update: AcademicActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    db_activity = db.query(AcademicActivity).filter(AcademicActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    check_activity_scope_permission(current_user, db_activity.career_id)

    update_data = activity_update.model_dump(exclude_unset=True)
    if "career_id" in update_data and update_data["career_id"] != db_activity.career_id:
        check_activity_scope_permission(current_user, update_data["career_id"])

    if "category_id" in update_data and update_data["category_id"] is not None:
        cat = db.query(ActivityCategory).filter(ActivityCategory.id == update_data["category_id"]).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Activity category not found")

    for key, value in update_data.items():
        setattr(db_activity, key, value)
        
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_academic_activity(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    db_activity = db.query(AcademicActivity).filter(AcademicActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    check_activity_scope_permission(current_user, db_activity.career_id)

    db.delete(db_activity)
    db.commit()
    return None

@router.post("/import", status_code=status.HTTP_201_CREATED)
def batch_import_academic_activities(
    activities: List[AcademicActivityCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    for activity in activities:
        check_activity_scope_permission(current_user, activity.career_id)

    db_activities = []
    for activity in activities:
        db_activity = AcademicActivity(**activity.model_dump())
        db.add(db_activity)
        db_activities.append(db_activity)
    db.commit()
    return {"message": f"Successfully imported {len(activities)} activities"}

