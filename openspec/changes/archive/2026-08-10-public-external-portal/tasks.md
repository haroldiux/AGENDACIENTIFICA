# Tasks: Public External Portal & Unauthenticated Academic/Scientific Calendar View

## Phase 1: Backend Public API & Security
- [x] `backend/app/api/v1/public_portal.py`: Create unauthenticated public router with endpoints for `GET /calendar`, `GET /metadata`, `GET /events/{source_type}/{id}`, and `GET /evidences/{id}/download` featuring strict path traversal containment checks.
- [x] `backend/app/api/v1/api.py`: Register `public_portal.router` under prefix `/public` with tag `public` in the main API router.
- [x] `backend/tests/test_public_portal.py`: Create comprehensive test suite for public endpoints, verifying query filtering, response payload sanitization, and path traversal security defense.

## Phase 2: Frontend API Integration & Route Whitelisting
- [x] `frontend/components/auth/AuthGuard.tsx`: Update route whitelist logic to permit unauthenticated access to `/portal` and `/public` paths without redirecting to `/login`.
- [x] `frontend/components/layout/MainLayout.tsx`: Update layout logic to omit internal sidebar and onboarding modal when on public portal routes.
- [x] `frontend/lib/api.ts`: Add `publicPortal` API client namespace and TypeScript interfaces (`PublicCalendarItem`, `PublicEventDetailResponse`, `PublicMetadataResponse`) for public endpoints.

## Phase 3: Public Portal UI Components & Page
- [x] `frontend/components/public/PublicHeroHeader.tsx`: Implement header component with UNITEPC branding, portal title, and keyword search input.
- [x] `frontend/components/public/PublicCalendarExplorer.tsx`: Implement filter controls toolbar (Gestion, Sede, Carrera, Category, date range) and interactive calendar grid/list views.
- [x] `frontend/components/public/PublicEventDetailModal.tsx`: Implement event detail modal displaying schedule, venue, career, category, and public evidence attachment download links.
- [x] `frontend/app/portal/page.tsx`: Implement standalone unauthenticated public portal page assembling hero header, calendar explorer, and detail modal.

## Phase 4: Verification & Integration Testing
- [x] `backend/tests/test_public_portal.py`: Execute backend test suite using `pytest` to verify public API endpoints, response schemas, and path traversal security controls pass.
