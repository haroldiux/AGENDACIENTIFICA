from datetime import date, datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from app.api.deps import get_current_active_user
from app.core.config import settings, Settings
from app.main import app
from app.models.models import AcademicActivity, ScientificActivity, RoleEnum, User
from app.services.email_service import email_service, EmailService
from app.workers.notification_worker import (
    dispatch_weekly_notifications,
    send_email_message,
    send_telegram_message,
    send_whatsapp_message,
)


# ---------------------------------------------------------------------------
# 1. SMTP Config Defaults
# ---------------------------------------------------------------------------


def test_smtp_config_defaults():
    custom_settings = Settings()
    assert custom_settings.SMTP_HOST == "smtp.gmail.com"
    assert custom_settings.SMTP_PORT == 587
    assert custom_settings.SMTP_TLS is True
    assert custom_settings.EMAILS_FROM_NAME == "Agenda Científica UNITEPC"


# ---------------------------------------------------------------------------
# 2. Telegram & WhatsApp Messaging
# ---------------------------------------------------------------------------


def test_send_telegram_message_returns_false_when_token_missing(monkeypatch):
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.TELEGRAM_BOT_TOKEN", None
    )

    result = send_telegram_message("123456789", "test message")

    assert result is False


def test_send_telegram_message_returns_true_on_success(monkeypatch):
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.TELEGRAM_BOT_TOKEN", "test-bot-token"
    )

    with patch("app.workers.notification_worker.httpx.post") as mock_post:
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        result = send_telegram_message("123456789", "test message")

    assert result is True
    mock_post.assert_called_once()
    call_args = mock_post.call_args
    assert call_args.kwargs["json"]["chat_id"] == "123456789"
    assert "test message" in call_args.kwargs["json"]["text"]


def test_send_whatsapp_message_returns_false_when_config_missing(monkeypatch):
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.WHATSAPP_API_TOKEN", None
    )
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.WHATSAPP_PHONE_ID", None
    )

    result = send_whatsapp_message("+59112345678", "test message")

    assert result is False


def test_send_whatsapp_message_returns_true_on_success(monkeypatch):
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.WHATSAPP_API_TOKEN", "test-token"
    )
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.WHATSAPP_PHONE_ID", "test-phone-id"
    )

    with patch("app.workers.notification_worker.httpx.post") as mock_post:
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        result = send_whatsapp_message("+59112345678", "test message")

    assert result is True
    mock_post.assert_called_once()
    call_args = mock_post.call_args
    assert call_args.kwargs["json"]["to"] == "+59112345678"
    assert "test message" in call_args.kwargs["json"]["text"]["body"]


# ---------------------------------------------------------------------------
# 3. EmailService Unit Tests
# ---------------------------------------------------------------------------


def test_send_email_returns_false_when_smtp_host_missing(monkeypatch):
    monkeypatch.setattr("app.services.email_service.settings.SMTP_HOST", None)
    result = email_service.send_email("test@example.com", "Subject", "<p>Hello</p>")
    assert result is False


def test_email_service_send_email_success(monkeypatch):
    monkeypatch.setattr("app.services.email_service.settings.SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setattr("app.services.email_service.settings.SMTP_PORT", 587)
    monkeypatch.setattr("app.services.email_service.settings.SMTP_TLS", True)
    monkeypatch.setattr("app.services.email_service.settings.SMTP_USER", "user@unitepc.edu.bo")
    monkeypatch.setattr("app.services.email_service.settings.SMTP_PASSWORD", "secret")

    with patch("app.services.email_service.smtplib.SMTP") as mock_smtp_class:
        mock_server = MagicMock()
        mock_smtp_class.return_value.__enter__ = MagicMock(return_value=mock_server)
        mock_smtp_class.return_value.__exit__ = MagicMock(return_value=False)

        result = email_service.send_email("to@example.com", "Test Subject", "<p>Body</p>")

    assert result is True
    mock_smtp_class.assert_called_once_with("smtp.gmail.com", 587, timeout=15)
    mock_server.starttls.assert_called_once()
    mock_server.login.assert_called_once_with("user@unitepc.edu.bo", "secret")
    mock_server.send_message.assert_called_once()


def test_email_service_render_templates():
    service = EmailService()

    # Render test email template
    test_html = service.render_template(
        "email_test.html",
        {
            "recipient_email": "test@unitepc.edu.bo",
            "smtp_host": "smtp.gmail.com",
            "smtp_port": 587,
            "timestamp": "2026-08-10 10:00:00",
        },
    )
    assert "#6B3392" in test_html
    assert "#009E96" in test_html
    assert "test@unitepc.edu.bo" in test_html
    assert "smtp.gmail.com:587" in test_html

    # Render digest email template
    digest_html = service.render_template(
        "email_digest.html",
        {
            "user_name": "Dr. Perez",
            "academic_activities": [{"title": "Clase Magna", "start_date": "12/08/2026", "end_date": "12/08/2026", "category": "General"}],
            "scientific_activities": [{"title": "Congreso de Biología", "start_date": "15/08/2026", "end_date": "16/08/2026", "activity_type": "congreso", "responsible_name": "Dr. Gomez"}],
        },
    )
    assert "#6B3392" in digest_html
    assert "#009E96" in digest_html
    assert "Dr. Perez" in digest_html
    assert "Clase Magna" in digest_html
    assert "Congreso de Biología" in digest_html


def test_email_service_send_test_email():
    with patch.object(email_service, "send_email", return_value=True) as mock_send:
        res = email_service.send_test_email("admin@unitepc.edu.bo")

    assert res["success"] is True
    assert res["smtp_host"] == "smtp.gmail.com"
    assert res["smtp_port"] == 587
    assert isinstance(res["timestamp"], datetime)
    mock_send.assert_called_once()
    assert mock_send.call_args.kwargs["to_email"] == "admin@unitepc.edu.bo"


def test_email_service_send_digest_email():
    with patch.object(email_service, "send_email", return_value=True) as mock_send:
        res = email_service.send_digest_email(
            recipient_email="user@unitepc.edu.bo",
            user_name="Juan Perez",
            academic_activities=[{"title": "Taller 1", "start_date": "10/08/2026"}],
            scientific_activities=[],
        )

    assert res is True
    mock_send.assert_called_once()
    assert mock_send.call_args.kwargs["to_email"] == "user@unitepc.edu.bo"
    assert "Juan Perez" in mock_send.call_args.kwargs["html_content"]


# ---------------------------------------------------------------------------
# 4. Worker Notification Tasks & Email Fallback
# ---------------------------------------------------------------------------


def _create_activity(db_session, title: str, days_from_today: int):
    activity = AcademicActivity(
        title=title,
        start_date=date.today() + timedelta(days=days_from_today),
        end_date=date.today() + timedelta(days=days_from_today + 1),
        category="academic",
        gestion_id=1,
    )
    db_session.add(activity)


def test_dispatch_weekly_notifications_prefers_telegram(db_session, monkeypatch):
    monkeypatch.setattr(
        "app.workers.notification_worker.SessionLocal", lambda: db_session
    )
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.NOTIFICATION_DAYS_AHEAD", 7
    )

    user = User(
        email="telegram@example.com",
        full_name="Telegram User",
        hashed_password="pw",
        role=RoleEnum.teacher,
        is_active=True,
        telegram_chat_id="123456789",
        phone_number="+59111111111",
    )
    db_session.add(user)
    _create_activity(db_session, "Telegram Activity", 1)
    db_session.commit()

    with patch(
        "app.workers.notification_worker.send_telegram_message", return_value=True
    ) as mock_telegram, patch(
        "app.workers.notification_worker.send_whatsapp_message"
    ) as mock_whatsapp, patch(
        "app.workers.notification_worker.send_email_message"
    ) as mock_email:
        dispatch_weekly_notifications()

    mock_telegram.assert_called_once()
    assert "Telegram Activity" in mock_telegram.call_args.args[1]
    mock_whatsapp.assert_not_called()
    mock_email.assert_not_called()


def test_dispatch_weekly_notifications_falls_back_to_whatsapp_then_email(
    db_session, monkeypatch
):
    monkeypatch.setattr(
        "app.workers.notification_worker.SessionLocal", lambda: db_session
    )
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.NOTIFICATION_DAYS_AHEAD", 7
    )

    user = User(
        email="fallback@example.com",
        full_name="Fallback User",
        hashed_password="pw",
        role=RoleEnum.teacher,
        is_active=True,
        phone_number="+59122222222",
    )
    db_session.add(user)
    _create_activity(db_session, "Fallback Activity", 1)
    db_session.commit()

    with patch(
        "app.workers.notification_worker.send_whatsapp_message", return_value=False
    ) as mock_whatsapp, patch(
        "app.workers.notification_worker.send_email_message", return_value=True
    ) as mock_email:
        dispatch_weekly_notifications()

    mock_whatsapp.assert_called_once()
    mock_email.assert_called_once()
    assert mock_email.call_args.args[0] == "fallback@example.com"


def test_dispatch_weekly_notifications_uses_email_when_no_other_channel(
    db_session, monkeypatch
):
    monkeypatch.setattr(
        "app.workers.notification_worker.SessionLocal", lambda: db_session
    )
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.NOTIFICATION_DAYS_AHEAD", 7
    )

    user = User(
        email="onlyemail@example.com",
        full_name="Email Only User",
        hashed_password="pw",
        role=RoleEnum.teacher,
        is_active=True,
    )
    db_session.add(user)
    _create_activity(db_session, "Email Activity", 1)
    db_session.commit()

    with patch(
        "app.workers.notification_worker.send_email_message", return_value=True
    ) as mock_email:
        dispatch_weekly_notifications()

    mock_email.assert_called_once()
    assert mock_email.call_args.args[0] == "onlyemail@example.com"


def test_dispatch_weekly_notifications_filters_by_date(db_session, monkeypatch):
    monkeypatch.setattr(
        "app.workers.notification_worker.SessionLocal", lambda: db_session
    )
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.NOTIFICATION_DAYS_AHEAD", 7
    )

    user = User(
        email="datefilter@example.com",
        full_name="Date Filter User",
        hashed_password="pw",
        role=RoleEnum.teacher,
        is_active=True,
        telegram_chat_id="999999",
    )
    db_session.add(user)
    _create_activity(db_session, "Inside Window", 1)
    _create_activity(db_session, "Outside Window", 30)
    db_session.commit()

    with patch(
        "app.workers.notification_worker.send_telegram_message", return_value=True
    ) as mock_telegram:
        dispatch_weekly_notifications()

    message = mock_telegram.call_args.args[1]
    assert "Inside Window" in message
    assert "Outside Window" not in message


# ---------------------------------------------------------------------------
# 5. REST API Endpoint Integration Tests
# ---------------------------------------------------------------------------


def _make_admin_user() -> User:
    return User(
        id=1,
        email="admin@unitepc.edu.bo",
        hashed_password="pw",
        full_name="Admin User",
        role=RoleEnum.admin,
        is_active=True,
    )


def test_api_test_email_endpoint(client):
    user = _make_admin_user()
    app.dependency_overrides[get_current_active_user] = lambda: user

    with patch.object(
        email_service,
        "send_test_email",
        return_value={
            "success": True,
            "message": "Test email sent to test@unitepc.edu.bo",
            "smtp_host": "smtp.gmail.com",
            "smtp_port": 587,
            "timestamp": datetime.now(),
        },
    ):
        response = client.post(
            "/api/v1/notifications/test-email",
            json={"recipient_email": "test@unitepc.edu.bo"},
        )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["smtp_host"] == "smtp.gmail.com"
    assert data["smtp_port"] == 587
    assert "Test email sent to test@unitepc.edu.bo" in data["message"]


def test_api_send_digest_endpoint_with_recipient(client):
    user = _make_admin_user()
    app.dependency_overrides[get_current_active_user] = lambda: user

    with patch.object(email_service, "send_digest_email", return_value=True):
        response = client.post(
            "/api/v1/notifications/send-digest",
            json={"recipient_email": "target@unitepc.edu.bo"},
        )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["recipients_count"] == 1
    assert "target@unitepc.edu.bo" in data["message"]


def test_api_send_digest_endpoint_all_users(client, db_session):
    user = _make_admin_user()
    app.dependency_overrides[get_current_active_user] = lambda: user

    with patch.object(email_service, "send_digest_email", return_value=True):
        response = client.post(
            "/api/v1/notifications/send-digest",
            json={},
        )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "recipients_count" in data
