import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.auth import User
from app.schemas.auth import Token, UserLogin

client = TestClient(app)

# --- Unit Tests ---

def test_user_login_schema():
    schema = UserLogin(username="testuser", password="password")
    assert schema.username == "testuser"
    assert schema.password == "password"

def test_token_schema():
    token = Token(access_token="abc", token_type="bearer")
    assert token.access_token == "abc"
    assert token.token_type == "bearer"

def test_user_model():
    user = User(id=1, username="testuser", hashed_password="hashedpassword", is_active=True, role="ADMIN")
    assert user.id == 1
    assert user.username == "testuser"
    assert user.role == "ADMIN"
    assert user.is_active is True

# --- API Integration Tests ---

def test_auth_login(monkeypatch):
    # Mocking authenticate_user and create_access_token
    from app.api.v1.auth import authenticate_user, create_access_token
    monkeypatch.setattr("app.api.v1.auth.authenticate_user", lambda db, username, password: User(id=1, username="testuser", hashed_password="pw", is_active=True, role="ADMIN"))
    monkeypatch.setattr("app.api.v1.auth.create_access_token", lambda data, expires_delta: "mocked_token")
    
    response = client.post("/api/v1/auth/login", data={"username": "testuser", "password": "password"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_read_careers(monkeypatch):
    # Mock auth dependency
    from app.api.v1.deps import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: User(id=1, username="testuser", hashed_password="pw", is_active=True, role="ADMIN")
    
    monkeypatch.setattr("app.api.v1.careers.get_careers", lambda db, skip, limit: [{"id": 1, "name": "Ingenieria de Sistemas", "code": "SIS", "description": "Sistemas", "status": True}])
    
    response = client.get("/api/v1/careers/")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    app.dependency_overrides.clear()

def test_read_academic_data(monkeypatch):
    from app.api.v1.deps import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: User(id=1, username="testuser", hashed_password="pw", is_active=True, role="ADMIN")
    
    monkeypatch.setattr("app.api.v1.academic.get_academic_metrics", lambda db, career_id, gestion_id: [{"id": 1, "student_count": 100, "graduate_count": 50, "dropout_rate": 5.0, "career_id": 1, "gestion_id": 1}])
    
    response = client.get("/api/v1/academic/?career_id=1&gestion_id=1")
    assert response.status_code == 200
    
    app.dependency_overrides.clear()

def test_read_scientific_data(monkeypatch):
    from app.api.v1.deps import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: User(id=1, username="testuser", hashed_password="pw", is_active=True, role="ADMIN")
    
    monkeypatch.setattr("app.api.v1.scientific.get_scientific_metrics", lambda db, career_id, gestion_id: [{"id": 1, "publication_count": 10, "project_count": 5, "career_id": 1, "gestion_id": 1}])
    
    response = client.get("/api/v1/scientific/?career_id=1&gestion_id=1")
    assert response.status_code == 200
    
    app.dependency_overrides.clear()

def test_get_fused_data(monkeypatch):
    from app.api.v1.deps import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: User(id=1, username="testuser", hashed_password="pw", is_active=True, role="ADMIN")
    
    monkeypatch.setattr("app.api.v1.academic.get_academic_metrics", lambda db, career_id, gestion_id: [{"id": 1, "student_count": 100, "graduate_count": 50, "dropout_rate": 5.0, "career_id": 1, "gestion_id": 1}])
    monkeypatch.setattr("app.api.v1.scientific.get_scientific_metrics", lambda db, career_id, gestion_id: [{"id": 1, "publication_count": 10, "project_count": 5, "career_id": 1, "gestion_id": 1}])
    
    response = client.get("/api/v1/fusion/fuse?career_id=1&gestion_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "academic" in data
    assert "scientific" in data
    
    app.dependency_overrides.clear()
