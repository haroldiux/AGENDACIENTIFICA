# Tasks: User Management CRUD, Bulk Excel User Import, and iCalendar Export

## Phase 1: Backend Schemas & Security Dependencies
- [x] `backend/app/schemas/schemas.py`: Add `PaginatedUserResponse`, `UserAdminUpdate`, `UserImportRowError`, and `UserImportReport` Pydantic schemas.
- [x] `backend/app/api/deps.py`: Implement `require_admin_role` dependency for RBAC user administration security checks.

## Phase 2: Backend API Endpoints & Core Logic
- [x] `backend/app/api/v1/users.py`: Add paginated listing `GET /api/v1/users/` with search and role filters, and administrative edit endpoint `PUT /api/v1/users/{id}` with privilege escalation guard.
- [x] `backend/app/api/v1/users.py`: Implement Excel template generator `GET /api/v1/users/excel-template` returning formatted `.xlsx` worksheet.
- [x] `backend/app/api/v1/users.py`: Implement bulk Excel import `POST /api/v1/users/import-excel` using `openpyxl` with per-row validation and `UserImportReport` output.
- [x] `backend/app/api/v1/fusion.py`: Implement `GET /api/v1/fusion/export-ics` RFC 5545 `.ics` generator stream endpoint supporting UTC and all-day dates.

## Phase 3: Backend Tests & Verification
- [x] `backend/tests/test_users.py`: Add unit and integration tests for user listing, user edit, role escalation guard, template download, and bulk Excel import with partial row validation.
- [x] `backend/tests/test_fusion_ical.py`: Add unit tests for `GET /api/v1/fusion/export-ics` verifying RFC 5545 format (`BEGIN:VCALENDAR`, `VEVENT`, UTC/DATE timestamps) and filter parameters.

## Phase 4: Frontend API Client & Navigation Integration
- [x] `frontend/lib/api.ts`: Add `getUsers`, `updateUserAdmin`, `downloadUserExcelTemplate`, `importUsersExcel`, and `exportICal` methods to `apiClient`.
- [x] `frontend/components/layout/Sidebar.tsx`: Add "Usuarios" menu item pointing to `/configuracion/usuarios` restricted to administrative roles.

## Phase 5: Frontend Views & Modals
- [x] `frontend/app/configuracion/usuarios/page.tsx`: Create User Management administration page with search, role filters, paginated data table, user edit modal, and bulk Excel import report modal.
- [x] `frontend/app/calendario/page.tsx`: Add "Exportar iCal (.ics)" action button triggering active filter-based calendar export download.
- [x] `frontend/app/actividades/page.tsx`: Add "Exportar iCal (.ics)" action button triggering active filter-based activities export download.
