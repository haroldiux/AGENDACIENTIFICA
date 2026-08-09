import pytest
import requests
from playwright.sync_api import Page, expect

BASE_URL = "http://localhost:3001"
API_URL = "http://localhost:8000/api/v1"

@pytest.fixture(autouse=True, scope="session")
def seed_test_users():
    users = [
        {"email": "admin2@unitepc.edu.bo", "role": "admin", "password": "password", "full_name": "Admin"},
        {"email": "teacher2@unitepc.edu.bo", "role": "teacher", "password": "password", "full_name": "Teacher"},
    ]
    for u in users:
        resp = requests.post(f"{API_URL}/users/", json=u)
        assert resp.status_code == 200 or resp.status_code == 400, f"Failed to create user: {resp.text}"
        print(f"Created/tried to create {u['email']}: {resp.status_code} {resp.text}")

def login(page: Page, email: str):
    page.goto(BASE_URL + "/login")
    page.locator('input[type="email"]').fill(email)
    page.locator('input[type="password"]').fill("password")
    with page.expect_response("**/api/v1/auth/login") as response_info:
        page.locator('button[type="submit"]').click()
    
    assert response_info.value.ok, f"Login failed for {email}"
    # Wait for navigation to dashboard
    page.wait_for_url("**/")

def test_teacher_crud_academic_activity(page: Page):
    login(page, "teacher2@unitepc.edu.bo")
    
    # Create Activity
    page.goto(BASE_URL + "/actividades")
    page.locator("text=Nueva Actividad").click()
    page.locator('input[name="title"]').fill("Clase Especial E2E")
    page.locator('input[name="start_date"]').fill("2026-06-01")
    page.locator('input[name="end_date"]').fill("2026-06-01")
    page.locator('select[name="activity_type"]').select_option("webinar")
    # if responsible_name exists, fill it
    resp_input = page.locator('input[name="responsible_name"]')
    if resp_input.count() > 0:
        resp_input.fill("Teacher")
    with page.expect_response("**/api/v1/scientific*") as response_info:
        page.locator('button:has-text("Guardar")').click()
    
    assert response_info.value.ok, f"Failed to save activity: {response_info.value.text()}"
    expect(page.locator("text=Clase Especial E2E")).to_be_visible()

    # Edit Activity
    row = page.locator('tr', has_text="Clase Especial E2E").first
    row.locator('button:has-text("Editar")').click()
    page.locator('input[name="title"]').fill("Clase Especial E2E Editada")
    page.locator('button:has-text("Guardar")').click()
    
    expect(page.locator("text=Clase Especial E2E Editada")).to_be_visible()

    # Delete Activity
    row = page.locator('tr', has_text="Clase Especial E2E Editada").first
    page.on('dialog', lambda dialog: dialog.accept()) # Accept the JS confirmation
    row.locator('button:has-text("Eliminar")').click()
    
    expect(page.locator("text=Clase Especial E2E Editada")).not_to_be_visible()

def test_admin_crud_category(page: Page):
    login(page, "admin2@unitepc.edu.bo")
    
    # Create Category
    page.goto(BASE_URL + "/configuracion/categorias")
    page.locator("text=Nueva Categoría").click()
    page.get_by_placeholder("Ej: Simposio Internacional").fill("Categoría E2E")
    page.get_by_placeholder("Ej: SIMPOSIO", exact=True).fill("E2E")
    with page.expect_response("**/api/v1/categories*") as response_info:
        page.locator('button:has-text("Guardar Categoría")').click()
        
    assert response_info.value.ok, f"Failed to save category: {response_info.value.text()}"
    
    expect(page.locator("text=Categoría E2E")).to_be_visible()

    # Disable/Delete Category
    row = page.locator('tr', has_text="Categoría E2E").first
    row.locator('button:has-text("Desactivar")').click()
    
    expect(page.locator("text=Categoría E2E desactivada")).to_be_visible() # Check for the toast
    # Wait until it's deactivated
    expect(row.locator('text=Inactiva')).to_be_visible()
