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
    TestChannelRequest,
    TestChannelResponse,
)
from app.services.email_service import email_service
from app.core.config import settings
from app.workers.notification_worker import send_telegram_message, send_whatsapp_message
from app.api.v1.user_preferences import get_or_create_user_preference

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


@router.post("/test-channel", response_model=TestChannelResponse)
def test_notification_channel(
    request: TestChannelRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Diagnostic endpoint to trigger live test dispatches for a specific channel (email, whatsapp, telegram)."""
    channel = request.channel
    target = (request.target_destination or "").strip()

    pref = get_or_create_user_preference(db, current_user.id)

    if not target:
        if channel == "email":
            target = pref.custom_email or current_user.email or ""
        elif channel == "whatsapp":
            target = pref.custom_whatsapp or current_user.phone_number or ""
        elif channel == "telegram":
            target = pref.custom_telegram_chat_id or current_user.telegram_chat_id or ""

    if not target:
        return TestChannelResponse(
            success=False,
            message=f"No hay destino de contacto configurado para el canal {channel}.",
            channel=channel,
            target_destination="",
            timestamp=datetime.now(timezone.utc),
        )

    success = False
    message = ""

    if channel == "email":
        result = email_service.send_test_email(target)
        success = result["success"]
        message = result["message"]
    elif channel == "whatsapp":
        if not settings.WHATSAPP_API_TOKEN or not settings.WHATSAPP_PHONE_ID:
            return TestChannelResponse(
                success=False,
                message="Credenciales WhatsApp no configuradas. Agrega WHATSAPP_API_TOKEN y WHATSAPP_PHONE_ID en tu archivo .env",
                channel=channel,
                target_destination=target,
                timestamp=datetime.now(timezone.utc),
            )
        body = (
            f"Hola {current_user.full_name or 'Usuario'},\n\n"
            "Este es un mensaje de prueba del canal WhatsApp de Agenda Científica UNITEPC.\n"
            "Tu configuración de notificaciones WhatsApp está activa y funcional."
        )
        success = send_whatsapp_message(target, body)
        message = (
            f"Mensaje de prueba enviado con éxito vía WhatsApp a {target}"
            if success
            else f"No se pudo enviar el mensaje WhatsApp a {target}. Verifica tu número (ej: 59170000000) y las credenciales de WhatsApp Cloud API."
        )
    elif channel == "telegram":
        body = (
            f"Hola {current_user.full_name or 'Usuario'},\n\n"
            "Este es un mensaje de prueba del canal Telegram de Agenda Científica UNITEPC.\n"
            "Tu configuración de notificaciones Telegram está activa y funcional."
        )
        success = send_telegram_message(target, body)
        message = (
            f"Mensaje de prueba enviado con éxito vía Telegram a {target}"
            if success
            else f"No se pudo enviar el mensaje Telegram a {target}. Verifica tu Telegram Chat ID y el Bot Token."
        )

    return TestChannelResponse(
        success=success,
        message=message,
        channel=channel,
        target_destination=target,
        timestamp=datetime.now(timezone.utc),
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


@router.post("/send-weekly-digest-now")
def send_weekly_digest_now(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Dispatch the weekly schedule digest immediately for the current user across all their enabled channels."""
    pref = get_or_create_user_preference(db, current_user.id)
    today = datetime.now(timezone.utc).date()
    lookahead_days = pref.lookahead_days if pref.lookahead_days else settings.NOTIFICATION_DAYS_AHEAD
    user_lookahead = today + timedelta(days=lookahead_days)

    user_academic = []
    if pref.notify_academic:
        user_academic = db.query(AcademicActivity).filter(
            AcademicActivity.start_date <= user_lookahead,
            AcademicActivity.start_date >= today,
        ).all()

    user_scientific = []
    if pref.notify_scientific:
        user_scientific = db.query(ScientificActivity).filter(
            ScientificActivity.start_date <= user_lookahead,
            ScientificActivity.start_date >= today,
            ScientificActivity.status != "cancelled",
        ).all()

    user_career_ids = {c.id for c in current_user.careers}

    def activity_matches(activity) -> bool:
        if activity.career_id is None:
            return True
        return activity.career_id in user_career_ids

    user_academic = [a for a in user_academic if activity_matches(a)]
    user_scientific = [a for a in user_scientific if activity_matches(a)]

    from app.workers.notification_worker import (
        _build_weekly_summary,
        send_email_message,
        send_whatsapp_message,
        send_telegram_message,
    )

    message = _build_weekly_summary(current_user, user_academic, user_scientific)
    if not message:
        return {
            "success": True,
            "message": f"No hay actividades programadas en los próximos {lookahead_days} días para enviar.",
            "delivered_channels": [],
            "activities_count": 0,
        }

    delivered_channels = []
    errors = []

    # Email
    if pref.email_enabled:
        email_target = (pref.custom_email or current_user.email or "").strip()
        if email_target:
            if send_email_message(
                email_target,
                "Agenda Científica - Planificación Semanal",
                message,
                user_name=current_user.full_name or "Usuario",
                academic_activities=user_academic,
                scientific_activities=user_scientific,
            ):
                delivered_channels.append(f"Email ({email_target})")
            else:
                errors.append("Email (verifica SMTP_USER / SMTP_PASSWORD en .env)")

    # WhatsApp
    if pref.whatsapp_enabled:
        whatsapp_target = (pref.custom_whatsapp or current_user.phone_number or "").strip()
        if whatsapp_target:
            if send_whatsapp_message(whatsapp_target, message):
                delivered_channels.append(f"WhatsApp ({whatsapp_target})")
            else:
                errors.append("WhatsApp (verifica credenciales Meta API en .env)")

    # Telegram
    if pref.telegram_enabled:
        telegram_target = (pref.custom_telegram_chat_id or current_user.telegram_chat_id or "").strip()
        if telegram_target:
            if send_telegram_message(telegram_target, message):
                delivered_channels.append(f"Telegram ({telegram_target})")
            else:
                errors.append("Telegram (verifica bot token en .env)")

    success = len(delivered_channels) > 0
    return {
        "success": success,
        "message": (
            f"Planificación enviada con éxito por: {', '.join(delivered_channels)}"
            if success
            else (f"No se pudo enviar: {'; '.join(errors)}" if errors else "No tienes ningún canal activado con destino configurado.")
        ),
        "delivered_channels": delivered_channels,
        "errors": errors,
        "activities_count": len(user_academic) + len(user_scientific),
    }
