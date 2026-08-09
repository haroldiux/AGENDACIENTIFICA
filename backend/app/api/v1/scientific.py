import os
import uuid
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_read_only_get, check_activity_scope_permission
from app.models.models import (
    ScientificActivity,
    ScientificActivityEvidence,
    ScientificActivityAudit,
    Career,
    Gestion,
    User,
    ActivityCategory,
)
from app.schemas.schemas import (
    ScientificActivityCreate,
    ScientificActivityUpdate,
    ScientificActivityStatusUpdate,
    ScientificActivityResponse,
    ScientificActivityFilterParams,
    ScientificActivityEvidenceResponse,
    ScientificActivityAuditResponse,
    RoleEnum,
)
from app.services.scientific_service import list_scientific_activities

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

STATUS_LABELS_ES = {
    "scheduled": "Programada",
    "in_progress": "En progreso",
    "completed": "Completada",
    "cancelled": "Cancelada",
}

def record_audit(db: Session, activity_id: int, user_id: Optional[int], action: str, description: str):
    audit = ScientificActivityAudit(
        scientific_activity_id=activity_id,
        user_id=user_id,
        action=action,
        description=description,
    )
    db.add(audit)

@router.get("/", response_model=List[ScientificActivityResponse])
def get_scientific_activities(
    career_id: Optional[int] = Query(default=None, ge=1),
    gestion_id: Optional[int] = Query(default=None, ge=1),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    try:
        filters = ScientificActivityFilterParams.model_validate({
            "career_id": career_id,
            "gestion_id": gestion_id,
            "start_date": start_date,
            "end_date": end_date,
        })
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    activities = list_scientific_activities(
        db,
        career_id=filters.career_id,
        gestion_id=filters.gestion_id,
        start_date=filters.start_date,
        end_date=filters.end_date,
        skip=skip,
        limit=limit,
    )
    return activities

@router.post("/", response_model=ScientificActivityResponse, status_code=status.HTTP_201_CREATED)
def create_scientific_activity(
    activity: ScientificActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    check_activity_scope_permission(current_user, activity.career_id)

    if activity.career_id is not None:
        career = db.query(Career).filter(Career.id == activity.career_id).first()
        if not career:
            raise HTTPException(status_code=404, detail="Career not found")
        
    gestion = db.query(Gestion).filter(Gestion.id == activity.gestion_id).first()
    if not gestion:
        raise HTTPException(status_code=404, detail="Gestion not found")

    if activity.category_id is not None:
        cat = db.query(ActivityCategory).filter(ActivityCategory.id == activity.category_id).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Activity category not found")

    activity_data = activity.model_dump(exclude={'collaboration_career_ids'})
    collab_ids = activity.collaboration_career_ids or []

    db_activity = ScientificActivity(**activity_data)
    db.add(db_activity)
    db.flush()  # get db_activity.id without committing

    if collab_ids:
        db_activity.collaboration_careers = db.query(Career).filter(Career.id.in_(collab_ids)).all()
    else:
        db_activity.collaboration_careers = []

    record_audit(
        db,
        db_activity.id,
        current_user.id,
        "CREACION",
        f"Actividad creada originalmente: '{db_activity.title}' (Responsable: {db_activity.responsible_name})"
    )

    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.put("/{id}", response_model=ScientificActivityResponse)
def update_scientific_activity(
    id: int,
    activity_update: ScientificActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    db_activity = db.query(ScientificActivity).filter(ScientificActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    check_activity_scope_permission(current_user, db_activity.career_id)

    update_data = activity_update.model_dump(exclude_unset=True)
    if "career_id" in update_data and update_data["career_id"] != db_activity.career_id:
        check_activity_scope_permission(current_user, update_data["career_id"])

    if "category_id" in update_data and update_data["category_id"] is not None:
        cat = db.query(ActivityCategory).filter(ActivityCategory.id == update_data["category_id"]).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Activity category not found")

    collab_ids = update_data.pop('collaboration_career_ids', None)

    for key, value in update_data.items():
        setattr(db_activity, key, value)

    if collab_ids is not None:
        db_activity.collaboration_careers = (
            db.query(Career).filter(Career.id.in_(collab_ids)).all()
            if collab_ids else []
        )

    record_audit(
        db,
        db_activity.id,
        current_user.id,
        "EDICION",
        f"Modificación de datos generales de la actividad (Título: '{db_activity.title}')"
    )

    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scientific_activity(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    db_activity = db.query(ScientificActivity).filter(ScientificActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    check_activity_scope_permission(current_user, db_activity.career_id)
            
    db.delete(db_activity)
    db.commit()
    return None

@router.put("/{id}/status", response_model=ScientificActivityResponse)
def update_scientific_status(
    id: int,
    status_update: ScientificActivityStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    db_activity = db.query(ScientificActivity).filter(ScientificActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    check_activity_scope_permission(current_user, db_activity.career_id)
            
    db_activity.status = status_update.status
    if status_update.evidence_url is not None:
        db_activity.evidence_url = status_update.evidence_url
    if status_update.notes is not None:
        db_activity.notes = status_update.notes
        
    st_label = STATUS_LABELS_ES.get(status_update.status, status_update.status)
    record_audit(
        db,
        db_activity.id,
        current_user.id,
        "CAMBIO_ESTADO",
        f"Estado modificado a '{st_label}'. Observaciones/Motivo: '{status_update.notes or 'Sin observaciones'}'"
    )

    db.commit()
    db.refresh(db_activity)
    return db_activity

# --- Evidence Endpoints ---

@router.post("/{id}/evidence", response_model=ScientificActivityEvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_scientific_activity_evidence(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    db_activity = db.query(ScientificActivity).filter(ScientificActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    check_activity_scope_permission(current_user, db_activity.career_id)

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed types: PDF, PNG, JPG, DOCX",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 10MB",
        )

    upload_dir = os.path.join("uploads", "evidences", str(id))
    os.makedirs(upload_dir, exist_ok=True)

    filename_safe = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(upload_dir, filename_safe)

    with open(file_path, "wb") as f:
        f.write(content)

    evidence = ScientificActivityEvidence(
        scientific_activity_id=id,
        filename=file.filename or filename_safe,
        file_path=file_path,
        file_type=file.content_type or "application/octet-stream",
        file_size=len(content),
        uploaded_by_id=current_user.id,
    )
    db.add(evidence)

    record_audit(
        db,
        id,
        current_user.id,
        "SUBIDA_EVIDENCIA",
        f"Evidencia digital adjuntada: '{file.filename}' ({(len(content)/1024):.1f} KB)"
    )

    db.commit()
    db.refresh(evidence)
    return evidence

@router.get("/{id}/evidence", response_model=List[ScientificActivityEvidenceResponse])
def list_scientific_activity_evidences(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    db_activity = db.query(ScientificActivity).filter(ScientificActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return db_activity.evidences

@router.delete("/evidence/{evidence_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scientific_activity_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    evidence = db.query(ScientificActivityEvidence).filter(ScientificActivityEvidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if evidence.scientific_activity:
        check_activity_scope_permission(current_user, evidence.scientific_activity.career_id)

    if os.path.exists(evidence.file_path):
        try:
            os.remove(evidence.file_path)
        except OSError:
            pass

    act_id = evidence.scientific_activity_id
    fn = evidence.filename

    db.delete(evidence)

    if act_id:
        record_audit(
            db,
            act_id,
            current_user.id,
            "ELIMINACION_EVIDENCIA",
            f"Evidencia digital eliminada: '{fn}'"
        )

    db.commit()
    return None

@router.get("/{id}/audits", response_model=List[ScientificActivityAuditResponse])
def list_scientific_activity_audits(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_read_only_get),
):
    db_activity = db.query(ScientificActivity).filter(ScientificActivity.id == id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    audits = db.query(ScientificActivityAudit).filter(
        ScientificActivityAudit.scientific_activity_id == id
    ).order_by(ScientificActivityAudit.timestamp.desc()).all()
    return audits

