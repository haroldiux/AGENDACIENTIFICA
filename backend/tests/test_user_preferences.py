from datetime import date, datetime, timedelta
from unittest.mock import MagicMock, patch
import pytest

from app.api.deps import get_current_active_user
from app.main import app
from app.models.models import AcademicActivity, ScientificActivity, RoleEnum, User, UserNotificationPreference
from app.services.email_service import email_service


def _make_test_user(user_id: int = 10, email: str = "testuser@unitepc.edu.bo") -> User:
    return User(
        id=user_id,
        email=email,
        hashed_password="hashed_pw",
        full_name="Test User Preferences",
        role=RoleEnum.teacher,
        is_active=True,
    )


def test_get_notification_preferences_auto_initialization(client, db_session):
    user = _make_test_user(user_id=101, email="autoinit@unitepc.edu.bo")
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: user

    response = client.get("/api/v1/users/me/notification-preferences")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == 101
    assert data["email_enabled"] is True
    assert data["whatsapp_enabled"] is False
    assert data["telegram_enabled"] is False
    assert data["notify_academic"] is True
    assert data["notify_scientific"] is True
    assert data["digest_frequency"] == "weekly"
    assert data["lookahead_days"] == 7


def test_update_notification_preferences_success(client, db_session):
    user = _make_test_user(user_id=102, email="updatepref@unitepc.edu.bo")
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: user

    payload = {
        "whatsapp_enabled": True,
        "custom_whatsapp": "+59170012345",
        "lookahead_days": 14,
        "digest_frequency": "daily",
    }

    response = client.put("/api/v1/users/me/notification-preferences", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["whatsapp_enabled"] is True
    assert data["custom_whatsapp"] == "+59170012345"
    assert data["lookahead_days"] == 14
    assert data["digest_frequency"] == "daily"

    # Verify persistence via GET
    get_res = client.get("/api/v1/users/me/notification-preferences")
    app.dependency_overrides.clear()
    assert get_res.status_code == 200
    assert get_res.json()["custom_whatsapp"] == "+59170012345"


def test_update_notification_preferences_invalid_lookahead(client, db_session):
    user = _make_test_user(user_id=103, email="invalidpref@unitepc.edu.bo")
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: user

    response = client.put(
        "/api/v1/users/me/notification-preferences",
        json={"lookahead_days": 99},
    )
    app.dependency_overrides.clear()
    assert response.status_code == 422


def test_test_channel_endpoint_email(client, db_session):
    user = _make_test_user(user_id=104, email="testchan_email@unitepc.edu.bo")
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: user

    with patch.object(
        email_service,
        "send_test_email",
        return_value={
            "success": True,
            "message": "Email sent",
            "smtp_host": "smtp.gmail.com",
            "smtp_port": 587,
            "timestamp": datetime.now(),
        },
    ):
        response = client.post(
            "/api/v1/notifications/test-channel",
            json={"channel": "email"},
        )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["channel"] == "email"
    assert data["target_destination"] == "testchan_email@unitepc.edu.bo"


def test_test_channel_endpoint_whatsapp_custom_target(client, db_session):
    user = _make_test_user(user_id=105, email="testchan_wa@unitepc.edu.bo")
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: user

    with patch("app.api.v1.notifications.send_whatsapp_message", return_value=True) as mock_wa:
        response = client.post(
            "/api/v1/notifications/test-channel",
            json={"channel": "whatsapp", "target_destination": "+59177777777"},
        )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["target_destination"] == "+59177777777"
    mock_wa.assert_called_once()


def test_test_channel_endpoint_no_destination_error(client, db_session):
    user = _make_test_user(user_id=106, email="nodest@unitepc.edu.bo")
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: user

    response = client.post(
        "/api/v1/notifications/test-channel",
        json={"channel": "whatsapp"},
    )
    app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "No hay destino de contacto" in data["message"]


def test_worker_respects_custom_destinations_and_lookahead(db_session, monkeypatch):
    from app.workers.notification_worker import dispatch_weekly_notifications

    monkeypatch.setattr(
        "app.workers.notification_worker.SessionLocal", lambda: db_session
    )

    user = User(
        id=200,
        email="original@example.com",
        full_name="Custom Dest User",
        hashed_password="pw",
        role=RoleEnum.teacher,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    pref = UserNotificationPreference(
        user_id=user.id,
        email_enabled=True,
        whatsapp_enabled=False,
        telegram_enabled=False,
        custom_email="custom_dest@example.com",
        notify_academic=True,
        notify_scientific=False,
        lookahead_days=14,
    )
    db_session.add(pref)

    acad_act = AcademicActivity(
        title="10 Days Academic",
        start_date=date.today() + timedelta(days=10),
        end_date=date.today() + timedelta(days=11),
        category="academic",
        gestion_id=1,
    )
    sci_act = ScientificActivity(
        title="10 Days Scientific",
        start_date=date.today() + timedelta(days=10),
        end_date=date.today() + timedelta(days=11),
        activity_type="congreso",
        responsible_name="Dr. Sci",
        gestion_id=1,
    )
    db_session.add(acad_act)
    db_session.add(sci_act)
    db_session.commit()

    with patch(
        "app.workers.notification_worker.send_email_message", return_value=True
    ) as mock_email:
        dispatch_weekly_notifications()

    mock_email.assert_called_once()
    assert mock_email.call_args.args[0] == "custom_dest@example.com"
    academic_passed = mock_email.call_args.kwargs["academic_activities"]
    scientific_passed = mock_email.call_args.kwargs["scientific_activities"]

    assert len(academic_passed) == 1
    assert academic_passed[0].title == "10 Days Academic"
    assert len(scientific_passed) == 0  # notify_scientific was False
