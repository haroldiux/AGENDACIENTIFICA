"""Authentication and route guard tests."""
import pytest
from playwright.sync_api import Page, expect

from e2e.helpers import login, logout


@pytest.mark.e2e
@pytest.mark.parametrize("email", [
    "admin@unitepc.edu.bo",
    "vicerrectorado@unitepc.edu.bo",
    "director.investigacion@unitepc.edu.bo",
    "jefe.sistemas@unitepc.edu.bo",
    "coordinador.sistemas@unitepc.edu.bo",
    "lectura@unitepc.edu.bo",
])
def test_login_for_each_role(page: Page, email: str):
    login(page, email)
    # Dashboard greeting should show the user's name/role
    expect(page.locator("body")).to_contain_text("Agenda Científica")
    logout(page)


@pytest.mark.e2e
def test_unauthenticated_user_is_redirected_to_login(page: Page):
    page.goto("/actividades")
    page.wait_for_url("**/login")
    expect(page.locator('button[type="submit"]')).to_contain_text("Iniciar Sesión")


@pytest.mark.e2e
def test_authenticated_user_redirected_away_from_login(page: Page):
    login(page, "admin@unitepc.edu.bo")
    page.goto("/login")
    page.wait_for_url("**/")
