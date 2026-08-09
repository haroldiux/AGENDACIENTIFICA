from datetime import date, timedelta
from unittest.mock import MagicMock, patch

import pytest

from app.models.models import AcademicActivity, RoleEnum, User
from app.workers.notification_worker import (
    dispatch_weekly_notifications,
    send_email_message,
    send_telegram_message,
    send_whatsapp_message,
)


# ---------------------------------------------------------------------------
# send_telegram_message
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


# ---------------------------------------------------------------------------
# send_whatsapp_message
# ---------------------------------------------------------------------------


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
# send_email_message
# ---------------------------------------------------------------------------


def test_send_email_message_returns_false_when_smtp_missing(monkeypatch):
    monkeypatch.setattr("app.workers.notification_worker.settings.SMTP_HOST", None)

    result = send_email_message("to@example.com", "subject", "body")

    assert result is False


def test_send_email_message_returns_true_on_success(monkeypatch):
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.SMTP_HOST", "smtp.example.com"
    )
    monkeypatch.setattr("app.workers.notification_worker.settings.SMTP_PORT", 587)
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.SMTP_USER", "user@example.com"
    )
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.SMTP_PASSWORD", "secret"
    )

    with patch("app.workers.notification_worker.smtplib.SMTP") as mock_smtp_class:
        mock_server = MagicMock()
        mock_smtp_class.return_value.__enter__ = MagicMock(return_value=mock_server)
        mock_smtp_class.return_value.__exit__ = MagicMock(return_value=False)

        result = send_email_message("to@example.com", "subject", "body")

    assert result is True
    mock_smtp_class.assert_called_once_with("smtp.example.com", 587)
    mock_server.starttls.assert_called_once()
    mock_server.login.assert_called_once_with("user@example.com", "secret")
    mock_server.send_message.assert_called_once()


# ---------------------------------------------------------------------------
# dispatch_weekly_notifications
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
    assert "Fallback Activity" in mock_email.call_args.args[2]


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
    assert "Email Activity" in mock_email.call_args.args[2]


def test_dispatch_weekly_notifications_skips_users_without_channels(
    db_session, monkeypatch
):
    monkeypatch.setattr(
        "app.workers.notification_worker.SessionLocal", lambda: db_session
    )
    monkeypatch.setattr(
        "app.workers.notification_worker.settings.NOTIFICATION_DAYS_AHEAD", 7
    )

    user = User(
        email="nocontact@example.com",
        full_name="No Contact User",
        hashed_password="pw",
        role=RoleEnum.teacher,
        is_active=True,
        phone_number=None,
    )
    db_session.add(user)
    _create_activity(db_session, "Skipped Activity", 1)
    db_session.commit()

    with patch(
        "app.workers.notification_worker.send_telegram_message"
    ) as mock_telegram, patch(
        "app.workers.notification_worker.send_whatsapp_message"
    ) as mock_whatsapp, patch(
        "app.workers.notification_worker.send_email_message", return_value=False
    ) as mock_email:
        dispatch_weekly_notifications()

    mock_telegram.assert_not_called()
    mock_whatsapp.assert_not_called()
    # Email is attempted as last fallback because the user has an email address,
    # but SMTP is not configured so it returns False.
    mock_email.assert_called_once()
    assert "nocontact@example.com" in mock_email.call_args.args[0]


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
