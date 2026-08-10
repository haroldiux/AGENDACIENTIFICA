# Archive: Public External Portal & Unauthenticated Academic/Scientific Calendar View

## Final Status
**Completed successfully** — archived 2026-08-10T09:20 (UTC-4)

## Change Metadata

| Field | Value |
|---|---|
| Change Name | `public-external-portal` |
| Project | AGENDA CIENTIFICA |
| Archived At | 2026-08-10T09:20 (UTC-4) |
| Archiver | sdd-archive agent |
| Archive Path | `openspec/changes/archive/2026-08-10-public-external-portal/` |

---

## Summary of Changes

This change delivered a standalone, unauthenticated institutional public portal (`/portal`) where students, researchers, and external visitors can view, filter, and inspect UNITEPC academic and scientific calendar events, access event details, and download public evidence attachments without requiring login.

### Key Features Delivered

1. **Public Route Whitelisting & Layout Bypass**: Updated `AuthGuard.tsx` to whitelist `/portal` and `/public` paths from authentication redirects, and updated `MainLayout.tsx` to omit internal admin sidebar/navigation on public routes.
2. **Dedicated Unauthenticated Backend Router (`/api/v1/public/...`)**: Created `backend/app/api/v1/public_portal.py` providing endpoints for `GET /calendar`, `GET /metadata`, `GET /events/{source_type}/{id}`, and `GET /evidences/{id}/download`. All endpoints return sanitized DTOs omitting sensitive internal user data and audit logs.
3. **Safe Public Evidence Download**: Implemented path traversal prevention in `GET /evidences/{id}/download` using strict `Path(file_path).resolve().is_relative_to(UPLOAD_DIR)` containment checks, returning HTTP 400 Bad Request on invalid path traversal sequences.
4. **Public Portal Frontend Suite (`/portal`)**: Built standalone Next.js page at `/app/portal/page.tsx` with:
   - `PublicHeroHeader.tsx`: UNITEPC institutional header branding and quick search bar.
   - `PublicCalendarExplorer.tsx`: Filter toolbar (Gestion, Sede, Carrera, Category, date range) with interactive calendar grid and list views.
   - `PublicEventDetailModal.tsx`: Comprehensive event inspection modal displaying schedule, location, career, category, and direct evidence download links.
5. **API Client Integration**: Extended `frontend/lib/api.ts` with `publicPortal` API client methods and TypeScript types (`PublicCalendarItem`, `PublicEventDetailResponse`, `PublicMetadataResponse`).
6. **Comprehensive Backend Test Suite**: Added `backend/tests/test_public_portal.py` with 7 unit/integration tests covering filter logic, payload sanitization, event details, and path traversal security defense.

---

## Specs Synced into Main

| Delta Spec | Main Spec | Requirements Merged |
|---|---|---|
| `changes/.../specs/auth-roles/spec.md` | `specs/auth-roles/spec.md` | Whitelisting `/portal` and `/public` in Client-Side Route Guard, unauthenticated public portal access scenario |
| `changes/.../specs/public-portal/spec.md` | `specs/public-portal/spec.md` | Unauthenticated Public Calendar Explorer, Public Event Details Inspection, Unauthenticated Public API Router, Safe Public Evidence Download |

---

## Verification Summary

All phases verified on `2026-08-10` by sdd-verify agent:
- `npx tsc --noEmit` -> Exit 0, 0 TypeScript errors across all components.
- `npm run build` -> Exit 0, Next.js 14 production build succeeded (static `/portal` route generated).
- `python -m pytest tests/test_public_portal.py -v` -> Exit 0, 7/7 tests passed in 0.67s.
- `py_compile` -> Exit 0, zero syntax errors across backend files.
- All 9 spec scenarios: **PASSED**

---

## Files Changed (Implementation)

| File | Change |
|---|---|
| `frontend/components/auth/AuthGuard.tsx` | Route whitelist update for `/portal` and `/public` |
| `frontend/components/layout/MainLayout.tsx` | Layout bypass for public portal routes |
| `frontend/lib/api.ts` | Added `publicPortal` API client methods & types |
| `frontend/components/public/PublicHeroHeader.tsx` | New component - Hero header & search bar |
| `frontend/components/public/PublicCalendarExplorer.tsx` | New component - Filter bar & calendar/list view |
| `frontend/components/public/PublicEventDetailModal.tsx` | New component - Event detail modal & downloads |
| `frontend/app/portal/page.tsx` | New page - Standalone public portal page |
| `backend/app/api/v1/public_portal.py` | New router - Unauthenticated public endpoints |
| `backend/app/api/v1/api.py` | Registered public portal router under `/public` |
| `backend/tests/test_public_portal.py` | New test suite - 7 unit/security tests |

---

## Risks

None - fully verified and production-ready.
