from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import AcademicActivity, ScientificActivity
from app.schemas.schemas import MergedCalendarResponse, MergedCalendarItem

router = APIRouter()

@router.get("/", response_model=MergedCalendarResponse)
def get_fusion_calendar(
    career_id: Optional[int] = None,
    gestion_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    academic_query = db.query(AcademicActivity)
    scientific_query = db.query(ScientificActivity)
    
    if career_id is not None:
        academic_query = academic_query.filter(
            or_(AcademicActivity.career_id == career_id, AcademicActivity.career_id.is_(None))
        )
        scientific_query = scientific_query.filter(
            or_(ScientificActivity.career_id == career_id, ScientificActivity.career_id.is_(None))
        )
        
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
                start_time=getattr(act, 'start_time', None),
                end_time=getattr(act, 'end_time', None),
                source_type="academic",
                scope="global" if act.career_id is None else "career",
                career_id=act.career_id,
                career_name=act.career.name if act.career else None,
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
                start_time=getattr(act, 'start_time', None),
                end_time=getattr(act, 'end_time', None),
                source_type="scientific",
                scope="global" if act.career_id is None else "career",
                career_id=act.career_id,
                career_name=act.career.name if act.career else None,
                activity_type=act.activity_type,
                status=act.status,
                responsible_name=act.responsible_name
            )
        )
        
    # Sort by start_date
    merged_items.sort(key=lambda x: x.start_date)
    
    return MergedCalendarResponse(items=merged_items)

