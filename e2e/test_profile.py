"""Profile page and read-only contact display tests."""
import pytest
from playwright.sync_api import Page, expect

from e2e.helpers import login


@pytest.mark.e2e
def test_profile_page_loads_and_saves_full_name(page: Page):
    login(page, "jefe.sistemas@unitepc.edu.bo")
    page.goto("/perfil")

    expect(page.locator("text=Mi Perfil")).to_be_visible()
    expect(page.locator("text=Datos de Cuenta y Contacto (Solo Lectura)")).to_be_visible()

    # full_name input is present
    expect(page.locator("input#full_name")).to_be_visible()

    # Contact inputs should not exist on /perfil
    assert page.locator("input#phone_number").count() == 0
    assert page.locator("input#telegram_chat_id").count() == 0

    # Save full_name
    page.locator("input#full_name").fill("Jefe de Sistemas Updated")
    page.locator('button:has-text("Guardar cambios")').click()

    expect(page.locator("text=Perfil actualizado correctamente")).to_be_visible()


@pytest.mark.e2e
def test_profile_page_navigates_to_notification_settings(page: Page):
    login(page, "jefe.sistemas@unitepc.edu.bo")
    page.goto("/perfil")

    page.locator('a:has-text("Administrar canales y notificaciones")').first.click()
    page.wait_for_url("**/configuracion/notificaciones")
    expect(page.locator("text=Preferencias de Notificación")).to_be_visible()

