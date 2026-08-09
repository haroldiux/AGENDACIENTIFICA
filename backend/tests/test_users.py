from app.api.deps import get_current_active_user
from app.main import app
from app.models.models import RoleEnum, User


def _make_user(role: RoleEnum = RoleEnum.teacher) -> User:
    return User(
        id=1,
        email="me@example.com",
        hashed_password="hashed_pw",
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
