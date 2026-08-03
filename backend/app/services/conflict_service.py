from datetime import date

from sqlalchemy.orm import Session

from app.models.models import AcademicActivity, ScientificActivity, ScientificActivityStatus
from app.schemas.schemas import ConflictItem


def _overlaps(start_a: date, end_a: date, start_b: date, end_b: date) -> bool:
    """Return True if two inclusive date ranges intersect."""
    return start_a <= end_b and start_b <= end_a


def find_conflicts(db: Session, career_id: int, gestion_id: int) -> list[ConflictItem]:
    """Return overlapping academic/scientific activity pairs for a career and gestión.

    Cancelled scientific activities are excluded from detection.
    """
    academics = (
        db.query(AcademicActivity)
        .filter(AcademicActivity.career_id == career_id)
        .filter(AcademicActivity.gestion_id == gestion_id)
        .all()
    )

    scientifics = (
        db.query(ScientificActivity)
        .filter(ScientificActivity.career_id == career_id)
        .filter(ScientificActivity.gestion_id == gestion_id)
        .filter(ScientificActivity.status != ScientificActivityStatus.cancelled)
        .all()
    )

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
                        scientific_id=scientific.id,
                        scientific_title=scientific.title,
                        scientific_type=scientific.activity_type,
                        scientific_start_date=scientific.start_date,
                        scientific_end_date=scientific.end_date,
                    )
                )

    return conflicts
