from typing import List, Optional
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import AcademicActivity, ScientificActivity
from app.schemas.schemas import MergedCalendarResponse, MergedCalendarItem

router = APIRouter()

def format_ical_escape(text: str) -> str:
    if not text:
        return ""
    return (
        text.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\n", "\\n")
        .replace("\r", "")
    )


@router.get("/", response_model=MergedCalendarResponse)
def get_fusion_calendar(
    career_id: Optional[int] = None,
    gestion_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    academic_query = db.query(AcademicActivity)
    scientific_query = db.query(ScientificActivity)
    
    if career_id is not None:
        academic_query = academic_query.filter(
            or_(AcademicActivity.career_id == career_id, AcademicActivity.career_id.is_(None))
        )
        scientific_query = scientific_query.filter(
            or_(ScientificActivity.career_id == career_id, ScientificActivity.career_id.is_(None))
        )
        
    if gestion_id:
        academic_query = academic_query.filter(AcademicActivity.gestion_id == gestion_id)
        scientific_query = scientific_query.filter(ScientificActivity.gestion_id == gestion_id)
        
    if start_date:
        academic_query = academic_query.filter(AcademicActivity.end_date >= start_date)
        scientific_query = scientific_query.filter(ScientificActivity.end_date >= start_date)
        
    if end_date:
        academic_query = academic_query.filter(AcademicActivity.start_date <= end_date)
        scientific_query = scientific_query.filter(ScientificActivity.start_date <= end_date)

    academic_activities = academic_query.all()
    scientific_activities = scientific_query.all()
    
    merged_items = []
    
    for act in academic_activities:
        merged_items.append(
            MergedCalendarItem(
                id=act.id,
                title=act.title,
                start_date=act.start_date,
                end_date=act.end_date,
                start_time=getattr(act, 'start_time', None),
                end_time=getattr(act, 'end_time', None),
                source_type="academic",
                scope="global" if act.career_id is None else "career",
                career_id=act.career_id,
                career_name=act.career.name if act.career else None,
                category=act.category,
                origin_color=act.origin_color
            )
        )
        
    for act in scientific_activities:
        merged_items.append(
            MergedCalendarItem(
                id=act.id,
                title=act.title,
                start_date=act.start_date,
                end_date=act.end_date,
                start_time=getattr(act, 'start_time', None),
                end_time=getattr(act, 'end_time', None),
                source_type="scientific",
                scope="global" if act.career_id is None else "career",
                career_id=act.career_id,
                career_name=act.career.name if act.career else None,
                activity_type=act.activity_type,
                status=act.status,
                responsible_name=act.responsible_name
            )
        )
        
    # Sort by start_date
    merged_items.sort(key=lambda x: x.start_date)
    
    return MergedCalendarResponse(items=merged_items)


@router.get("/export-ics")
def export_ical_stream(
    career_id: Optional[int] = Query(None),
    gestion_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Exports merged calendar activities as an RFC 5545 iCalendar (.ics) stream.
    """
    fusion_resp = get_fusion_calendar(
        career_id=career_id,
        gestion_id=gestion_id,
        start_date=start_date,
        end_date=end_date,
        db=db,
    )

    now_utc = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//UNITEPC//Agenda Cientifica v1.0//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Agenda Científica UNITEPC",
        "X-WR-TIMEZONE:UTC",
    ]

    for item in fusion_resp.items:
        lines.append("BEGIN:VEVENT")
        lines.append(f"UID:{item.source_type}-{item.id}@unitepc.edu.bo")
        lines.append(f"DTSTAMP:{now_utc}")
        lines.append(f"SUMMARY:{format_ical_escape(item.title)}")

        desc_parts = []
        if item.source_type == "scientific":
            act_type = item.activity_type.value if hasattr(item.activity_type, "value") else str(item.activity_type or 'Científica')
            desc_parts.append(f"Tipo: {act_type}")
            if item.responsible_name:
                desc_parts.append(f"Responsable: {item.responsible_name}")
            if item.status:
                status_str = item.status.value if hasattr(item.status, "value") else str(item.status)
                desc_parts.append(f"Estado: {status_str}")
        else:
            desc_parts.append(f"Categoría: {item.category or 'General'}")

        if item.career_name:
            desc_parts.append(f"Carrera: {item.career_name}")

        lines.append(f"DESCRIPTION:{format_ical_escape(' | '.join(desc_parts))}")

        has_time = bool(item.start_time and item.end_time)
        if has_time:
            try:
                s_parts = [int(p) for p in item.start_time.split(":")[:2]]
                e_parts = [int(p) for p in item.end_time.split(":")[:2]]
                dt_start = datetime(item.start_date.year, item.start_date.month, item.start_date.day, s_parts[0], s_parts[1])
                dt_end = datetime(item.end_date.year, item.end_date.month, item.end_date.day, e_parts[0], e_parts[1])
                lines.append(f"DTSTART:{dt_start.strftime('%Y%m%dT%H%M%SZ')}")
                lines.append(f"DTEND:{dt_end.strftime('%Y%m%dT%H%M%SZ')}")
            except Exception:
                has_time = False

        if not has_time:
            dt_start_str = item.start_date.strftime("%Y%m%d")
            dt_end_next = item.end_date + timedelta(days=1)
            dt_end_str = dt_end_next.strftime("%Y%m%d")
            lines.append(f"DTSTART;VALUE=DATE:{dt_start_str}")
            lines.append(f"DTEND;VALUE=DATE:{dt_end_str}")

        lines.append("END:VEVENT")

    lines.append("END:VCALENDAR")

    content = "\r\n".join(lines) + "\r\n"

    return Response(
        content=content,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Content-Disposition": "attachment; filename=agenda_unitepc.ics"
        },
    )


