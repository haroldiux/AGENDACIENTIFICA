import httpx
from datetime import datetime, timedelta, timezone
from celery.utils.log import get_task_logger
import smtplib
from email.message import EmailMessage

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.models import User, AcademicActivity, ScientificActivity
from app.core.config import settings

logger = get_task_logger(__name__)


def _build_weekly_summary(user: User, academic_activities: list, scientific_activities: list) -> str | None:
    """Build the weekly summary message for a user based on their assigned careers."""
    user_career_ids = {c.id for c in user.careers}

    def activity_matches(activity) -> bool:
        if activity.career_id is None:
            return True
        return activity.career_id in user_career_ids

    user_academic = [a for a in academic_activities if activity_matches(a)]
    user_scientific = [a for a in scientific_activities if activity_matches(a)]

    if not user_academic and not user_scientific:
        return None

    lines = [f"Hola {user.full_name or 'Usuario'}, aquí están tus actividades para la próxima semana:", ""]
    if user_academic:
        lines.append("*Actividades Académicas:*")
        for act in user_academic:
            lines.append(f"- {act.title} ({act.start_date.strftime('%d/%m/%Y')})")
        lines.append("")

    if user_scientific:
        lines.append("*Actividades Científicas:*")
        for act in user_scientific:
            lines.append(f"- {act.title} ({act.start_date.strftime('%d/%m/%Y')})")

    return "\n".join(lines)


def send_telegram_message(chat_id: str, message: str) -> bool:
    """Send a message via the Telegram Bot API (free)."""
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.warning("Telegram bot token not configured.")
        return False

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown",
    }

    try:
        response = httpx.post(url, json=payload, timeout=15.0)
        response.raise_for_status()
        logger.info(f"Telegram message sent to chat {chat_id}")
        return True
    except httpx.HTTPError as exc:
        logger.error(f"Failed to send Telegram message to chat {chat_id}: {exc}")
        return False


def send_whatsapp_message(phone_number: str, message: str) -> bool:
    """Send a message via the official WhatsApp Business API (requires paid credentials)."""
    if not settings.WHATSAPP_API_TOKEN or not settings.WHATSAPP_PHONE_ID:
        logger.warning("WhatsApp API token or Phone ID not configured.")
        return False

    url = f"https://graph.facebook.com/v17.0/{settings.WHATSAPP_PHONE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "text",
        "text": {"body": message}
    }

    try:
        response = httpx.post(url, headers=headers, json=payload, timeout=10.0)
        response.raise_for_status()
        logger.info(f"WhatsApp message sent to {phone_number}")
        return True
    except httpx.HTTPError as exc:
        logger.error(f"Failed to send WhatsApp message to {phone_number}: {exc}")
        return False


from app.services.email_service import email_service


def send_email_message(
    email_address: str,
    subject: str,
    message: str,
    user_name: str = "Usuario",
    academic_activities: list = None,
    scientific_activities: list = None,
) -> bool:
    """Send an email using EmailService (HTML digest or fallback text)."""
    if not settings.SMTP_HOST or not settings.SMTP_PORT or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP configuration is missing.")
        return False

    if academic_activities is not None or scientific_activities is not None:
        return email_service.send_digest_email(
            recipient_email=email_address,
            user_name=user_name,
            academic_activities=academic_activities or [],
            scientific_activities=scientific_activities or [],
        )

    html_content = f"<html><body><pre>{message}</pre></body></html>"
    return email_service.send_email(
        to_email=email_address,
        subject=subject,
        html_content=html_content,
        text_content=message,
    )


from app.models.models import User, AcademicActivity, ScientificActivity, UserNotificationPreference


@celery_app.task(name="app.workers.notification_worker.dispatch_weekly_notifications")
def dispatch_weekly_notifications():
    """Dispatch weekly activity summaries to all active users based on preference matrix.

    Channel evaluation order:
      1. Telegram (if enabled & chat ID present)
      2. WhatsApp Business API (if enabled & phone present)
      3. Email (if enabled or fallback)
    """
    logger.info("Starting weekly notification dispatch...")
    db = SessionLocal()
    try:
        today = datetime.now(timezone.utc).date()
        users = db.query(User).filter(User.is_active == True).all()

        for user in users:
            pref = user.notification_preference
            if not pref:
                pref = UserNotificationPreference(
                    user_id=user.id,
                    email_enabled=not bool(user.telegram_chat_id or user.phone_number),
                    whatsapp_enabled=bool(user.phone_number and not user.telegram_chat_id),
                    telegram_enabled=bool(user.telegram_chat_id),
                    notify_academic=True,
                    notify_scientific=True,
                    digest_frequency="weekly",
                    lookahead_days=7,
                )
                db.add(pref)
                db.commit()
                db.refresh(pref)

            lookahead_days = pref.lookahead_days if pref.lookahead_days else settings.NOTIFICATION_DAYS_AHEAD
            user_lookahead = today + timedelta(days=lookahead_days)

            user_academic = []
            if pref.notify_academic:
                user_academic = db.query(AcademicActivity).filter(
                    AcademicActivity.start_date <= user_lookahead,
                    AcademicActivity.start_date >= today
                ).all()

            user_scientific = []
            if pref.notify_scientific:
                user_scientific = db.query(ScientificActivity).filter(
                    ScientificActivity.start_date <= user_lookahead,
                    ScientificActivity.start_date >= today,
                    ScientificActivity.status != "cancelled"
                ).all()

            user_career_ids = {c.id for c in user.careers}
            def activity_matches(activity) -> bool:
                if activity.career_id is None:
                    return True
                return activity.career_id in user_career_ids

            user_academic = [a for a in user_academic if activity_matches(a)]
            user_scientific = [a for a in user_scientific if activity_matches(a)]

            message = _build_weekly_summary(user, user_academic, user_scientific)
            if not message:
                continue

            delivered = False
            channel = None

            # 1. Telegram
            if pref.telegram_enabled or (user.telegram_chat_id and not pref.email_enabled and not pref.whatsapp_enabled):
                telegram_target = (pref.custom_telegram_chat_id or user.telegram_chat_id or "").strip()
                if telegram_target:
                    delivered = send_telegram_message(telegram_target, message)
                    channel = "telegram"

            # 2. WhatsApp
            if not delivered and (pref.whatsapp_enabled or (user.phone_number and not pref.email_enabled)):
                whatsapp_target = (pref.custom_whatsapp or user.phone_number or "").strip()
                if whatsapp_target:
                    delivered = send_whatsapp_message(whatsapp_target, message)
                    channel = "whatsapp"

            # 3. Email
            if not delivered and (pref.email_enabled or user.email):
                email_target = (pref.custom_email or user.email or "").strip()
                if email_target:
                    delivered = send_email_message(
                        email_target,
                        "Agenda Científica - Actividades de la Semana",
                        message,
                        user_name=user.full_name or "Usuario",
                        academic_activities=user_academic,
                        scientific_activities=user_scientific,
                    )
                    channel = "email"

            if delivered:
                logger.info(f"Weekly summary delivered to {user.email} via {channel}")
            else:
                logger.warning(f"Could not deliver weekly summary to {user.email}: no channel configured or all channels failed")

    except Exception as e:
        logger.error(f"Error dispatching notifications: {e}")
    finally:
        db.close()
    logger.info("Finished weekly notification dispatch.")


