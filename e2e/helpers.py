"""Reusable UI helpers for the E2E suite."""
from __future__ import annotations

from playwright.sync_api import Page, expect


def login(page: Page, email: str, password: str = "password"):
    """Log in through the UI and wait for the dashboard."""
    page.goto("/login")
    page.locator('input[type="email"]').fill(email)
    page.locator('input[type="password"]').fill(password)
    page.locator('button[type="submit"]').click()
    page.wait_for_url("**/")
    # Give the dashboard a moment to render
    expect(page.locator("body")).to_contain_text("Agenda Científica")


def logout(page: Page):
    """Click the sidebar logout button and wait for the login page."""
    page.locator('button:has-text("Cerrar sesión")').click()
    page.wait_for_url("**/login")


def open_create_activity(page: Page):
    page.goto("/actividades")
    page.locator('[data-testid="new-activity-button"]').click()
    expect(page.locator("text=Nueva Actividad Científica")).to_be_visible()


def fill_activity_form(
    page: Page,
    title: str,
    activity_type: str,
    start_date: str,
    end_date: str,
    gestion_label: str = "2026",
    career_label: str | None = None,
    responsible: str = "Responsable E2E",
    status: str | None = None,
):
    page.locator('input[name="title"]').fill(title)
    page.locator('select[name="activity_type"]').select_option(activity_type)
    page.locator('input[name="start_date"]').fill(start_date)
    page.locator('input[name="end_date"]').fill(end_date)

    if career_label:
        career_select = page.locator('select[name="career_id"]')
        # Only select if the field is not disabled (career-scoped single career is locked)
        if not career_select.is_disabled():
            career_select.select_option(label=career_label)

    page.locator('select[name="gestion_id"]').select_option(label=gestion_label)
    page.locator('input[name="responsible_name"]').fill(responsible)

    if status:
        page.locator('select[name="status"]').select_option(status)


def save_activity_form(page: Page):
    page.locator('[data-testid="activity-save-button"]').click()


def get_toast_message(page: Page) -> str:
    toast = page.locator("[role='status']").first
    return toast.inner_text() if toast.count() else ""
