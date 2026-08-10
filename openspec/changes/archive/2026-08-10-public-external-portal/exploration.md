# Exploration: Public External Portal & Unauthenticated Academic/Scientific Calendar View

## Current State
- **Frontend Authentication & Layout**:
  - `AuthGuard.tsx` enforces authentication for all routes except `PUBLIC_ROUTES` (currently hardcoded as `["/login"]`). Any attempt to visit an unauthenticated page redirects to `/login`.
  - `MainLayout.tsx` unconditionally renders the internal administration `Sidebar` and `OnboardingTutorialModal` unless `pathname === "/login"`.
  - The application currently lacks a standalone institutional public portal where external visitors, students, or researchers can view academic and scientific events without logging in.

- **Backend API Layer**:
  - `backend/app/api/v1/public.py` currently contains minimal `/fusion` and `/careers` endpoints.
  - Endpoints for `sedes`, `gestiones`, `categories`, and `scientific/evidences` require `Bearer` token authentication (`deps.require_read_only_get`).
  - No dedicated unauthenticated endpoints exist for retrieving public metadata (gestiones, sedes, careers), rich event details, or downloading public evidence report files.

---

## Affected Areas
- `frontend/components/auth/AuthGuard.tsx` — Add `/portal` and `/public` to public routes bypass logic.
- `frontend/components/layout/MainLayout.tsx` — Skip rendering internal `Sidebar` and `OnboardingTutorialModal` on `/portal` and `/public` routes.
- `frontend/app/portal/page.tsx` — Standalone public page with hero section, UNITEPC branding, filter bar, and interactive calendar/list view.
- `frontend/components/public/PublicHeroHeader.tsx` — Branding, tagline, search bar (Gestion, Sede, Carrera, Event Type, date filter).
- `frontend/components/public/PublicCalendarExplorer.tsx` — Interactive calendar grid and list view for public events.
- `frontend/components/public/PublicEventDetailModal.tsx` — Event details modal with date, location, category, status, and download links for public evidence files.
- `frontend/lib/api.ts` — Add `public` API client methods (`getCalendar`, `getEventDetail`, `getMetadata`, `getEvidenceDownloadUrl`).
- `backend/app/api/v1/public_portal.py` (or `public.py`) — Unauthenticated endpoints:
  - `GET /api/v1/public/calendar` — Merged academic/scientific public events filtered by gestion, sede, career, date range, search query.
  - `GET /api/v1/public/events/{source_type}/{id}` — Detailed event information with public evidence files.
  - `GET /api/v1/public/metadata` — Gestiones, Sedes, Carreras, and Categories for filter dropdowns.
  - `GET /api/v1/public/evidences/{id}/download` — Stream public evidence files without auth token.
- `backend/app/api/v1/api.py` — Register public portal router.
- `backend/tests/test_public_portal.py` — Test coverage for public unauthenticated endpoints and filtering.

---

## Approaches

### Approach A: Standalone `/portal` Route & Dedicated Public API Module (Recommended)
- **Description**: Add `/portal` and `/public` to `PUBLIC_ROUTES` in `AuthGuard.tsx` and disable admin `Sidebar` in `MainLayout.tsx` for these paths. Build clean unauthenticated endpoints in `backend/app/api/v1/public_portal.py` that return merged public events with rich metadata (Sede, Carrera, Gestion, Category, Evidence files). Create modular React components for hero branding, filter controls, interactive calendar, and detail modal.
- **Pros**:
  - Strict security boundary: public endpoints explicitly serialize only public fields and attachments.
  - Clean layout isolation between internal admin UI and external institutional portal.
  - High performance and easy maintainability.
- **Cons**:
  - Small amount of UI code adapted specifically for public read-only interaction.
- **Effort**: Medium

### Approach B: Relaxing Auth Guards on Existing Internal Endpoints
- **Description**: Modify existing endpoints in `academic.py`, `scientific.py`, and `sedes.py` to allow optional authentication using query parameters (e.g., `?public=true`).
- **Pros**:
  - Reuses internal endpoint handlers directly.
- **Cons**:
  - High security risk of leaking internal user data or audit logs.
  - Clutters internal authorization logic with conditional checks.
- **Effort**: High

---

## Recommendation
**Approach A** is recommended. It cleanly decouples the external public portal from internal administrative workflows, ensures security by design, and provides an optimized user experience for students and external visitors.

---

## Risks
- **Data Exposure**: Public endpoints must strip out internal user emails, user IDs, and internal audit histories.
- **File Download Path Traversal**: Evidence download endpoint must validate file paths and ensure files reside strictly within configured upload directories.
- **CORS / Rate Limiting**: Ensure public endpoints permit cross-origin access if embedded elsewhere, and apply basic rate-limiting safeguards.

---

## Ready for Proposal
**Yes** — The requirements, codebase touchpoints, API design, layout adjustments, and component architecture are thoroughly explored and ready for formal proposal writing.
