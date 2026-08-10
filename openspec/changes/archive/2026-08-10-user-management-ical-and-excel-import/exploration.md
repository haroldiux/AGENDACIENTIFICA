# Exploration: iCalendar (.ics) Export, User Management CRUD, and Bulk Excel User Import

## Current State
The Agenda Científica UNITEPC application currently provides:
- **Calendar & Fusion Engine**: `GET /api/v1/fusion/` merges `AcademicActivity` and `ScientificActivity` records. PDF report exports are implemented via Celery workers, but there is no native RFC 5545 iCalendar (`.ics`) file generator or frontend export button for external calendar syncing (e.g., Google Calendar, Apple Calendar, Outlook).
- **User Management & Security**: Basic endpoints exist in `app/api/v1/users.py` (`/me`, `PATCH /me`, `POST /me/test-telegram`, `POST /`). However, there is no `GET /api/v1/users/` endpoint to list all users with search/filters, no `PUT /api/v1/users/{id}` endpoint to edit role/careers/status, and no frontend `/configuracion/usuarios` management view. Role-based access controls exist in `app/api/deps.py` for global roles (`super_admin`, `admin`, `vicerrectorado`, `director_investigacion`).
- **Excel Processing**: Excel processing capability is already established using `openpyxl` and `pandas` in `app/api/v1/importacion.py` for activities. However, bulk user creation via Excel template generation (`GET /api/v1/users/excel-template`) and Excel file parsing/import (`POST /api/v1/users/import-excel`) are missing.

## Affected Areas
- `backend/app/api/v1/fusion.py` — Add `GET /api/v1/fusion/export-ics` endpoint generating RFC 5545 VEVENT strings with proper headers and date formatting.
- `backend/app/api/v1/users.py` — Add `GET /api/v1/users/`, `PUT /api/v1/users/{id}`, `GET /api/v1/users/excel-template`, and `POST /api/v1/users/import-excel` endpoints.
- `backend/app/schemas/schemas.py` — Add schemas for `UserListResponse`, `AdminUserUpdate`, `UserImportReport`, `UserImportRowError`, and `MergedCalendarExportParams`.
- `frontend/lib/api.ts` — Add API client methods for `users.list()`, `users.update()`, `users.downloadExcelTemplate()`, `users.importExcel()`, and `fusion.exportIcs()`.
- `frontend/components/layout/Sidebar.tsx` — Add link to `/configuracion/usuarios` for authorized roles (`super_admin`, `admin`, `vicerrectorado`, `director_investigacion`).
- `frontend/app/configuracion/usuarios/page.tsx` — New page for User Management CRUD table, search/filters, create/edit modal, and Excel bulk import modal.
- `frontend/app/calendario/page.tsx` & `frontend/app/actividades/page.tsx` — Add "Exportar a Calendario (.ics)" buttons.

## Approaches

1. **Approach 1: Integrated Native Routers (Recommended)**
   - **Description**: Implement `GET /api/v1/fusion/export-ics` directly inside `fusion.py` using Python's standard library date formatting to produce strict RFC 5545 `.ics` strings without external dependency bloat. Extend `users.py` with standard SQLAlchemy CRUD query building, openpyxl template generation, and row-by-row validation for Excel bulk import. Build a single Next.js page `/configuracion/usuarios` with reusable modal dialogs for User CRUD and Excel Import.
   - **Pros**:
     - Standardized with existing `openpyxl` patterns used in `importacion.py`.
     - Pure Python string formatting for `.ics` has zero third-party library risks and matches RFC 5545 standard.
     - Direct integration with current `AuthGuard`, `RoleEnum`, and `user_career` secondary table.
   - **Cons**: Requires adding new schemas in `schemas.py` and front-end state management for the import modal report.
   - **Effort**: Medium

2. **Approach 2: Third-Party iCal Library & Separate Router Modules**
   - **Description**: Add `icalendar` or `ics` package to `pyproject.toml`, and split user management bulk endpoints into a dedicated `/api/v1/users_import.py` router file.
   - **Pros**: `icalendar` library provides object-oriented event building.
   - **Cons**: Adds extra python dependency, complicates route registrations, unnecessary overhead for simple VEVENT serialization.
   - **Effort**: Medium-High

## Recommendation
We recommend **Approach 1**. Utilizing pure Python string formatting for RFC 5545 VEVENT output avoids adding unneeded dependencies. Extending `users.py` and `fusion.py` keeps the backend modular and consistent with existing codebase conventions. The frontend additions leverage shadcn/ui dialogs, Tailwind CSS, and `apiClient` interceptors for seamless UX.

## Risks
- **Data Validation in Bulk Excel**: Duplicate emails within the same Excel sheet or invalid role string formats could cause batch transaction rollbacks if not validated per-row. *Mitigation*: Perform per-row validation and return an explicit `row_errors` list without failing valid rows (or wrap in clean transactional checks).
- **Timezone and All-Day Event Formatting in iCal**: RFC 5545 date formats (`YYYYMMDD` vs `YYYYMMDDTHHMMSSZ`) must properly distinguish all-day events from timed activities to prevent offset errors when importing into Google Calendar or Apple Calendar. *Mitigation*: Format standard `Date` fields as `VALUE=DATE:YYYYMMDD` and times as ISO UTC strings.
- **Privilege Escalation**: Non-super_admin users must be restricted from assigning or editing `super_admin` or `admin` roles. *Mitigation*: Enforce role-based checks in backend dependency validation (`deps.py`).

## Ready for Proposal
Yes — The requirements, codebase architecture, and endpoint specs are clear and ready for `sdd-propose`.
