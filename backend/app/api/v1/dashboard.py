from datetime import date, timedelta
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, or_

from app.db.session import get_db
from app.models.models import (
    AcademicActivity,
    ScientificActivity,
    Career,
    Gestion,
    ScientificActivityAudit,
    User,
    RoleEnum,
    ScientificActivityStatus,
)
from app.api.deps import get_current_active_user
from app.schemas.schemas import DashboardStatsResponse

router = APIRouter()

GLOBAL_ROLES = {
    RoleEnum.super_admin,
    RoleEnum.admin,
    RoleEnum.vicerrectorado,
    RoleEnum.director_investigacion,
    RoleEnum.research,
}

SCOPED_ROLES = {
    RoleEnum.coordinator,
    RoleEnum.jefe_investigacion,
    RoleEnum.teacher,
    RoleEnum.read_only,
}


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    gestion_id: Optional[int] = Query(None),
    career_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Return role-aware dashboard statistics and analytics aggregation."""
    today = date.today()

    # Resolve career scope authorization
    user_career_ids = [c.id for c in current_user.careers] if current_user.careers else []
    
    if current_user.role in SCOPED_ROLES:
        if career_id is not None:
            if career_id not in user_career_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view dashboard stats for this career",
                )
            target_career_ids = [career_id]
        else:
            target_career_ids = user_career_ids
    else:
        # Global role
        if career_id is not None:
            target_career_ids = [career_id]
        else:
            target_career_ids = None

    # Resolve active gestion
    if gestion_id is not None:
        active_gestion = db.query(Gestion).filter(Gestion.id == gestion_id).first()
        if not active_gestion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gestion not found",
            )
    else:
        active_gestion = (
            db.query(Gestion)
            .filter(Gestion.start_date <= today, Gestion.end_date >= today)
            .first()
        )
        if not active_gestion:
            active_gestion = (
                db.query(Gestion).order_by(Gestion.start_date.desc()).first()
            )

    g_id = active_gestion.id if active_gestion else None

    # Helper filters
    def apply_career_filter(query, model):
        if target_career_ids is not None:
            if len(target_career_ids) == 0:
                return query.filter(model.id == -1)  # No matches if empty
            return query.filter(model.career_id.in_(target_career_ids))
        return query

    # Queries base
    acad_q = db.query(AcademicActivity)
    sci_q = db.query(ScientificActivity)

    if g_id:
        acad_q = acad_q.filter(AcademicActivity.gestion_id == g_id)
        sci_q = sci_q.filter(ScientificActivity.gestion_id == g_id)

    acad_q = apply_career_filter(acad_q, AcademicActivity)
    sci_q = apply_career_filter(sci_q, ScientificActivity)

    # Count totals
    total_academic = acad_q.count()
    total_scientific = sci_q.count()

    # Upcoming ranges
    day_7 = today + timedelta(days=7)
    day_30 = today + timedelta(days=30)

    acad_7 = acad_q.filter(
        AcademicActivity.end_date >= today, AcademicActivity.start_date <= day_7
    ).count()
    sci_7 = sci_q.filter(
        ScientificActivity.end_date >= today, ScientificActivity.start_date <= day_7
    ).count()
    upcoming_7_days = acad_7 + sci_7

    acad_30 = acad_q.filter(
        AcademicActivity.end_date >= today, AcademicActivity.start_date <= day_30
    ).count()
    sci_30 = sci_q.filter(
        ScientificActivity.end_date >= today, ScientificActivity.start_date <= day_30
    ).count()
    upcoming_30_days = acad_30 + sci_30

    upcoming_events_acad = acad_q.filter(AcademicActivity.end_date >= today).count()
    upcoming_events_sci = sci_q.filter(ScientificActivity.end_date >= today).count()
    upcoming_events_total = upcoming_events_acad + upcoming_events_sci

    # Completed & completion rate
    completed_sci = sci_q.filter(
        ScientificActivity.status == ScientificActivityStatus.completed
    ).count()
    completion_rate = (
        round((completed_sci / total_scientific) * 100.0, 1)
        if total_scientific > 0
        else 0.0
    )

    # Status breakdown
    status_counts = {
        "scheduled": 0,
        "in_progress": 0,
        "completed": 0,
        "cancelled": 0,
    }
    status_subq = db.query(
        ScientificActivity.status, func.count(ScientificActivity.id)
    )
    if g_id:
        status_subq = status_subq.filter(ScientificActivity.gestion_id == g_id)
    status_subq = apply_career_filter(status_subq, ScientificActivity)

    for st, cnt in status_subq.group_by(ScientificActivity.status).all():
        if st:
            status_counts[st.value] = cnt

    # Monthly timeline (1..12)
    acad_month_q = db.query(
        extract("month", AcademicActivity.start_date), func.count(AcademicActivity.id)
    )
    if g_id:
        acad_month_q = acad_month_q.filter(AcademicActivity.gestion_id == g_id)
    acad_month_q = apply_career_filter(acad_month_q, AcademicActivity)
    acad_months = dict(
        acad_month_q.group_by(extract("month", AcademicActivity.start_date)).all()
    )

    sci_month_q = db.query(
        extract("month", ScientificActivity.start_date), func.count(ScientificActivity.id)
    )
    if g_id:
        sci_month_q = sci_month_q.filter(ScientificActivity.gestion_id == g_id)
    sci_month_q = apply_career_filter(sci_month_q, ScientificActivity)
    sci_months = dict(
        sci_month_q.group_by(extract("month", ScientificActivity.start_date)).all()
    )

    monthly_timeline = []
    for m in range(1, 13):
        monthly_timeline.append(
            {
                "month": m,
                "academic_count": int(acad_months.get(m, 0)),
                "scientific_count": int(sci_months.get(m, 0)),
            }
        )

    # Career breakdown
    career_breakdown = []
    career_query = db.query(Career)
    if target_career_ids is not None:
        if len(target_career_ids) > 0:
            career_query = career_query.filter(Career.id.in_(target_career_ids))
        else:
            career_query = career_query.filter(Career.id == -1)

    careers = career_query.all()
    for car in careers:
        car_sci_q = db.query(ScientificActivity).filter(
            ScientificActivity.career_id == car.id
        )
        if g_id:
            car_sci_q = car_sci_q.filter(ScientificActivity.gestion_id == g_id)
        car_total = car_sci_q.count()
        car_completed = car_sci_q.filter(
            ScientificActivity.status == ScientificActivityStatus.completed
        ).count()
        car_rate = (
            round((car_completed / car_total) * 100.0, 1) if car_total > 0 else 0.0
        )
        career_breakdown.append(
            {
                "career_id": car.id,
                "career_name": car.name,
                "faculty": car.faculty,
                "total": car_total,
                "completion_rate": car_rate,
            }
        )

    # Recent Audits
    audit_q = (
        db.query(ScientificActivityAudit)
        .join(
            ScientificActivity,
            ScientificActivityAudit.scientific_activity_id == ScientificActivity.id,
        )
    )
    if g_id:
        audit_q = audit_q.filter(ScientificActivity.gestion_id == g_id)
    audit_q = apply_career_filter(audit_q, ScientificActivity)
    recent_audits_raw = (
        audit_q.order_by(ScientificActivityAudit.timestamp.desc()).limit(10).all()
    )

    recent_audits = []
    for aud in recent_audits_raw:
        title = (
            aud.scientific_activity.title
            if aud.scientific_activity
            else aud.description
        )
        u_name = (
            aud.user.full_name
            if (aud.user and aud.user.full_name)
            else (aud.user.email if aud.user else "Sistema")
        )
        u_role = (
            aud.user.role.value if (aud.user and aud.user.role) else None
        )
        recent_audits.append(
            {
                "id": aud.id,
                "title": title,
                "user_name": u_name,
                "role": u_role,
                "action": aud.action,
                "timestamp": aud.timestamp,
            }
        )

    # Next events (upcoming 5 scientific)
    next_sci = sci_q.filter(
        ScientificActivity.end_date >= today
    ).order_by(ScientificActivity.start_date.asc()).limit(5).all()

    next_events = [
        {
            "id": act.id,
            "title": act.title,
            "start_date": act.start_date,
            "end_date": act.end_date,
            "activity_type": act.activity_type.value if act.activity_type else None,
            "status": act.status.value if act.status else None,
            "career_id": act.career_id,
        }
        for act in next_sci
    ]

    return {
        "active_gestion": {
            "id": active_gestion.id if active_gestion else None,
            "name": active_gestion.name if active_gestion else None,
        },
        "counts": {
            "total_academic": total_academic,
            "total_scientific": total_scientific,
            "upcoming_7_days": upcoming_7_days,
            "upcoming_30_days": upcoming_30_days,
            "completed_scientific": completed_sci,
            "completion_rate": completion_rate,
            "upcoming_events": upcoming_events_total,
            "upcoming_scientific": upcoming_events_sci,
        },
        "status_breakdown": status_counts,
        "monthly_timeline": monthly_timeline,
        "career_breakdown": career_breakdown,
        "recent_audits": recent_audits,
        "next_events": next_events,
    }

