from fastapi.testclient import TestClient
from app.main import app

def test_cors_preflight_production_domain():
    client = TestClient(app)
    response = client.options(
        "/api/v1/importacion/upload-excel",
        headers={
            "Origin": "https://agenda.unitepc.pro",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://agenda.unitepc.pro"
    assert response.headers.get("access-control-allow-credentials") == "true"

def test_cors_preflight_unitepc_subdomains():
    client = TestClient(app)
    for origin in [
        "https://agenda.unitepc.pro",
        "http://agenda.unitepc.pro",
        "https://subdomain.unitepc.edu.bo",
        "http://localhost:3000",
    ]:
        response = client.options(
            "/api/v1/importacion/upload-excel",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type",
            },
        )
        assert response.status_code == 200, f"Failed for {origin}: {response.text}"
        assert response.headers.get("access-control-allow-origin") == origin
