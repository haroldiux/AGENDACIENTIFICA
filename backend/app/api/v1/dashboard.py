from datetime import date
from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.models import AcademicActivity, ScientificActivity, Career, Gestion

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Return dashboard statistics for the current active gestion."""

    # Find the gestion that contains today's date, or the latest one
    today = date.today()
    active_gestion = (
        db.query(Gestion)
        .filter(Gestion.start_date <= today, Gestion.end_date >= today)
        .first()
    )
    if not active_gestion:
        active_gestion = db.query(Gestion).order_by(Gestion.start_date.desc()).first()

    gestion_id = active_gestion.id if active_gestion else None

    # Count totals
    total_academic = db.query(func.count(AcademicActivity.id))
    total_scientific = db.query(func.count(ScientificActivity.id))

    if gestion_id:
        total_academic = total_academic.filter(AcademicActivity.gestion_id == gestion_id)
        total_scientific = total_scientific.filter(ScientificActivity.gestion_id == gestion_id)

    # Upcoming events (from today onwards)
    upcoming_academic = (
        db.query(AcademicActivity)
        .filter(AcademicActivity.end_date >= today)
    )
    upcoming_scientific = (
        db.query(ScientificActivity)
        .filter(ScientificActivity.end_date >= today)
    )

    if gestion_id:
        upcoming_academic = upcoming_academic.filter(AcademicActivity.gestion_id == gestion_id)
        upcoming_scientific = upcoming_scientific.filter(ScientificActivity.gestion_id == gestion_id)

    # Recent/next 5 scientific activities
    next_scientific = (
        db.query(ScientificActivity)
        .filter(ScientificActivity.end_date >= today)
        .order_by(ScientificActivity.start_date.asc())
        .limit(5)
        .all()
    )

    # Count by status
    status_counts = {
        "scheduled": 0,
        "in_progress": 0,
        "completed": 0,
        "cancelled": 0,
    }
    status_query = db.query(ScientificActivity.status, func.count(ScientificActivity.id))
    if gestion_id:
        status_query = status_query.filter(ScientificActivity.gestion_id == gestion_id)
    for status, count in status_query.group_by(ScientificActivity.status).all():
        status_counts[status.value] = count

    return {
        "active_gestion": {
            "id": active_gestion.id if active_gestion else None,
            "name": active_gestion.name if active_gestion else None,
        },
        "counts": {
            "total_academic": total_academic.scalar() or 0,
            "total_scientific": total_scientific.scalar() or 0,
            "upcoming_events": upcoming_academic.count() + upcoming_scientific.count(),
            "upcoming_scientific": upcoming_scientific.count(),
        },
        "status_breakdown": status_counts,
        "next_events": [
            {
                "id": act.id,
                "title": act.title,
                "start_date": act.start_date.isoformat(),
                "end_date": act.end_date.isoformat(),
                "activity_type": act.activity_type.value if act.activity_type else None,
                "status": act.status.value if act.status else None,
                "career_id": act.career_id,
            }
            for act in next_scientific
        ],
    }
