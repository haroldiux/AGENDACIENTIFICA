from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import require_read_only_get
from app.models.models import User
from app.schemas.schemas import ConflictListResponse
from app.services.conflict_service import find_conflicts

router = APIRouter()


@router.get("/", response_model=ConflictListResponse)
def get_conflicts(
    gestion_id: int = Query(..., ge=1),
    career_id: Optional[int] = Query(None, ge=1),
    sede_id: Optional[int] = Query(None, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    # If user is scoped to a sede, enforce/default to that sede
    effective_sede_id = sede_id
    if current_user.sede_id and not effective_sede_id:
        effective_sede_id = current_user.sede_id

    conflicts = find_conflicts(db, career_id, gestion_id, effective_sede_id)
    return ConflictListResponse(conflicts=conflicts)
