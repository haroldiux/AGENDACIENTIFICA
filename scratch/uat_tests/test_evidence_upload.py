"""UAT for uploading evidence to a scientific activity."""
from playwright.sync_api import sync_playwright, expect
from datetime import datetime
import os

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

        unique_title = f"Actividad Evidencia UAT {datetime.now().strftime('%Y%m%d%H%M%S')}"

        page.locator('[data-testid="new-activity-button"]').click()
        expect(page.locator("text=Nueva Actividad Científica")).to_be_visible()
        # Wait for the async career/gestion/category fetch to complete
        page.wait_for_timeout(1500)

        page.locator('select[name="activity_type"]').wait_for(state="visible")
        assert page.locator('select[name="activity_type"] option').count() > 1
        assert page.locator('select[name="career_id"] option').count() > 1
        assert page.locator('select[name="gestion_id"] option').count() > 1
        page.locator('input[name="title"]').fill(unique_title)
        page.locator('select[name="activity_type"]').select_option("webinar")
        page.locator('input[name="start_date"]').fill("2026-08-20")
        page.locator('input[name="end_date"]').fill("2026-08-20")
        page.locator('input[name="responsible_name"]').fill("Responsable Evidencia")
        page.locator('select[name="career_id"]').select_option(index=1)
        page.locator('select[name="gestion_id"]').select_option(label="Gestión 2026")
        page.locator('[data-testid="activity-save-button"]').click()

        expect(page.locator("text=Nueva Actividad Científica")).not_to_be_visible()
        expect(page.locator("tr", has_text=unique_title).first).to_be_visible()
        print("Create activity for evidence: OK")

        # Edit the activity to upload evidence
        row = page.locator("tr", has_text=unique_title).first
        row.locator("button:has-text('Editar')").click()
        page.wait_for_selector("text=Editar Actividad Científica")

        # Create a dummy PDF file
        dummy_pdf = "scratch/uat_tests/dummy_evidence.pdf"
        with open(dummy_pdf, "wb") as f:
            f.write(b"%PDF-1.4 dummy evidence content\n")

        # Upload file
        file_input = page.locator('input[type="file"]')
        file_input.set_input_files(dummy_pdf)

        # Wait for upload to complete and evidence to appear
        expect(page.locator("text=dummy_evidence.pdf")).to_be_visible(timeout=10000)
        print("Evidence upload: OK")

        # Verify download link exists
        download_link = page.locator("a[title='Descargar evidencia']")
        expect(download_link).to_be_visible()

        # Delete evidence
        page.locator("button[title='Eliminar evidencia']").click()
        expect(page.locator("text=dummy_evidence.pdf")).not_to_be_visible()
        print("Evidence delete: OK")

        # Close modal
        page.locator("button:has-text('Cancelar')").click()
        expect(page.locator("text=Editar Actividad Científica")).not_to_be_visible()

        # Cleanup activity
        page.on("dialog", lambda dialog: dialog.accept())
        row = page.locator("tr", has_text=unique_title).first
        row.locator("button:has-text('Eliminar')").click()
        expect(page.locator("tr", has_text=unique_title).first).not_to_be_visible()
        print("Cleanup activity: OK")

        browser.close()
        os.remove(dummy_pdf)
        print("\n[OK] Evidence upload UAT passed")


if __name__ == "__main__":
    run()
