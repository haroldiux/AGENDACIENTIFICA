from app.api.deps import get_current_active_user
from app.main import app
from app.models.models import RoleEnum, User
from app.core.security import get_password_hash, verify_password


def _make_user(role: RoleEnum = RoleEnum.teacher) -> User:
    return User(
        id=1,
        email="me@example.com",
        hashed_password=get_password_hash("oldpassword123"),
        full_name="Me User",
        role=role,
        is_active=True,
    )


def test_read_user_me(client):
    user = _make_user()
    app.dependency_overrides[get_current_active_user] = lambda: user
    try:
        response = client.get("/api/v1/users/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "me@example.com"
        assert data["full_name"] == "Me User"
    finally:
        app.dependency_overrides.clear()


def test_update_user_me(client):
    user = _make_user()
    app.dependency_overrides[get_current_active_user] = lambda: user
    try:
        response = client.patch(
            "/api/v1/users/me",
            json={
                "full_name": "Updated Name",
                "phone_number": "+59178311416",
                "telegram_chat_id": "123456789",
                "email": "updated@example.com",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"
        assert data["phone_number"] == "+59178311416"
        assert data["telegram_chat_id"] == "123456789"
        assert data["email"] == "updated@example.com"
    finally:
        app.dependency_overrides.clear()


def test_update_user_me_partial(client):
    user = _make_user()
    app.dependency_overrides[get_current_active_user] = lambda: user
    try:
        response = client.patch(
            "/api/v1/users/me",
            json={"telegram_chat_id": "987654321"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["telegram_chat_id"] == "987654321"
        # other fields remain unchanged
        assert data["full_name"] == "Me User"
    finally:
        app.dependency_overrides.clear()


def test_change_my_password_success(client, db_session):
    user = User(
        email="changepwd@example.com",
        hashed_password=get_password_hash("actualpass123"),
        full_name="Change Pass User",
        role=RoleEnum.teacher,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: user
    try:
        response = client.post(
            "/api/v1/users/me/change-password",
            json={
                "current_password": "actualpass123",
                "new_password": "newsecurepass456",
            },
        )
        assert response.status_code == 200
        assert verify_password("newsecurepass456", user.hashed_password) is True
    finally:
        app.dependency_overrides.clear()


def test_change_my_password_wrong_current(client, db_session):
    user = User(
        email="wrongpwd@example.com",
        hashed_password=get_password_hash("correctpass123"),
        full_name="Wrong Pass User",
        role=RoleEnum.teacher,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: user
    try:
        response = client.post(
            "/api/v1/users/me/change-password",
            json={
                "current_password": "wrongpassword!",
                "new_password": "newsecurepass456",
            },
        )
        assert response.status_code == 400
        assert "no es correcta" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()


def test_change_my_password_too_short(client, db_session):
    user = User(
        email="shortpwd@example.com",
        hashed_password=get_password_hash("correctpass123"),
        full_name="Short Pass User",
        role=RoleEnum.teacher,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: user
    try:
        response = client.post(
            "/api/v1/users/me/change-password",
            json={
                "current_password": "correctpass123",
                "new_password": "123",
            },
        )
        assert response.status_code == 400
        assert "al menos 6 caracteres" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()
