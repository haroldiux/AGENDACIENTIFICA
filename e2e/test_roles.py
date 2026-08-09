"""Role-based access control smoke tests from the UI perspective."""
import pytest
from playwright.sync_api import Page, expect

from e2e.helpers import login, logout, open_create_activity, fill_activity_form, save_activity_form


@pytest.mark.e2e
def test_coordinator_cannot_select_other_career(page: Page):
    login(page, "coordinador.sistemas@unitepc.edu.bo")
    open_create_activity(page)

    options = page.locator('select[name="career_id"] option').all_inner_texts()
    assert "Ingeniería de Sistemas" in options
    assert "Medicina" not in options


@pytest.mark.e2e
def test_jefe_investigacion_no_global_toggle(page: Page):
    login(page, "jefe.medicina@unitepc.edu.bo")
    open_create_activity(page)
    expect(page.locator("text=Es actividad global / institucional")).not_to_be_visible()


@pytest.mark.e2e
def test_career_scoped_user_cannot_edit_other_career_activity(page: Page):
    # Global user creates a Medicine activity
    login(page, "director.investigacion@unitepc.edu.bo")
    open_create_activity(page)
    fill_activity_form(
        page,
        title="Actividad Medicina Protegida E2E",
        activity_type="webinar",
        start_date="2026-10-10",
        end_date="2026-10-10",
        career_label="Medicina",
    )
    save_activity_form(page)
    expect(page.locator("text=Actividad creada exitosamente")).to_be_visible()

    # Systems coordinator should not see an edit button for Medicine activity
    logout(page)
    login(page, "coordinador.sistemas@unitepc.edu.bo")
    page.goto("/actividades")
    expect(page.locator("text=Actividad Medicina Protegida E2E")).to_be_visible()
    row = page.locator("tr", has_text="Actividad Medicina Protegida E2E").first
    expect(row.locator("button:has-text('Editar')")).not_to_be_visible()


@pytest.mark.e2e
def test_read_only_user_cannot_create_or_edit_activity(page: Page):
    # Global user creates an activity that the read-only user will attempt to edit
    login(page, "director.investigacion@unitepc.edu.bo")
    open_create_activity(page)
    fill_activity_form(
        page,
        title="Actividad Lectura E2E",
        activity_type="webinar",
        start_date="2026-11-11",
        end_date="2026-11-11",
        career_label="Medicina",
    )
    save_activity_form(page)
    expect(page.locator("text=Actividad creada exitosamente")).to_be_visible()

    # Read-only user can view the activity but cannot create or edit
    logout(page)
    login(page, "lectura@unitepc.edu.bo")
    page.goto("/actividades")

    # Creation controls are hidden
    expect(page.locator('[data-testid="new-activity-button"]')).not_to_be_visible()
    expect(page.locator("button:has-text('Importar Excel')")).not_to_be_visible()

    # Existing activity row shows read-only indicator and no edit button
    expect(page.locator("text=Actividad Lectura E2E")).to_be_visible()
    row = page.locator("tr", has_text="Actividad Lectura E2E").first
    expect(row.locator("button:has-text('Editar')")).not_to_be_visible()
    expect(row.locator("text=Solo lectura")).to_be_visible()
