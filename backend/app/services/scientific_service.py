from typing import Optional
from datetime import date
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_
from app.models.models import ScientificActivity


def list_scientific_activities(
    db: Session,
    career_id: Optional[int] = None,
    gestion_id: Optional[int] = None,
    sede_id: Optional[int] = None,
    regimen: Optional[str] = None,
    plan_estudio: Optional[str] = None,
    pilar: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
) -> list[ScientificActivity]:
    """
    Return scientific activities filtered by career, gestion, sede, regimen, plan_estudio, pilar and/or date range.
    Uses joinedload/selectinload to eliminate N+1 queries during Pydantic serialization.
    """
    query = (
        db.query(ScientificActivity)
        .options(
            joinedload(ScientificActivity.activity_category),
            joinedload(ScientificActivity.sede),
            selectinload(ScientificActivity.collaboration_careers),
            selectinload(ScientificActivity.evidences),
            selectinload(ScientificActivity.audits),
        )
    )

    if career_id is not None:
        query = query.filter(ScientificActivity.career_id == career_id)

    if gestion_id is not None:
        query = query.filter(ScientificActivity.gestion_id == gestion_id)

    if sede_id is not None:
        query = query.filter(ScientificActivity.sede_id == sede_id)

    if regimen:
        query = query.filter(ScientificActivity.regimen == regimen)

    if plan_estudio:
        query = query.filter(ScientificActivity.plan_estudio == plan_estudio)

    if pilar:
        query = query.filter(ScientificActivity.pilar == pilar)

    if start_date is not None and end_date is not None:
        query = query.filter(
            and_(
                ScientificActivity.start_date <= end_date,
                ScientificActivity.end_date >= start_date,
            )
        )

    return query.offset(skip).limit(limit).all()
