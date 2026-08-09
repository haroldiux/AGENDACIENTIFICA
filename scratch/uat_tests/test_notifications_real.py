"""Real notification test for coordinator role via WhatsApp (wa.me)."""
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:80"
EMAIL = "haroldiux.18@gmail.com"
PASSWORD = "admin123"
EXPECTED_PHONE = "59178311416"


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_logs.append(f"[PAGE ERROR] {err}"))

        page.goto(f"{BASE_URL}/login")
        page.locator('input[type="email"]').fill(EMAIL)
        page.locator('input[type="password"]').fill(PASSWORD)
        page.locator('button[type="submit"]').click()
        page.wait_for_url("**/")
        print("Login as coordinator: OK")

        page.goto(f"{BASE_URL}/perfil")
        page.wait_for_load_state("networkidle")

        # Verify phone number is loaded
        phone_value = page.locator('input#phone_number').input_value()
        print(f"Phone configured: {phone_value}")
        assert "78311416" in phone_value, "WhatsApp number not loaded"

        # Verify weekly activities are shown
        summary_text = page.locator("text=Actividades próximas").first.inner_text()
        print(f"Summary section: {summary_text}")

        # Override window.open to capture the wa.me URL without actually opening WhatsApp
        page.evaluate("""
            window._capturedUrls = [];
            window.open = function(url, target, features) {
                window._capturedUrls.push(url);
                return null;
            };
        """)

        # Click send WhatsApp summary
        page.locator("button:has-text('Enviar resumen a mi WhatsApp')").click()
        page.wait_for_timeout(1500)

        captured = page.evaluate("() => window._capturedUrls")
        print(f"Captured URLs: {captured}")

        found = False
        for url in captured:
            if url and f"wa.me/{EXPECTED_PHONE}" in url:
                found = True
                print(f"[OK] WhatsApp wa.me URL generated correctly")
                print(f"URL preview: {url[:200]}")
                break

        if not found:
            print("[FAIL] wa.me URL was not generated for the expected phone.")
            print("Console logs:")
            for log in console_logs:
                print(log)
            raise AssertionError("WhatsApp notification URL not generated")

        browser.close()


if __name__ == "__main__":
    run()
