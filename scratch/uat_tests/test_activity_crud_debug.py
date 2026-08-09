"""Debug script for activity CRUD modal."""
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:80"
EMAIL = "admin@unitepc.edu.bo"
PASSWORD = "admin123"


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
        print("Login OK")

        page.goto(f"{BASE_URL}/actividades")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="scratch/uat_tests/screenshot_activities_list.png", full_page=True)

        page.locator('[data-testid="new-activity-button"]').click()
        page.wait_for_selector("text=Nueva Actividad Científica")
        print("Modal opened")

        # Print available options for debugging
        gestion_options = page.locator('select[name="gestion_id"] option').all_inner_texts()
        print(f"Gestion options: {gestion_options}")
        career_options = page.locator('select[name="career_id"] option').all_inner_texts()
        print(f"Career options: {career_options}")
        activity_type_options = page.locator('select[name="activity_type"] option').all_inner_texts()
        print(f"Activity type options: {activity_type_options}")

        page.locator('input[name="title"]').fill("Actividad UAT Smoke")
        page.locator('select[name="activity_type"]').select_option("webinar")
        page.locator('input[name="start_date"]').fill("2026-08-15")
        page.locator('input[name="end_date"]').fill("2026-08-15")
        page.locator('input[name="responsible_name"]').fill("Responsable UAT")

        # Try label first, fallback to value/index
        try:
            page.locator('select[name="gestion_id"]').select_option(label="Gestión 2026")
        except Exception as e:
            print(f"Could not select gestion by label: {e}")
            if len(gestion_options) > 1:
                page.locator('select[name="gestion_id"]').select_option(index=1)

        if len(career_options) > 1 and career_options[0].strip() in ("", "Seleccione..."):
            page.locator('select[name="career_id"]').select_option(index=1)

        page.screenshot(path="scratch/uat_tests/screenshot_modal_filled.png", full_page=True)

        page.locator('[data-testid="activity-save-button"]').click()
        page.wait_for_timeout(3000)
        page.screenshot(path="scratch/uat_tests/screenshot_modal_after_save.png", full_page=True)

        print("\n--- Console logs ---")
        for log in console_logs:
            print(log)

        browser.close()


if __name__ == "__main__":
    run()
