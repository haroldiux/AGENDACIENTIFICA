"""UAT for role-based access to core features."""
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:80"
PASSWORD = "admin123"

ROLES = [
    {"email": "vicerrectorado@unitepc.edu.bo", "name": "Vicerrectorado"},
    {"email": "investigacion@unitepc.edu.bo", "name": "Director de Investigación"},
    {"email": "haroldiux.18@gmail.com", "name": "Coordinador de Carrera"},
    {"email": "jefe.sistemas@unitepc.edu.bo", "name": "Jefe de Investigación Carrera"},
]


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for role in ROLES:
            context = browser.new_context()
            page = context.new_page()
            page.goto(f"{BASE_URL}/login")
            page.locator('input[type="email"]').fill(role["email"])
            page.locator('input[type="password"]').fill(PASSWORD)
            page.locator('button[type="submit"]').click()
            page.wait_for_url("**/")

            # Dashboard loads
            expect(page.locator("h2", has_text="Dashboard")).to_be_visible()
            print(f"[{role['name']}] Login OK")

            # Calendario page loads
            page.goto(f"{BASE_URL}/calendario")
            page.wait_for_load_state("networkidle")
            expect(page.locator("text=Calendario Fusionado")).to_be_visible()
            print(f"[{role['name']}] Calendario OK")

            # Actividades page loads
            page.goto(f"{BASE_URL}/actividades")
            page.wait_for_load_state("networkidle")
            expect(page.locator("text=Actividades Científicas")).to_be_visible()
            print(f"[{role['name']}] Actividades OK")

            # Perfil page loads
            page.goto(f"{BASE_URL}/perfil")
            page.wait_for_load_state("networkidle")
            expect(page.locator("h2", has_text="Mi Perfil")).to_be_visible()
            print(f"[{role['name']}] Perfil OK")

            context.close()

        browser.close()
        print("\n[OK] Role access UAT passed")


if __name__ == "__main__":
    run()
