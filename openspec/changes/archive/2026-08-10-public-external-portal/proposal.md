# Proposal: Public External Portal & Unauthenticated Academic/Scientific Calendar View

## Intent
Provide a standalone, unauthenticated institutional public portal (`/portal`) where students, researchers, and external visitors can view, filter, and inspect UNITEPC academic and scientific calendar events, access event details, and download public evidence attachments without requiring login.

## Scope
### In Scope
- Standalone `/portal` route and unauthenticated route bypass in `AuthGuard.tsx` and `MainLayout.tsx`.
- Public header branding, search/filter bar (Gestion, Sede, Carrera, Category, date range).
- Interactive calendar grid and list view for public academic/scientific events.
- Event detail modal showing schedule, location, career, category, and public evidence attachments.
- Unauthenticated backend API router (`/api/v1/public/...`) for calendar events, metadata dropdowns, event details, and evidence file downloads.
- Comprehensive unit/integration tests for public API endpoints.

### Out of Scope
- User registration, authentication, or profile creation for external portal visitors.
- Modification, submission, or approval of events from the public portal interface.
- Internal administrative management actions (e.g. creating/editing sedes or gestiones).

## Approach
Implement Approach A: Standalone `/portal` Route & Dedicated Public API Router.
1. Update `AuthGuard.tsx` and `MainLayout.tsx` to exclude `/portal` and `/public` from auth redirection and internal sidebar layouts.
2. Build `/app/portal/page.tsx` with reusable UI components: `PublicHeroHeader`, `PublicCalendarExplorer`, and `PublicEventDetailModal`.
3. Create backend router `backend/app/api/v1/public_portal.py` with endpoints for public calendar listing (`GET /calendar`), metadata (`GET /metadata`), event details (`GET /events/{source_type}/{id}`), and safe evidence file streaming (`GET /evidences/{id}/download`).
4. Register public portal router in `backend/app/api/v1/api.py` and write test coverage in `backend/tests/test_public_portal.py`.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `frontend/components/auth/AuthGuard.tsx` | Low | Add `/portal` and `/public` to unauthenticated route whitelist |
| `frontend/components/layout/MainLayout.tsx` | Low | Bypass internal sidebar rendering on public portal routes |
| `frontend/app/portal/page.tsx` | High | New public portal page UI and layout |
| `frontend/components/public/*` | High | New components: `PublicHeroHeader`, `PublicCalendarExplorer`, `PublicEventDetailModal` |
| `frontend/lib/api.ts` | Medium | Add public API client methods (`getCalendar`, `getEventDetail`, `getMetadata`, `getEvidenceDownloadUrl`) |
| `backend/app/api/v1/public_portal.py` | High | New unauthenticated public endpoints |
| `backend/app/api/v1/api.py` | Low | Register public router in main API router |
| `backend/tests/test_public_portal.py` | Medium | Test suite for public endpoints and security checks |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Sensitive user data exposure | Low | Sanitize public event schemas to strictly omit internal emails, IDs, and audit logs |
| Path traversal on evidence downloads | Low | Sanitize file paths against configured upload root directory before streaming |
| Unrestricted endpoint abuse | Medium | Apply standard rate limiting and read-only database queries |

## Rollback Plan
Revert changes to `AuthGuard.tsx`, `MainLayout.tsx`, `api.py`, and delete `/app/portal` route and `public_portal.py` backend endpoint.

## Dependencies
- Existing database models for events, sedes, gestiones, carreras, and evidence attachments.
- Existing file storage service for reading public evidence files.

## Success Criteria
- [ ] Visitors can access `/portal` without authentication or login redirects.
- [ ] `/portal` displays UNITEPC branding, filter controls (Gestion, Sede, Carrera, Category, Date), and calendar/list views.
- [ ] Selecting an event opens the detail modal displaying full event information and downloadable evidence links.
- [ ] Evidence files can be downloaded without authentication, with path traversal prevention.
- [ ] Backend test suite `test_public_portal.py` passes with 100% success rate.
