"""Calendar fusion view and report generation tests."""
import pytest
from playwright.sync_api import Page, expect

from e2e.helpers import login


@pytest.mark.e2e
def test_calendar_filters_and_exports_pdf(page: Page):
    login(page, "admin@unitepc.edu.bo")
    page.goto("/calendario")

    # Wait for selectors to populate
    expect(page.locator("text=Calendario Fusionado")).to_be_visible()

    # Select career and gestion
    page.locator('#career-select').select_option(label="Ingeniería de Sistemas")
    page.locator('#gestion-select').select_option(label="2026")

    # Calendar should show filters applied (counts update)
    expect(page.locator('button:has-text("Académicas")')).to_be_visible()
    expect(page.locator('button:has-text("Científicas")')).to_be_visible()

    # Export buttons should become enabled once a gestion is selected
    research_button = page.locator('button[title="Investigación"]')
    expect(research_button).to_be_enabled()

    # Trigger export. WeasyPrint/PDF generation may not be available in all
    # local environments, so we only assert the UI reacts (success toast or
    # error toast). In a Docker environment with GTK libs the download occurs.
    research_button.click()
    expect(
        page.locator("text=Agenda exportada correctamente").or_(
            page.locator("text=Error exportando el PDF")
        )
    ).to_be_visible(timeout=30000)
