"""UAT for the "Test Telegram bot" button in profile page."""
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:80"
EMAIL = "haroldiux.18@gmail.com"
PASSWORD = "admin123"


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(f"{BASE_URL}/login")
        page.locator('input[type="email"]').fill(EMAIL)
        page.locator('input[type="password"]').fill(PASSWORD)
        page.locator('button[type="submit"]').click()
        page.wait_for_url("**/")

        page.goto(f"{BASE_URL}/perfil")
        page.wait_for_load_state("networkidle")

        # Verify chat ID is loaded
        chat_input = page.locator('input#telegram_chat_id')
        chat_id = chat_input.input_value()
        print(f"Telegram Chat ID configured: {chat_id}")
        assert chat_id.strip() != "", "Chat ID not configured"

        # Click test bot button
        page.locator("button:has-text('Probar bot de Telegram')").click()

        # Wait for toast success
        expect(page.locator("text=Mensaje de prueba enviado por Telegram")).to_be_visible(timeout=10000)
        print("[OK] Test Telegram message sent from UI")

        browser.close()


if __name__ == "__main__":
    run()
