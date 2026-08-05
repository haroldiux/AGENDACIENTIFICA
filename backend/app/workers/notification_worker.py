import httpx
from datetime import datetime, timedelta
from celery.utils.log import get_task_logger
import smtplib
from email.message import EmailMessage

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.models import User, AcademicActivity, ScientificActivity
from app.core.config import settings

logger = get_task_logger(__name__)

def send_whatsapp_message(phone_number: str, message: str) -> bool:
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

def send_email_message(email_address: str, subject: str, message: str) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_PORT or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP configuration is missing.")
        return False
        
    msg = EmailMessage()
    msg.set_content(message)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_USER
    msg["To"] = email_address

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Email message sent to {email_address}")
        return True
    except Exception as exc:
        logger.error(f"Failed to send email to {email_address}: {exc}")
        return False

@celery_app.task(name="app.workers.notification_worker.dispatch_weekly_notifications")
def dispatch_weekly_notifications():
    logger.info("Starting weekly notification dispatch...")
    db = SessionLocal()
    try:
        today = datetime.utcnow().date()
        lookahead = today + timedelta(days=settings.NOTIFICATION_DAYS_AHEAD)

        academic_activities = db.query(AcademicActivity).filter(
            AcademicActivity.start_date <= lookahead,
            AcademicActivity.start_date >= today
        ).all()
        
        scientific_activities = db.query(ScientificActivity).filter(
            ScientificActivity.start_date <= lookahead,
            ScientificActivity.start_date >= today
        ).all()
        
        if not academic_activities and not scientific_activities:
            logger.info("No upcoming activities to notify.")
            return

        users = db.query(User).filter(User.is_active == True).all()
        
        for user in users:
            user_career_ids = {c.id for c in user.careers}
            
            user_academic = [a for a in academic_activities if not user_career_ids or a.career_id in user_career_ids]
            user_scientific = [a for a in scientific_activities if not user_career_ids or a.career_id in user_career_ids]
            
            if not user_academic and not user_scientific:
                continue
                
            user_message_lines = [f"Hola {user.full_name or 'Usuario'}, aquí están tus actividades para la próxima semana:", ""]
            if user_academic:
                user_message_lines.append("*Actividades Académicas:*")
                for act in user_academic:
                    user_message_lines.append(f"- {act.title} ({act.start_date.strftime('%d/%m/%Y')})")
                user_message_lines.append("")
                
            if user_scientific:
                user_message_lines.append("*Actividades Científicas:*")
                for act in user_scientific:
                    user_message_lines.append(f"- {act.title} ({act.start_date.strftime('%d/%m/%Y')})")
                    
            user_message = "\n".join(user_message_lines)
            
            delivered = False
            if user.phone_number:
                delivered = send_whatsapp_message(user.phone_number, user_message)
                
            if not delivered and user.email:
                send_email_message(user.email, "Agenda Científica - Actividades de la Semana", user_message)
                
    except Exception as e:
        logger.error(f"Error dispatching notifications: {e}")
    finally:
        db.close()
    logger.info("Finished weekly notification dispatch.")
