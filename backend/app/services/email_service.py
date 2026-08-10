import logging
import smtplib
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path
from typing import Any, List, Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        template_dir = Path(__file__).parent.parent / "templates"
        if template_dir.exists():
            self.env = Environment(
                loader=FileSystemLoader(str(template_dir)),
                autoescape=select_autoescape(["html", "xml"]),
            )
        else:
            self.env = None

    def render_template(self, template_name: str, context: dict) -> str:
        if not self.env:
            raise RuntimeError("Email templates directory not found.")
        template = self.env.get_template(template_name)
        return template.render(**context)

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send an email using SMTP (TLS with Gmail defaults)."""
        if not settings.SMTP_HOST or not settings.SMTP_PORT:
            logger.warning("SMTP host or port configuration is missing.")
            return False

        msg = EmailMessage()
        msg["Subject"] = subject

        from_name = settings.EMAILS_FROM_NAME or "Agenda Cientifica UNITEPC"
        from_addr = settings.EMAILS_FROM_EMAIL or settings.SMTP_USER or "noreply@unitepc.edu.bo"
        msg["From"] = f"{from_name} <{from_addr}>"
        msg["To"] = to_email

        if text_content:
            msg.set_content(text_content)
            msg.add_alternative(html_content, subtype="html")
        else:
            msg.set_content(html_content, subtype="html")

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                if getattr(settings, "SMTP_TLS", True):
                    server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as exc:
            logger.error(f"Failed to send email to {to_email}: {exc}")
            return False

    def send_test_email(self, recipient_email: str) -> dict:
        """Render and send SMTP diagnostic test email."""
        now = datetime.now()
        timestamp_str = now.strftime("%Y-%m-%d %H:%M:%S")
        context = {
            "recipient_email": recipient_email,
            "smtp_host": settings.SMTP_HOST or "smtp.gmail.com",
            "smtp_port": settings.SMTP_PORT or 587,
            "timestamp": timestamp_str,
        }
        try:
            html_content = self.render_template("email_test.html", context)
            success = self.send_email(
                to_email=recipient_email,
                subject="Prueba de Configuración SMTP - Agenda Científica UNITEPC",
                html_content=html_content,
                text_content=f"Prueba de correo SMTP exitosa para {recipient_email} a las {timestamp_str}.",
            )
        except Exception as e:
            logger.error(f"Error rendering test email template: {e}")
            success = False

        return {
            "success": success,
            "message": f"Test email sent to {recipient_email}" if success else "Failed to send test email",
            "smtp_host": settings.SMTP_HOST or "smtp.gmail.com",
            "smtp_port": settings.SMTP_PORT or 587,
            "timestamp": now,
        }

    def send_digest_email(
        self,
        recipient_email: str,
        user_name: str,
        academic_activities: List[Any],
        scientific_activities: List[Any],
    ) -> bool:
        """Render and send weekly activity digest HTML email."""
        def format_act(act):
            if isinstance(act, dict):
                return {
                    "title": act.get("title", ""),
                    "start_date": str(act.get("start_date", "")),
                    "end_date": str(act.get("end_date", "")),
                    "category": act.get("category", ""),
                    "activity_type": act.get("activity_type", ""),
                    "responsible_name": act.get("responsible_name", ""),
                }
            start_date_str = act.start_date.strftime("%d/%m/%Y") if hasattr(getattr(act, "start_date", None), "strftime") else str(getattr(act, "start_date", ""))
            end_date_str = act.end_date.strftime("%d/%m/%Y") if hasattr(getattr(act, "end_date", None), "strftime") else str(getattr(act, "end_date", ""))
            return {
                "title": getattr(act, "title", str(act)),
                "start_date": start_date_str,
                "end_date": end_date_str,
                "category": getattr(act, "category", ""),
                "activity_type": str(getattr(act, "activity_type", "")),
                "responsible_name": getattr(act, "responsible_name", ""),
            }

        formatted_academic = [format_act(a) for a in academic_activities]
        formatted_scientific = [format_act(a) for a in scientific_activities]

        context = {
            "user_name": user_name or "Usuario",
            "academic_activities": formatted_academic,
            "scientific_activities": formatted_scientific,
        }

        try:
            html_content = self.render_template("email_digest.html", context)
        except Exception as e:
            logger.error(f"Error rendering digest email template: {e}")
            return False

        lines = [f"Hola {user_name or 'Usuario'}, aquí están tus actividades para la próxima semana:", ""]
        if formatted_academic:
            lines.append("Actividades Académicas:")
            for a in formatted_academic:
                lines.append(f"- {a['title']} ({a['start_date']})")
            lines.append("")
        if formatted_scientific:
            lines.append("Actividades Científicas:")
            for a in formatted_scientific:
                lines.append(f"- {a['title']} ({a['start_date']})")

        text_content = "\n".join(lines)

        return self.send_email(
            to_email=recipient_email,
            subject="Agenda Científica - Actividades de la Semana",
            html_content=html_content,
            text_content=text_content,
        )


email_service = EmailService()
