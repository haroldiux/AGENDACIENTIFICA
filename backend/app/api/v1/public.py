from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import AcademicActivity, ScientificActivity, Career
from app.schemas.schemas import MergedCalendarResponse, MergedCalendarItem, CareerResponse

router = APIRouter()

@router.get("/fusion", response_model=MergedCalendarResponse)
def get_public_fusion_calendar(
    career_id: Optional[int] = None,
    gestion_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to view the merged calendar (academic and scientific).
    Does not require authentication.
    """
    academic_query = db.query(AcademicActivity)
    scientific_query = db.query(ScientificActivity)
    
    if career_id:
        academic_query = academic_query.filter(AcademicActivity.career_id == career_id)
        scientific_query = scientific_query.filter(ScientificActivity.career_id == career_id)
        
    if gestion_id:
        academic_query = academic_query.filter(AcademicActivity.gestion_id == gestion_id)
        scientific_query = scientific_query.filter(ScientificActivity.gestion_id == gestion_id)
        
    if start_date:
        academic_query = academic_query.filter(AcademicActivity.end_date >= start_date)
        scientific_query = scientific_query.filter(ScientificActivity.end_date >= start_date)
        
    if end_date:
        academic_query = academic_query.filter(AcademicActivity.start_date <= end_date)
        scientific_query = scientific_query.filter(ScientificActivity.start_date <= end_date)

    academic_activities = academic_query.all()
    scientific_activities = scientific_query.all()
    
    merged_items = []
    
    for act in academic_activities:
        merged_items.append(
            MergedCalendarItem(
                id=act.id,
                title=act.title,
                start_date=act.start_date,
                end_date=act.end_date,
                source_type="academic",
                category=act.category,
                origin_color=act.origin_color
            )
        )
        
    for act in scientific_activities:
        merged_items.append(
            MergedCalendarItem(
                id=act.id,
                title=act.title,
                start_date=act.start_date,
                end_date=act.end_date,
                source_type="scientific",
                activity_type=act.activity_type,
                status=act.status,
                responsible_name=act.responsible_name
            )
        )
        
    merged_items.sort(key=lambda x: x.start_date)
    return MergedCalendarResponse(items=merged_items)


@router.get("/careers", response_model=list[CareerResponse])
def get_public_careers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to list careers.
    Does not require authentication.
    """
    careers = db.query(Career).offset(skip).limit(limit).all()
    return careers
