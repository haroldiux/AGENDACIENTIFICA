"""Excel import flow tests."""
import pytest
import requests
from playwright.sync_api import Page, expect

from e2e.helpers import login


def _api_login(email: str, password: str = "password") -> str:
    response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


@pytest.mark.e2e
def test_download_template_and_import_academic_activity(page: Page, tmp_path, base_url):
    login(page, "admin@unitepc.edu.bo")
    page.goto("/importar")

    # Download the template directly from the API (cross-origin <a download> is unreliable)
    token = _api_login("admin@unitepc.edu.bo")
    template_path = tmp_path / "plantilla.xlsx"
    response = requests.get(
        "http://localhost:8000/api/v1/importacion/template/download",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    template_path.write_bytes(response.content)
    assert template_path.stat().st_size > 0

    # Upload it back
    page.locator('input[type="file"]').set_input_files(str(template_path))
    page.locator('button:has-text("Confirmar Importación")').click()

    # Wait for processing and success feedback
    expect(page.locator("text=importadas")).to_be_visible(timeout=15000)
