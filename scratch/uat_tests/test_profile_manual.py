"""Manual UAT for the profile / notification flow."""
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
EMAIL = "admin@unitepc.edu.bo"
PASSWORD = "admin123"


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print(f"Opening {BASE_URL}/login")
        page.goto(f"{BASE_URL}/login")
        page.locator('input[type="email"]').fill(EMAIL)
        page.locator('input[type="password"]').fill(PASSWORD)
        page.locator('button[type="submit"]').click()
        page.wait_for_url("**/")
        print("Login successful")

        page.goto(f"{BASE_URL}/perfil")
        page.wait_for_selector("text=Mi Perfil")
        print("Profile page loaded")

        # Verify full_name is present and editable
        assert page.locator("input#full_name").is_visible()
        assert page.locator("input#phone_number").count() == 0
        assert page.locator("input#telegram_chat_id").count() == 0

        # Save full_name
        page.locator("input#full_name").fill("Administrador General")
        page.locator("button:has-text('Guardar cambios')").click()
        page.wait_for_selector("text=Perfil actualizado correctamente")
        print("Profile full_name updated")

        # Test CTA navigation
        page.locator("a:has-text('Administrar canales y notificaciones')").first.click()
        page.wait_for_url("**/configuracion/notificaciones")
        print("Navigated to notification preferences page")

        browser.close()
        print("\n[OK] Profile read-only flow UAT passed")


if __name__ == "__main__":
    run()

