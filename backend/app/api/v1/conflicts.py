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
    career_id: int = Query(..., ge=1),
    gestion_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    conflicts = find_conflicts(db, career_id, gestion_id)
    return ConflictListResponse(conflicts=conflicts)
