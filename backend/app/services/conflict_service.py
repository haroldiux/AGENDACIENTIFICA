from typing import Optional
from datetime import date
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.models import AcademicActivity, ScientificActivity, ScientificActivityStatus
from app.schemas.schemas import ConflictItem


def _overlaps(start_a: date, end_a: date, start_b: date, end_b: date) -> bool:
    """Return True if two inclusive date ranges intersect."""
    return start_a <= end_b and start_b <= end_a


def find_conflicts(db: Session, career_id: Optional[int], gestion_id: int) -> list[ConflictItem]:
    """Return overlapping academic/scientific activity pairs for a career and gestión.

    If career_id is provided, includes both career-specific and global activities.
    If career_id is None, detects conflicts across all activities for that gestión.
    Cancelled scientific activities are excluded from detection.
    """
    academic_query = db.query(AcademicActivity).filter(AcademicActivity.gestion_id == gestion_id)
    scientific_query = (
        db.query(ScientificActivity)
        .filter(ScientificActivity.gestion_id == gestion_id)
        .filter(ScientificActivity.status != ScientificActivityStatus.cancelled)
    )

    if career_id is not None:
        academic_query = academic_query.filter(
            or_(AcademicActivity.career_id == career_id, AcademicActivity.career_id.is_(None))
        )
        scientific_query = scientific_query.filter(
            or_(ScientificActivity.career_id == career_id, ScientificActivity.career_id.is_(None))
        )

    academics = academic_query.all()
    scientifics = scientific_query.all()

    conflicts: list[ConflictItem] = []
    for academic in academics:
        for scientific in scientifics:
            if _overlaps(
                academic.start_date,
                academic.end_date,
                scientific.start_date,
                scientific.end_date,
            ):
                conflicts.append(
                    ConflictItem(
                        academic_id=academic.id,
                        academic_title=academic.title,
                        academic_start_date=academic.start_date,
                        academic_end_date=academic.end_date,
                        scientific_id=scientific.id,
                        scientific_title=scientific.title,
                        scientific_type=scientific.activity_type,
                        scientific_start_date=scientific.start_date,
                        scientific_end_date=scientific.end_date,
                    )
                )

    return conflicts
