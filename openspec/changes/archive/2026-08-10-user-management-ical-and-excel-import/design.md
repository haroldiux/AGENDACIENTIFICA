# Design: User Management CRUD, Bulk Excel User Import, and iCalendar Export

## Technical Approach
Implement native FastAPI endpoints for iCalendar (`.ics`) generation and comprehensive user administration. `.ics` export constructs RFC 5545 formatted event streams directly from merged calendar queries. User management provides paginated list/search/filter, administrative CRUD with privilege escalation guards, standardized Excel template generation, and per-row validated Excel bulk import. The Next.js frontend is updated with `/configuracion/usuarios`, sidebar navigation integration, and iCal export buttons on calendar/activity views.

## Architecture Decisions

### Decision: Native RFC 5545 iCalendar Formatting
**Choice**: Standard library date/time string formatting adhering strictly to RFC 5545 specification.
**Alternatives considered**: Heavy external Python iCal dependencies (`icalendar`).
**Rationale**: Eliminates external dependency footprint while providing full control over UTC formatting (`YYYYMMDDTHHMMSSZ`) for timed activities and exclusive date formatting (`VALUE=DATE:YYYYMMDD`) for all-day events.

### Decision: Partial-Success Bulk Import Strategy
**Choice**: Row-by-row Excel parsing with `openpyxl` where valid users are created and invalid rows generate detailed error reports (`success_count`, `error_count`, `row_errors`).
**Alternatives considered**: Full transactional rollback on single-row failure.
**Rationale**: Maximizes operational efficiency for administrators importing multi-row spreadsheets by avoiding total failure due to isolated typos.

### Decision: Strict Backend Privilege Escalation Guard
**Choice**: Centralized dependency verification in `backend/app/api/deps.py` preventing non-`super_admin` users from creating or promoting users to `super_admin` or higher scope roles.
**Alternatives considered**: Client-side form restriction only.
**Rationale**: Guarantees system security against API tamper attempts regardless of client entry point.

## Data Flow
1. **iCal Export**: User clicks export button -> `GET /api/v1/fusion/export-ics?career_id=X&start_date=Y` -> DB query merges academic & scientific activities -> RFC 5545 text stream generated -> File download `.ics`.
2. **User Admin CRUD**: Admin navigates to `/configuracion/usuarios` -> `GET /api/v1/users/?search=X&role=Y&page=1` -> DB returns paginated `UserListResponse` -> Admin edits role/careers via modal -> `PUT /api/v1/users/{id}`.
3. **Bulk Excel Import**: Admin uploads `.xlsx` -> `POST /api/v1/users/import-excel` -> `openpyxl` iterates rows -> Valid rows saved to `users` DB table; Invalid rows appended to error array -> Returns `UserImportReport` -> UI presents execution summary and error list.

## File Changes
| File | Action | Description |
| --- | --- | --- |
| `backend/app/schemas/schemas.py` | Update | Add `PaginatedUserResponse`, `UserAdminUpdate`, `UserImportRowError`, and `UserImportReport` schemas. |
| `backend/app/api/v1/users.py` | Update | Add paginated `GET /`, administrative `PUT /{id}`, `GET /excel-template`, and `POST /import-excel` endpoints. |
| `backend/app/api/v1/fusion.py` | Update | Implement `GET /export-ics` RFC 5545 `.ics` stream exporter. |
| `backend/app/api/deps.py` | Update | Add `require_admin_role` dependency for user management security. |
| `frontend/lib/api.ts` | Update | Extend `apiClient` methods for user administration, template download, bulk import, and iCal export. |
| `frontend/components/layout/Sidebar.tsx` | Update | Add "Usuarios" navigation link under `/configuracion/usuarios` restricted to administrative roles. |
| `frontend/app/configuracion/usuarios/page.tsx` | Create | Build User Management UI page with search, filters, pagination, user modal, and import modal. |
| `frontend/app/calendario/page.tsx` | Update | Add "Exportar iCal (.ics)" action button with active filters. |
| `frontend/app/actividades/page.tsx` | Update | Add "Exportar iCal (.ics)" action button with active filters. |

## Interfaces / Contracts
- `GET /api/v1/fusion/export-ics?career_id={id}&gestion_id={id}&start_date={date}&end_date={date}` -> `text/calendar`
- `GET /api/v1/users/?page={int}&page_size={int}&search={str}&role={str}&career_id={int}` -> `PaginatedUserResponse`
- `PUT /api/v1/users/{id}` -> `UserResponse`
- `GET /api/v1/users/excel-template` -> `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `POST /api/v1/users/import-excel` -> `UserImportReport`

## Testing Strategy
| Layer | What to Test | Approach |
| --- | --- | --- |
| Backend API | `GET /fusion/export-ics` formatting | Unit test `.ics` output for VEVENT, UTC dates, and all-day DATE fields. |
| Backend API | User list & privilege escalation | Integration test checking 403 Forbidden for unauthorized role assignments. |
| Backend API | Bulk Excel import | Test multi-row spreadsheet with valid and invalid rows, asserting partial creation and error report accuracy. |
| Frontend UI | User administration table & modals | Component tests for filtering, pagination, edit modal submission, and import report rendering. |

## Migration / Rollout
- No database schema migrations required (existing `users` and `careers` tables are used).
- Deploy backend API changes first, followed by frontend UI updates.

## Open Questions
- None identified.
