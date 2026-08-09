"""Manual UAT for the profile / notification flow."""
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:80"
EMAIL = "admin@unitepc.edu.bo"
PASSWORD = "admin123"
PHONE = "+59178311416"


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

        # Fill and save contact data
        page.locator("input#phone_number").fill(PHONE)
        page.locator("input#telegram_chat_id").fill("123456789")
        page.locator("button:has-text('Guardar cambios')").click()
        page.wait_for_selector("text=Perfil actualizado correctamente")
        print("Profile saved")

        # Give React time to settle after the toast / state update
        page.wait_for_timeout(1500)

        # Capture the wa.me URL by overriding window.open (headless Chromium
        # does not always create a navigable popup for external links).
        page.evaluate("""() => {
            window._openUrls = [];
            window.open = function(url) {
                window._openUrls.push(url);
                console.log("WINDOW_OPEN", url);
                return null;
            };
        }""")
        page.locator("button:has-text('Enviar resumen a mi WhatsApp')").click()
        page.wait_for_timeout(1500)
        urls = page.evaluate("() => window._openUrls")
        assert any("wa.me/59178311416" in u for u in urls), f"Expected wa.me URL, got: {urls}"
        print(f"WhatsApp wa.me URL generated: {urls[0][:80]}...")

        # Reload and assert persistence
        page.reload()
        page.wait_for_selector(f"input#phone_number[value='{PHONE}']")
        page.wait_for_selector("input#telegram_chat_id[value='123456789']")
        print("Contact data persisted after reload")

        # Go back to dashboard: banner should be gone now that phone is set
        page.goto(f"{BASE_URL}/")
        assert page.locator("text=Completá tus datos de contacto").count() == 0
        print("Dashboard banner not shown for complete profile")

        browser.close()
        print("\n[OK] Profile / WhatsApp flow UAT passed")


if __name__ == "__main__":
    run()
