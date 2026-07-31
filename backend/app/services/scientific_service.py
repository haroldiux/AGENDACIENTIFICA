from typing import Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.models import ScientificActivity


def list_scientific_activities(
    db: Session,
    career_id: Optional[int] = None,
    gestion_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
) -> list[ScientificActivity]:
    """
    Return scientific activities filtered by career, gestion, and/or date range.

    Date range overlap predicate:
        activity.start_date <= filter_end_date AND activity.end_date >= filter_start_date
    """
    query = db.query(ScientificActivity)

    if career_id is not None:
        query = query.filter(ScientificActivity.career_id == career_id)

    if gestion_id is not None:
        query = query.filter(ScientificActivity.gestion_id == gestion_id)

    if start_date is not None and end_date is not None:
        query = query.filter(
            and_(
                ScientificActivity.start_date <= end_date,
                ScientificActivity.end_date >= start_date,
            )
        )

    return query.offset(skip).limit(limit).all()
