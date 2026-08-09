"""Smoke UAT for creating, editing and deleting a scientific activity."""
from playwright.sync_api import sync_playwright, expect
from datetime import datetime

BASE_URL = "http://localhost:80"
EMAIL = "admin@unitepc.edu.bo"
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

        page.goto(f"{BASE_URL}/actividades")
        page.wait_for_load_state("networkidle")

        unique_title = f"Actividad UAT Smoke {datetime.now().strftime('%Y%m%d%H%M%S')}"

        page.locator('[data-testid="new-activity-button"]').click()
        expect(page.locator("text=Nueva Actividad Científica")).to_be_visible()
        # Wait for the async career/gestion/category fetch to complete
        page.wait_for_timeout(1500)

        # Wait for dynamic selects to populate before selecting values
        page.locator('select[name="activity_type"]').wait_for(state="visible")
        expect(page.locator('select[name="activity_type"] option')).to_have_count(7)
        assert page.locator('select[name="career_id"] option').count() > 1
        assert page.locator('select[name="gestion_id"] option').count() > 1

        page.locator('input[name="title"]').fill(unique_title)
        page.locator('select[name="activity_type"]').select_option("webinar")
        page.locator('input[name="start_date"]').fill("2026-08-15")
        page.locator('input[name="end_date"]').fill("2026-08-15")
        page.locator('input[name="responsible_name"]').fill("Responsable UAT")
        # Explicitly select career and gestion so HTML5 validation passes
        page.locator('select[name="career_id"]').select_option(index=1)
        page.locator('select[name="gestion_id"]').select_option(label="Gestión 2026")

        page.locator('[data-testid="activity-save-button"]').click()

        # Wait for modal to close and the new row to appear instead of relying on toast text
        expect(page.locator("text=Nueva Actividad Científica")).not_to_be_visible()
        expect(page.locator("tr", has_text=unique_title).first).to_be_visible()
        print("Create activity: OK")

        # Edit status to completed
        row = page.locator("tr", has_text=unique_title).first
        row.locator("button:has-text('Editar')").click()
        page.wait_for_selector('select[name="status"]')
        page.locator('select[name="status"]').select_option("completed")
        page.locator('[data-testid="activity-save-button"]').click()
        expect(page.locator("text=Editar Actividad Científica")).not_to_be_visible()
        row = page.locator("tr", has_text=unique_title).first
        expect(row).to_contain_text("Completada")
        print("Edit activity status: OK")

        # Delete it
        page.on("dialog", lambda dialog: dialog.accept())
        row = page.locator("tr", has_text=unique_title).first
        row.locator("button:has-text('Eliminar')").click()
        expect(page.locator("tr", has_text=unique_title).first).not_to_be_visible()
        print("Delete activity: OK")

        browser.close()
        print("\n[OK] Activity CRUD smoke test passed")


if __name__ == "__main__":
    run()
