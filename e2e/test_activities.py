"""CRUD, status changes, and evidence flows for scientific activities."""
import pytest
from playwright.sync_api import Page, expect

from e2e.helpers import login, open_create_activity, fill_activity_form, save_activity_form


@pytest.mark.e2e
def test_create_and_delete_scientific_activity(page: Page):
    login(page, "jefe.sistemas@unitepc.edu.bo")
    open_create_activity(page)

    fill_activity_form(
        page,
        title="Actividad E2E Sistemas",
        activity_type="webinar",
        start_date="2026-06-15",
        end_date="2026-06-15",
        career_label="Ingeniería de Sistemas",
    )
    save_activity_form(page)

    expect(page.locator("text=Actividad creada exitosamente")).to_be_visible()
    expect(page.locator("text=Actividad E2E Sistemas")).to_be_visible()

    # Delete it
    page.on("dialog", lambda dialog: dialog.accept())
    row = page.locator("tr", has_text="Actividad E2E Sistemas").first
    row.locator("button:has-text('Eliminar')").click()
    expect(page.locator("text=Actividad E2E Sistemas")).not_to_be_visible()


@pytest.mark.e2e
def test_career_scoped_role_cannot_see_global_toggle(page: Page):
    login(page, "coordinador.sistemas@unitepc.edu.bo")
    open_create_activity(page)
    expect(page.locator("text=Es actividad global / institucional")).not_to_be_visible()


@pytest.mark.e2e
def test_global_role_can_create_global_activity(page: Page):
    login(page, "vicerrectorado@unitepc.edu.bo")
    open_create_activity(page)

    # Global toggle should be visible
    expect(page.locator("text=Es actividad global / institucional")).to_be_visible()
    page.locator("input#is_global_toggle").check()

    fill_activity_form(
        page,
        title="Actividad Global E2E",
        activity_type="congreso",
        start_date="2026-07-01",
        end_date="2026-07-02",
    )
    save_activity_form(page)

    expect(page.locator("text=Actividad creada exitosamente")).to_be_visible()
    expect(page.locator("text=Actividad Global E2E")).to_be_visible()


@pytest.mark.e2e
def test_change_activity_status(page: Page):
    login(page, "jefe.sistemas@unitepc.edu.bo")
    open_create_activity(page)
    fill_activity_form(
        page,
        title="Actividad Estado E2E",
        activity_type="feria",
        start_date="2026-08-10",
        end_date="2026-08-10",
        career_label="Ingeniería de Sistemas",
    )
    save_activity_form(page)

    row = page.locator("tr", has_text="Actividad Estado E2E").first
    row.locator("button:has-text('Editar')").click()

    page.locator('select[name="status"]').select_option("completed")
    save_activity_form(page)

    expect(page.locator("text=Actividad actualizada exitosamente")).to_be_visible()
    row = page.locator("tr", has_text="Actividad Estado E2E").first
    expect(row).to_contain_text("Completada")


@pytest.mark.e2e
def test_upload_evidence_to_activity(page: Page, tmp_path):
    login(page, "jefe.sistemas@unitepc.edu.bo")
    open_create_activity(page)
    fill_activity_form(
        page,
        title="Actividad Evidencia E2E",
        activity_type="defensa",
        start_date="2026-09-01",
        end_date="2026-09-01",
        career_label="Ingeniería de Sistemas",
    )
    save_activity_form(page)

    row = page.locator("tr", has_text="Actividad Evidencia E2E").first
    row.locator("button:has-text('Editar')").click()

    evidence_file = tmp_path / "evidencia.pdf"
    evidence_file.write_text("contenido de prueba para evidencia")

    with page.expect_response("**/api/v1/scientific/*/evidence") as response_info:
        page.locator('input[type="file"]').set_input_files(str(evidence_file))

    assert response_info.value.ok, f"Evidence upload failed: {response_info.value.text()}"
    expect(page.locator("text=Evidencia adjuntada exitosamente")).to_be_visible()
    expect(page.locator("text=evidencia.pdf")).to_be_visible()
