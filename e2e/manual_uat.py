"""Manual UAT walkthrough of AGENDACIENTIFICA UI.

Runs a realistic end-user journey for each role, capturing screenshots.
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

from playwright.sync_api import Page, expect, sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SCREENSHOTS = ROOT / "e2e" / "screenshots" / "manual_uat"
SCREENSHOTS.mkdir(parents=True, exist_ok=True)
EVIDENCE_FILE = ROOT / "e2e" / "fixtures" / "evidencia.pdf"

BASE_URL = "http://localhost:3002"
DEFAULT_PASSWORD = "password"

ROLES = [
    ("admin@unitepc.edu.bo", "Admin"),
    ("vicerrectorado@unitepc.edu.bo", "Vicerrectorado"),
    ("director.investigacion@unitepc.edu.bo", "Director_Investigacion"),
    ("jefe.sistemas@unitepc.edu.bo", "Jefe_Investigacion_Sistemas"),
    ("coordinador.sistemas@unitepc.edu.bo", "Coordinador_Sistemas"),
    ("lectura@unitepc.edu.bo", "Solo_Lectura"),
]


def shot(page: Page, name: str) -> None:
    page.screenshot(path=str(SCREENSHOTS / f"{name}.png"), full_page=True)


def login(page: Page, email: str) -> None:
    page.goto(f"{BASE_URL}/login")
    page.locator('input[type="email"]').fill(email)
    page.locator('input[type="password"]').fill(DEFAULT_PASSWORD)
    page.locator('button[type="submit"]').click()
    page.wait_for_url("**/")


def logout(page: Page) -> None:
    page.locator('button:has-text("Cerrar Sesi\u00f3n")').click()
    page.wait_for_url("**/login")


def verify_dashboard(page: Page, role_label: str) -> None:
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()
    expect(page.locator("text=Resumen de la gesti\u00f3n activa")).to_be_visible()
    shot(page, f"01_{role_label}_dashboard")


def verify_calendar(page: Page, role_label: str) -> None:
    page.goto(f"{BASE_URL}/calendario")
    expect(page.get_by_role("heading", name="Calendario Fusionado")).to_be_visible()
    page.locator('#career-select').select_option(label="Ingenier\u00eda de Sistemas")
    page.locator('#gestion-select').select_option(label="2026")
    page.wait_for_timeout(1000)
    shot(page, f"02_{role_label}_calendar_filtered")

    btn = page.locator('button[title="Investigaci\u00f3n"]')
    if btn.is_enabled():
        btn.click()
        expect(
            page.locator("text=Agenda exportada correctamente").or_(
                page.locator("text=Error exportando el PDF")
            )
        ).to_be_visible(timeout=30000)
        shot(page, f"03_{role_label}_calendar_pdf_export")


def verify_activities(page: Page, role_label: str) -> None:
    page.goto(f"{BASE_URL}/actividades")
    expect(page.get_by_role("heading", name="Actividades Cient\u00edficas")).to_be_visible()
    shot(page, f"04_{role_label}_activities_list")

    create_btn = page.locator('button:has-text("Nueva Actividad")')
    if create_btn.count() == 0 or not create_btn.is_visible():
        print(f"    Rol {role_label}: sin boton Nueva Actividad")
        return

    unique = f"UAT_{role_label}_{int(time.time())}"
    create_btn.click()
    expect(page.get_by_role("heading", name="Nueva Actividad Cient\u00edfica")).to_be_visible()

    page.locator('input[name="title"]').fill(f"Actividad {unique}")
    page.locator('input[name="start_date"]').fill("2026-08-15")
    page.locator('input[name="end_date"]').fill("2026-08-16")
    career_select = page.locator('select[name="career_id"]')
    if career_select.is_enabled():
        career_select.select_option(label="Ingenier\u00eda de Sistemas")
    page.locator('select[name="gestion_id"]').select_option(label="2026")
    category_select = page.locator('select[name="category_id"]')
    if category_select.is_enabled():
        category_select.select_option(label="Investigaci\u00f3n Aplicada (INV)")
    page.locator('select[name="activity_type"]').select_option("congreso")
    page.locator('input[name="responsible_name"]').fill("Responsable UAT")
    page.locator('button[type="submit"]').click()

    expect(page.locator(f"text=Actividad {unique}")).to_be_visible(timeout=10000)
    shot(page, f"05_{role_label}_activity_created")

    # Edit: change status and upload evidence
    page.locator(f'tr:has-text("Actividad {unique}") >> button:has-text("Editar")').click()
    expect(page.get_by_role("heading", name="Editar Actividad Cient\u00edfica")).to_be_visible()
    page.locator('select[name="status"]').select_option("in_progress")
    page.locator('input[type="file"]').set_input_files(str(EVIDENCE_FILE))
    expect(page.locator("text=evidencia.pdf")).to_be_visible(timeout=10000)
    shot(page, f"06a_{role_label}_activity_evidence_uploaded")
    page.locator('button[type="submit"]').click()

    expect(page.get_by_role("heading", name="Editar Actividad Cient\u00edfica")).not_to_be_visible(timeout=10000)
    row = page.locator(f'tr:has-text("Actividad {unique}")')
    expect(row.locator("text=En progreso")).to_be_visible(timeout=10000)
    shot(page, f"06b_{role_label}_activity_edited")

    # Delete
    page.on("dialog", lambda dialog: dialog.accept())
    page.locator(f'tr:has-text("Actividad {unique}") >> button:has-text("Eliminar")').click()
    page.wait_for_timeout(1000)
    expect(page.locator(f"text=Actividad {unique}")).not_to_be_visible(timeout=10000)
    shot(page, f"07_{role_label}_activity_deleted")


def verify_categories(page: Page, role_label: str) -> None:
    page.goto(f"{BASE_URL}/configuracion/categorias")
    expect(page.get_by_role("heading", name="Categor\u00edas")).to_be_visible()
    shot(page, f"08_{role_label}_categories")


def verify_import(page: Page, role_label: str) -> None:
    page.goto(f"{BASE_URL}/importar")
    expect(page.get_by_role("heading", name="Importar")).to_be_visible()
    shot(page, f"09_{role_label}_import")


def verify_reports(page: Page, role_label: str) -> None:
    page.goto(f"{BASE_URL}/reportes")
    expect(page.get_by_role("heading", name="Reportes")).to_be_visible()
    shot(page, f"10_{role_label}_reports")


def run_for_role(browser, email: str, role_label: str) -> None:
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()
    try:
        login(page, email)
        verify_dashboard(page, role_label)
        verify_calendar(page, role_label)
        verify_activities(page, role_label)
        verify_categories(page, role_label)
        verify_import(page, role_label)
        verify_reports(page, role_label)
        logout(page)
        shot(page, f"11_{role_label}_logged_out")
        print(f"[OK] {role_label} ({email})")
    except Exception as exc:
        shot(page, f"XX_{role_label}_ERROR")
        print(f"[FAIL] {role_label} ({email}) - {exc}")
        raise
    finally:
        context.close()


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for email, role_label in ROLES:
            run_for_role(browser, email, role_label)
        browser.close()
    print(f"\nScreenshots guardados en: {SCREENSHOTS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
