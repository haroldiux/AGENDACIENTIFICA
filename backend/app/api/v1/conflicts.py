from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import ConflictListResponse
from app.services.conflict_service import find_conflicts

router = APIRouter()


@router.get("/", response_model=ConflictListResponse)
def get_conflicts(
    career_id: int = Query(..., ge=1),
    gestion_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    conflicts = find_conflicts(db, career_id, gestion_id)
    return ConflictListResponse(conflicts=conflicts)
