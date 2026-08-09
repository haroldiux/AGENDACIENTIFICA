"""Smoke UAT for core UI flows against the running Docker stack."""
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:80"
EMAIL = "admin@unitepc.edu.bo"
PASSWORD = "admin123"


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Login
        page.goto(f"{BASE_URL}/login")
        page.locator('input[type="email"]').fill(EMAIL)
        page.locator('input[type="password"]').fill(PASSWORD)
        page.locator('button[type="submit"]').click()
        page.wait_for_url("**/")
        expect(page.locator("text=Dashboard")).to_be_visible()
        print("Login -> Dashboard: OK")

        # Navigate through sidebar
        page.locator('a[href="/actividades"]').click()
        page.wait_for_url("**/actividades")
        expect(page.locator('h2:has-text("Actividades Científicas")')).to_be_visible()
        print("Sidebar -> Actividades: OK")

        page.locator('a[href="/calendario"]').click()
        page.wait_for_url("**/calendario")
        expect(page.locator('h2:has-text("Calendario Fusionado")')).to_be_visible()
        print("Sidebar -> Calendario: OK")

        page.get_by_role("link", name="Mi Perfil").click()
        page.wait_for_url("**/perfil")
        expect(page.locator("text=Información de contacto")).to_be_visible()
        print("Sidebar -> Mi Perfil: OK")

        # Logout
        page.locator('button:has-text("Cerrar Sesión")').click()
        page.wait_for_url("**/login")
        print("Logout: OK")

        browser.close()
        print("\n[OK] Core UI smoke test passed")


if __name__ == "__main__":
    run()
