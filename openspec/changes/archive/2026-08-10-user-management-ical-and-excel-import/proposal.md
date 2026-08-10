# Proposal: User Management CRUD, Bulk Excel User Import, and iCalendar Export

## Intent
Provide full user administration capabilities (CRUD list/edit, bulk Excel user import) and RFC 5545 iCalendar (`.ics`) export functionality to allow external calendar synchronization for scientific and academic activities.

## Scope
### In Scope
- `GET /api/v1/fusion/export-ics`: RFC 5545 `.ics` event stream export for merged academic/scientific activities with timezone/all-day date handling.
- User Management CRUD endpoints (`GET /api/v1/users/` list with pagination/search/role filters, `PUT /api/v1/users/{id}` for admin role & career updates).
- Bulk user import via Excel (`GET /api/v1/users/excel-template` and `POST /api/v1/users/import-excel`).
- Frontend User Management view (`/configuracion/usuarios`) with search, filter, edit modal, and bulk Excel import modal.
- Export to `.ics` button in Calendar (`/calendario`) and Activities (`/actividades`) pages.
- Sidebar menu item under `/configuracion/usuarios` restricted to administrative roles.

### Out of Scope
- OAuth2/SSO directory syncing (e.g. Active Directory, LDAP, Google Workspace).
- Two-way iCal syncing (subscribing to external iCal feeds via URL).

## Approach
Implement native endpoints in `app/api/v1/fusion.py` and `app/api/v1/users.py`. `.ics` generation uses standard library UTC/ISO date formatting (RFC 5545). Excel parsing uses existing `openpyxl` with per-row validation returning structured import results (`success_count`, `error_count`, `row_errors`). Frontend leverages Next.js App Router, shadcn/ui components, and `apiClient`.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `backend/app/api/v1/fusion.py` | Medium | Add `.ics` iCalendar generator endpoint. |
| `backend/app/api/v1/users.py` | High | Add User list, detail edit, template download, and Excel import endpoints. |
| `backend/app/schemas/schemas.py` | Medium | Add schemas for user pagination, import reports, and `.ics` export params. |
| `frontend/lib/api.ts` | Low | Extend API client methods for users CRUD, bulk import, and `.ics` export. |
| `frontend/app/configuracion/usuarios/` | High | Create User Management page with search, filters, CRUD modal, and import modal. |
| `frontend/components/layout/Sidebar.tsx` | Low | Add User Management link for authorized roles. |
| `frontend/app/calendario/` & `actividades/` | Low | Add iCal export button. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Malformed Excel data or duplicate emails | Medium | Perform per-row validation and return detailed row errors in import report without rolling back valid rows. |
| Timezone mismatch in `.ics` exports | Low | Use UTC timestamps (`YYYYMMDDTHHMMSSZ`) for timed activities and `VALUE=DATE:YYYYMMDD` for all-day events. |
| Privilege escalation | Low | Enforce role validation in `deps.py` preventing non-super_admin users from assigning elevated roles. |

## Rollback Plan
Revert API endpoint additions in `fusion.py` and `users.py`, remove `/configuracion/usuarios` page, and revert API client methods. Database schema requires no destructive migrations as user and career tables exist.

## Dependencies
- `openpyxl` (already present in backend dependencies).
- Next.js UI libraries (`shadcn/ui`, `lucide-react`, `tailwindcss`).

## Success Criteria
- [ ] User list endpoint supports pagination, search, and role filtering.
- [ ] Admins can create and update users, roles, and careers.
- [ ] Excel user template can be downloaded and imported with row-level error reporting.
- [ ] Merged activities export to a valid `.ics` file compatible with Google/Apple/Outlook calendars.
- [ ] `/configuracion/usuarios` page is accessible only to authorized roles.
