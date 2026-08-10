from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.models import AcademicActivity, ScientificActivity, User
from app.schemas.schemas import (
    SendDigestRequest,
    SendDigestResponse,
    TestEmailRequest,
    TestEmailResponse,
)
from app.services.email_service import email_service
from app.core.config import settings

router = APIRouter()


@router.post("/test-email", response_model=TestEmailResponse)
def send_test_email(
    request: TestEmailRequest,
    current_user: User = Depends(get_current_active_user),
):
    """Diagnostic endpoint to test SMTP settings by sending a test HTML email."""
    result = email_service.send_test_email(request.recipient_email)
    return TestEmailResponse(
        success=result["success"],
        message=result["message"],
        smtp_host=result["smtp_host"],
        smtp_port=result["smtp_port"],
        timestamp=result["timestamp"],
    )


@router.post("/send-digest", response_model=SendDigestResponse)
def send_digest(
    request: SendDigestRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Trigger activity digest email dispatch for a target recipient, user, or all active users."""
    today = datetime.now(timezone.utc).date()
    lookahead = today + timedelta(days=settings.NOTIFICATION_DAYS_AHEAD)

    academic_activities = db.query(AcademicActivity).filter(
        AcademicActivity.start_date <= lookahead,
        AcademicActivity.start_date >= today
    ).all()

    scientific_activities = db.query(ScientificActivity).filter(
        ScientificActivity.start_date <= lookahead,
        ScientificActivity.start_date >= today,
        ScientificActivity.status != "cancelled"
    ).all()

    recipients_count = 0

    if request.recipient_email:
        success = email_service.send_digest_email(
            recipient_email=request.recipient_email,
            user_name="Usuario",
            academic_activities=academic_activities,
            scientific_activities=scientific_activities,
        )
        if success:
            recipients_count = 1
        return SendDigestResponse(
            success=success,
            message=f"Digest email {'sent' if success else 'failed'} to {request.recipient_email}",
            recipients_count=recipients_count,
        )

    elif request.user_id:
        user = db.query(User).filter(User.id == request.user_id, User.is_active == True).first()
        if not user or not user.email:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or has no email address",
            )
        user_career_ids = {c.id for c in user.careers}
        def activity_matches(activity) -> bool:
            if activity.career_id is None:
                return True
            return activity.career_id in user_career_ids

        user_academic = [a for a in academic_activities if activity_matches(a)]
        user_scientific = [a for a in scientific_activities if activity_matches(a)]

        success = email_service.send_digest_email(
            recipient_email=user.email,
            user_name=user.full_name or "Usuario",
            academic_activities=user_academic,
            scientific_activities=user_scientific,
        )
        if success:
            recipients_count = 1
        return SendDigestResponse(
            success=success,
            message=f"Digest email {'sent' if success else 'failed'} to user {user.email}",
            recipients_count=recipients_count,
        )

    else:
        users = db.query(User).filter(User.is_active == True).all()
        for user in users:
            if not user.email:
                continue
            user_career_ids = {c.id for c in user.careers}
            def activity_matches(activity) -> bool:
                if activity.career_id is None:
                    return True
                return activity.career_id in user_career_ids

            user_academic = [a for a in academic_activities if activity_matches(a)]
            user_scientific = [a for a in scientific_activities if activity_matches(a)]

            if not user_academic and not user_scientific:
                continue

            success = email_service.send_digest_email(
                recipient_email=user.email,
                user_name=user.full_name or "Usuario",
                academic_activities=user_academic,
                scientific_activities=user_scientific,
            )
            if success:
                recipients_count += 1

        return SendDigestResponse(
            success=True,
            message=f"Digest emails dispatched to {recipients_count} recipient(s)",
            recipients_count=recipients_count,
        )
