"""Profile page and notification channel tests."""
import pytest
from playwright.sync_api import Page, expect

from e2e.helpers import login


@pytest.mark.e2e
def test_profile_page_loads_and_saves_contact_data(page: Page):
    login(page, "jefe.sistemas@unitepc.edu.bo")
    page.goto("/perfil")

    expect(page.locator("text=Mi Perfil")).to_be_visible()
    expect(page.locator("text=Información de contacto")).to_be_visible()

    page.locator('input#phone_number').fill("+59178311416")
    page.locator('input#telegram_chat_id').fill("123456789")
    page.locator('button:has-text("Guardar cambios")').click()

    expect(page.locator("text=Perfil actualizado correctamente")).to_be_visible()

    # Reload and assert persistence
    page.reload()
    expect(page.locator('input#phone_number')).to_have_value("+59178311416")
    expect(page.locator('input#telegram_chat_id')).to_have_value("123456789")


@pytest.mark.e2e
def test_whatsapp_summary_button_opens_wa_me(page: Page, context):
    login(page, "jefe.sistemas@unitepc.edu.bo")
    page.goto("/perfil")

    page.locator('input#phone_number').fill("+59178311416")
    page.locator('button:has-text("Guardar cambios")').click()
    expect(page.locator("text=Perfil actualizado correctamente")).to_be_visible()

    # Expect a new tab/popup to wa.me
    with page.expect_popup() as popup_info:
        page.locator('button:has-text("Enviar resumen a mi WhatsApp")').click()

    popup = popup_info.value
    popup.wait_for_load_state()
    assert "wa.me/59178311416" in popup.url
    popup.close()


@pytest.mark.e2e
def test_dashboard_shows_profile_completion_banner(page: Page):
    login(page, "lectura@unitepc.edu.bo")
    page.goto("/")
    expect(page.locator("text=Completá tus datos de contacto")).to_be_visible()
    page.locator("text=Ir a perfil").click()
    page.wait_for_url("**/perfil")
