from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_read_only_get, require_admin_role
from app.models.models import Gestion, User, AcademicActivity, ScientificActivity
from app.schemas.schemas import (
    GestionCreate,
    GestionUpdate,
    GestionResponse,
    GestionSummaryResponse,
    GestionClearResponse,
)

router = APIRouter()

@router.get("/", response_model=List[GestionResponse])
def get_gestiones(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    """Lists all gestiones ordered by start_date descending."""
    return db.query(Gestion).order_by(Gestion.start_date.desc()).offset(skip).limit(limit).all()

@router.get("/{gestion_id}", response_model=GestionResponse)
def get_gestion_by_id(
    gestion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    """Retrieves a single gestion by ID."""
    gestion = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not gestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gestión con ID {gestion_id} no encontrada",
        )
    return gestion

@router.get("/{gestion_id}/summary", response_model=GestionSummaryResponse)
def get_gestion_summary(
    gestion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    """Returns activity statistics for the specified gestion."""
    gestion = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not gestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gestión con ID {gestion_id} no encontrada",
        )

    academic_count = db.query(AcademicActivity).filter(AcademicActivity.gestion_id == gestion_id).count()
    scientific_count = db.query(ScientificActivity).filter(ScientificActivity.gestion_id == gestion_id).count()

    return GestionSummaryResponse(
        gestion_id=gestion.id,
        gestion_name=gestion.name,
        academic_count=academic_count,
        scientific_count=scientific_count,
        total_activities=academic_count + scientific_count,
    )

@router.post("/", response_model=GestionResponse, status_code=status.HTTP_201_CREATED)
def create_gestion(
    gestion: GestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Creates a new academic gestion. Requires administrative role."""
    if gestion.start_date >= gestion.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio debe ser anterior a la fecha de fin",
        )

    existing = db.query(Gestion).filter(Gestion.name == gestion.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una gestión registrada con el nombre '{gestion.name}'",
        )

    db_gestion = Gestion(**gestion.model_dump())
    db.add(db_gestion)
    db.commit()
    db.refresh(db_gestion)
    return db_gestion

@router.put("/{gestion_id}", response_model=GestionResponse)
def update_gestion(
    gestion_id: int,
    gestion_in: GestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Updates an existing academic gestion. Requires administrative role."""
    db_gestion = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not db_gestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gestión con ID {gestion_id} no encontrada",
        )

    data = gestion_in.model_dump(exclude_unset=True)

    if "name" in data and data["name"] is not None:
        existing = db.query(Gestion).filter(
            Gestion.name == data["name"],
            Gestion.id != gestion_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otra gestión con el nombre '{data['name']}'",
            )
        db_gestion.name = data["name"]

    if "start_date" in data and data["start_date"] is not None:
        db_gestion.start_date = data["start_date"]

    if "end_date" in data and data["end_date"] is not None:
        db_gestion.end_date = data["end_date"]

    if db_gestion.start_date >= db_gestion.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio debe ser anterior a la fecha de fin",
        )

    db.commit()
    db.refresh(db_gestion)
    return db_gestion

@router.delete("/{gestion_id}", status_code=status.HTTP_200_OK)
def delete_gestion(
    gestion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Deletes an academic gestion if it contains no associated activities."""
    db_gestion = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not db_gestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gestión con ID {gestion_id} no encontrada",
        )

    academic_count = db.query(AcademicActivity).filter(AcademicActivity.gestion_id == gestion_id).count()
    scientific_count = db.query(ScientificActivity).filter(ScientificActivity.gestion_id == gestion_id).count()
    total = academic_count + scientific_count

    if total > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"No se puede eliminar la gestión '{db_gestion.name}' porque contiene "
                f"{total} actividades registradas ({academic_count} académicas, {scientific_count} científicas). "
                f"Vaciá primero las actividades de la gestión si deseás eliminarla."
            ),
        )

    db.delete(db_gestion)
    db.commit()
    return {"detail": f"Gestión '{db_gestion.name}' eliminada correctamente"}

@router.post("/{gestion_id}/clear-activities", response_model=GestionClearResponse)
def clear_gestion_activities(
    gestion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """
    Clears all academic and scientific activities associated with a gestion.
    Requires administrative role.
    """
    db_gestion = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not db_gestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gestión con ID {gestion_id} no encontrada",
        )

    # 1. Fetch and delete scientific activities (cascading evidences, audits, and associations)
    sci_activities = db.query(ScientificActivity).filter(ScientificActivity.gestion_id == gestion_id).all()
    deleted_sci = len(sci_activities)
    for act in sci_activities:
        db.delete(act)

    # 2. Fetch and delete academic activities
    acad_activities = db.query(AcademicActivity).filter(AcademicActivity.gestion_id == gestion_id).all()
    deleted_acad = len(acad_activities)
    for act in acad_activities:
        db.delete(act)

    db.commit()

    return GestionClearResponse(
        detail=f"Se vaciaron exitosamente todas las actividades de la gestión '{db_gestion.name}'",
        deleted_academic=deleted_acad,
        deleted_scientific=deleted_sci,
        total_deleted=deleted_acad + deleted_sci,
    )
