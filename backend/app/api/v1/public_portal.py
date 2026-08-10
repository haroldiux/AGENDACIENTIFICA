import os
from pathlib import Path
from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.models.models import (
    AcademicActivity,
    ScientificActivity,
    ScientificActivityEvidence,
    Sede,
    Career,
    Gestion,
    ActivityCategory,
)

router = APIRouter()

# --- Response Schemas ---

class PublicCalendarItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    start_date: date
    end_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    source_type: str  # "academic" | "scientific"
    category: Optional[str] = None
    origin_color: Optional[str] = None
    activity_type: Optional[str] = None
    status: Optional[str] = None
    responsible_name: Optional[str] = None
    career_id: Optional[int] = None
    career_name: Optional[str] = None
    gestion_id: Optional[int] = None
    gestion_name: Optional[str] = None
    category_id: Optional[int] = None

class PublicCalendarResponse(BaseModel):
    items: List[PublicCalendarItem]

class PublicMetadataSede(BaseModel):
    id: int
    name: str

class PublicMetadataGestion(BaseModel):
    id: int
    name: str
    start_date: date
    end_date: date

class PublicMetadataCareer(BaseModel):
    id: int
    name: str
    faculty: str

class PublicMetadataCategory(BaseModel):
    id: int
    name: str
    code: str
    color: Optional[str] = None
    scope: str

class PublicMetadataResponse(BaseModel):
    gestiones: List[PublicMetadataGestion]
    sedes: List[PublicMetadataSede]
    careers: List[PublicMetadataCareer]
    categories: List[PublicMetadataCategory]

class PublicEvidenceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    file_type: str
    file_size: int
    uploaded_at: datetime
    download_url: str

class PublicEventDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    start_date: date
    end_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    source_type: str
    category: Optional[str] = None
    origin_color: Optional[str] = None
    activity_type: Optional[str] = None
    status: Optional[str] = None
    responsible_name: Optional[str] = None
    notes: Optional[str] = None
    career: Optional[dict] = None
    gestion: Optional[dict] = None
    activity_category: Optional[dict] = None
    evidences: List[PublicEvidenceItem] = []


# --- Endpoints ---

@router.get("/calendar", response_model=PublicCalendarResponse)
def get_public_calendar(
    gestion_id: Optional[int] = Query(default=None),
    sede_id: Optional[int] = Query(default=None),
    career_id: Optional[int] = Query(default=None),
    category_id: Optional[int] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    search: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    Public unauthenticated endpoint to search and filter academic and scientific activities.
    """
    # Pre-fetch career IDs for sede filter if applicable
    career_ids_in_sede = None
    if sede_id is not None:
        career_ids_in_sede = [
            c_id for (c_id,) in db.query(Career.id).join(Career.sedes).filter(Sede.id == sede_id).all()
        ]

    # Academic Activities Query
    acad_q = db.query(AcademicActivity).options(
        joinedload(AcademicActivity.career),
        joinedload(AcademicActivity.gestion),
        joinedload(AcademicActivity.activity_category),
    )

    if gestion_id is not None:
        acad_q = acad_q.filter(AcademicActivity.gestion_id == gestion_id)
    if career_id is not None:
        acad_q = acad_q.filter(AcademicActivity.career_id == career_id)
    elif career_ids_in_sede is not None:
        acad_q = acad_q.filter(AcademicActivity.career_id.in_(career_ids_in_sede))

    if category_id is not None:
        acad_q = acad_q.filter(AcademicActivity.category_id == category_id)
    if start_date is not None:
        acad_q = acad_q.filter(AcademicActivity.end_date >= start_date)
    if end_date is not None:
        acad_q = acad_q.filter(AcademicActivity.start_date <= end_date)
    if search:
        search_term = f"%{search.strip()}%"
        acad_q = acad_q.filter(
            or_(
                AcademicActivity.title.ilike(search_term),
                AcademicActivity.category.ilike(search_term),
            )
        )

    acad_results = acad_q.all()

    # Scientific Activities Query
    sci_q = db.query(ScientificActivity).options(
        joinedload(ScientificActivity.career),
        joinedload(ScientificActivity.gestion),
        joinedload(ScientificActivity.activity_category),
    )

    if gestion_id is not None:
        sci_q = sci_q.filter(ScientificActivity.gestion_id == gestion_id)
    if career_id is not None:
        sci_q = sci_q.filter(
            or_(
                ScientificActivity.career_id == career_id,
                ScientificActivity.collaboration_careers.any(Career.id == career_id),
            )
        )
    elif career_ids_in_sede is not None:
        sci_q = sci_q.filter(
            or_(
                ScientificActivity.career_id.in_(career_ids_in_sede),
                ScientificActivity.collaboration_careers.any(Career.id.in_(career_ids_in_sede)),
            )
        )

    if category_id is not None:
        sci_q = sci_q.filter(ScientificActivity.category_id == category_id)
    if start_date is not None:
        sci_q = sci_q.filter(ScientificActivity.end_date >= start_date)
    if end_date is not None:
        sci_q = sci_q.filter(ScientificActivity.start_date <= end_date)
    if search:
        search_term = f"%{search.strip()}%"
        sci_q = sci_q.filter(
            or_(
                ScientificActivity.title.ilike(search_term),
                ScientificActivity.responsible_name.ilike(search_term),
                ScientificActivity.notes.ilike(search_term),
            )
        )

    sci_results = sci_q.all()

    merged_items: List[PublicCalendarItem] = []

    for item in acad_results:
        merged_items.append(
            PublicCalendarItem(
                id=item.id,
                title=item.title,
                start_date=item.start_date,
                end_date=item.end_date,
                start_time=item.start_time,
                end_time=item.end_time,
                source_type="academic",
                category=item.category,
                origin_color=item.origin_color,
                career_id=item.career_id,
                career_name=item.career.name if item.career else None,
                gestion_id=item.gestion_id,
                gestion_name=item.gestion.name if item.gestion else None,
                category_id=item.category_id,
            )
        )

    for item in sci_results:
        merged_items.append(
            PublicCalendarItem(
                id=item.id,
                title=item.title,
                start_date=item.start_date,
                end_date=item.end_date,
                start_time=item.start_time,
                end_time=item.end_time,
                source_type="scientific",
                activity_type=item.activity_type.value if hasattr(item.activity_type, "value") else str(item.activity_type),
                status=item.status.value if hasattr(item.status, "value") else str(item.status),
                responsible_name=item.responsible_name,
                career_id=item.career_id,
                career_name=item.career.name if item.career else None,
                gestion_id=item.gestion_id,
                gestion_name=item.gestion.name if item.gestion else None,
                category_id=item.category_id,
            )
        )

    merged_items.sort(key=lambda x: (x.start_date, x.id))
    return PublicCalendarResponse(items=merged_items)


@router.get("/metadata", response_model=PublicMetadataResponse)
def get_public_metadata(db: Session = Depends(get_db)):
    """
    Public unauthenticated endpoint to fetch gestiones, sedes, careers, and categories.
    """
    gestiones = db.query(Gestion).order_by(Gestion.start_date.desc()).all()
    sedes = db.query(Sede).order_by(Sede.name.asc()).all()
    careers = db.query(Career).order_by(Career.name.asc()).all()
    categories = db.query(ActivityCategory).filter(ActivityCategory.is_active == True).order_by(ActivityCategory.name.asc()).all()

    return PublicMetadataResponse(
        gestiones=[
            PublicMetadataGestion(id=g.id, name=g.name, start_date=g.start_date, end_date=g.end_date)
            for g in gestiones
        ],
        sedes=[PublicMetadataSede(id=s.id, name=s.name) for s in sedes],
        careers=[
            PublicMetadataCareer(id=c.id, name=c.name, faculty=c.faculty) for c in careers
        ],
        categories=[
            PublicMetadataCategory(
                id=cat.id,
                name=cat.name,
                code=cat.code,
                color=cat.color,
                scope=cat.scope,
            )
            for cat in categories
        ],
    )


@router.get("/events/{source_type}/{id}", response_model=PublicEventDetailResponse)
@router.get("/events/{id}", response_model=PublicEventDetailResponse)
def get_public_event_detail(
    id: int,
    source_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Public unauthenticated endpoint to fetch detailed information for a single activity.
    Supports either /events/academic/123 or /events/123?source_type=academic
    """
    selected_source = source_type.lower() if source_type else None

    acad_act = None
    sci_act = None

    if selected_source == "academic":
        acad_act = (
            db.query(AcademicActivity)
            .options(
                joinedload(AcademicActivity.career),
                joinedload(AcademicActivity.gestion),
                joinedload(AcademicActivity.activity_category),
            )
            .filter(AcademicActivity.id == id)
            .first()
        )
    elif selected_source == "scientific":
        sci_act = (
            db.query(ScientificActivity)
            .options(
                joinedload(ScientificActivity.career),
                joinedload(ScientificActivity.gestion),
                joinedload(ScientificActivity.activity_category),
                joinedload(ScientificActivity.evidences),
            )
            .filter(ScientificActivity.id == id)
            .first()
        )
    else:
        # Auto-detect by checking scientific activity first, then academic
        sci_act = (
            db.query(ScientificActivity)
            .options(
                joinedload(ScientificActivity.career),
                joinedload(ScientificActivity.gestion),
                joinedload(ScientificActivity.activity_category),
                joinedload(ScientificActivity.evidences),
            )
            .filter(ScientificActivity.id == id)
            .first()
        )
        if not sci_act:
            acad_act = (
                db.query(AcademicActivity)
                .options(
                    joinedload(AcademicActivity.career),
                    joinedload(AcademicActivity.gestion),
                    joinedload(AcademicActivity.activity_category),
                )
                .filter(AcademicActivity.id == id)
                .first()
            )

    if not acad_act and not sci_act:
        raise HTTPException(status_code=404, detail="Event not found")

    if acad_act:
        return PublicEventDetailResponse(
            id=acad_act.id,
            title=acad_act.title,
            start_date=acad_act.start_date,
            end_date=acad_act.end_date,
            start_time=acad_act.start_time,
            end_time=acad_act.end_time,
            source_type="academic",
            category=acad_act.category,
            origin_color=acad_act.origin_color,
            career={"id": acad_act.career.id, "name": acad_act.career.name, "faculty": acad_act.career.faculty}
            if acad_act.career
            else None,
            gestion={"id": acad_act.gestion.id, "name": acad_act.gestion.name} if acad_act.gestion else None,
            activity_category={
                "id": acad_act.activity_category.id,
                "name": acad_act.activity_category.name,
                "code": acad_act.activity_category.code,
                "color": acad_act.activity_category.color,
            }
            if acad_act.activity_category
            else None,
            evidences=[],
        )

    # Scientific Activity Detail
    evidence_list = []
    for ev in sci_act.evidences:
        evidence_list.append(
            PublicEvidenceItem(
                id=ev.id,
                filename=ev.filename,
                file_type=ev.file_type,
                file_size=ev.file_size,
                uploaded_at=ev.uploaded_at,
                download_url=f"/api/v1/public-portal/evidences/{ev.id}/download",
            )
        )

    return PublicEventDetailResponse(
        id=sci_act.id,
        title=sci_act.title,
        start_date=sci_act.start_date,
        end_date=sci_act.end_date,
        start_time=sci_act.start_time,
        end_time=sci_act.end_time,
        source_type="scientific",
        activity_type=sci_act.activity_type.value if hasattr(sci_act.activity_type, "value") else str(sci_act.activity_type),
        status=sci_act.status.value if hasattr(sci_act.status, "value") else str(sci_act.status),
        responsible_name=sci_act.responsible_name,
        notes=sci_act.notes,
        career={"id": sci_act.career.id, "name": sci_act.career.name, "faculty": sci_act.career.faculty}
        if sci_act.career
        else None,
        gestion={"id": sci_act.gestion.id, "name": sci_act.gestion.name} if sci_act.gestion else None,
        activity_category={
            "id": sci_act.activity_category.id,
            "name": sci_act.activity_category.name,
            "code": sci_act.activity_category.code,
            "color": sci_act.activity_category.color,
        }
        if sci_act.activity_category
        else None,
        evidences=evidence_list,
    )


@router.get("/evidences/{id}/download")
def download_public_evidence(id: int, db: Session = Depends(get_db)):
    """
    Public unauthenticated endpoint to download evidence files with strict path traversal containment checks.
    """
    evidence = db.query(ScientificActivityEvidence).filter(ScientificActivityEvidence.id == id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence file not found")

    file_path_str = evidence.file_path

    # Security path containment check against path traversal attacks
    if ".." in file_path_str or "\x00" in file_path_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path or path traversal detected",
        )

    try:
        resolved_path = Path(file_path_str).resolve()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path or path traversal detected",
        )

    cwd_path = Path.cwd().resolve()
    # Check if resolved path is strictly within the project workspace directory
    try:
        if not resolved_path.is_relative_to(cwd_path):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file path or path traversal detected",
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path or path traversal detected",
        )

    if not resolved_path.exists() or not resolved_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence file content not found on disk",
        )

    return FileResponse(
        path=str(resolved_path),
        filename=evidence.filename,
        media_type=evidence.file_type or "application/octet-stream",
    )
