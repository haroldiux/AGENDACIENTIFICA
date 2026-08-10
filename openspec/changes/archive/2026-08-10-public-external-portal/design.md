# Technical Design: Public External Portal & Unauthenticated Academic/Scientific Calendar View

## Technical Approach
The public external portal provides an unauthenticated interface at `/portal` for external visitors, students, and researchers to browse UNITEPC academic and scientific calendar events, inspect details, and download public evidence attachments without logging in.

- **Client-Side Navigation & Layout**: Update `AuthGuard.tsx` to whitelist `/portal` and `/public` routes. Update `MainLayout.tsx` to omit the internal `Sidebar` and `OnboardingTutorialModal` when on public routes.
- **Frontend UI Architecture**: Construct `/app/portal/page.tsx` utilizing specialized components under `frontend/components/public/`:
  - `PublicHeroHeader.tsx`: UNITEPC institutional banner, branding, and search header.
  - `PublicCalendarExplorer.tsx`: Search/filter controls (Gestion, Sede, Carrera, Category, date range) and toggleable calendar grid/list views.
  - `PublicEventDetailModal.tsx`: Detailed modal showing event schedule, location, career, category, and evidence attachments.
- **Frontend API Client**: Extend `frontend/lib/api.ts` with `publicPortal` API functions (`getCalendar`, `getMetadata`, `getEventDetail`, `getEvidenceDownloadUrl`).
- **Backend Unauthenticated Router**: Implement `backend/app/api/v1/public_portal.py` mounted at `/public` in `backend/app/api/v1/api.py`. Expose read-only endpoints for calendar aggregation, metadata dropdowns, event details, and evidence file streaming.
- **Backend Testing**: Add `backend/tests/test_public_portal.py` verifying response schema sanitization, filtering, and evidence path traversal defense.

## Architecture Decisions

### Decision: Dedicated Unauthenticated Public Portal Router (`public_portal.py`)
**Choice**: Create a dedicated `public_portal.py` router mounted under `/public` with sanitized public response models.  
**Alternatives considered**: Exposing existing internal endpoints (`/academic`, `/scientific`, `/fusion`) with conditional authentication bypass.  
**Rationale**: Clean separation prevents accidental leakage of internal audit logs, user IDs, and private contact information. Dedicated endpoints optimize response payloads for external views.

### Decision: Strict Path Traversal Prevention for Evidence Streaming
**Choice**: Validate and resolve evidence paths using `Path(file_path).resolve()` and verify containment with `resolved_path.is_relative_to(UPLOAD_DIR)` before serving files.  
**Alternatives considered**: Serving raw file paths directly or relying on basic string matching.  
**Rationale**: Ensures malicious file path manipulation (e.g. `../../etc/passwd`) is strictly caught and rejected with HTTP 400 Bad Request before disk access.

## Data Flow
1. **Route Request**: Visitor opens `/portal`. `AuthGuard` checks route whitelist (`/portal`, `/public`) and grants access without redirecting to `/login`.
2. **Layout Rendering**: `MainLayout` checks `pathname` and renders a clean, full-width layout without the internal `Sidebar`.
3. **Data Retrieval**: `PublicCalendarExplorer` queries `GET /api/v1/public/metadata` and `GET /api/v1/public/calendar`.
4. **Backend Query & Sanitization**: `public_portal.py` queries database models (`AcademicActivity`, `ScientificActivity`, `Career`, `Sede`, `Gestion`, `ActivityCategory`), maps to sanitized DTOs, and returns JSON.
5. **Event Inspection**: Clicking an event opens `PublicEventDetailModal` querying `GET /api/v1/public/events/{source_type}/{id}`.
6. **Evidence Download**: Clicking an evidence file opens `GET /api/v1/public/evidences/{id}/download`. The backend verifies path containment in `UPLOAD_DIR` and streams the file.

## File Changes

| File | Action | Description |
| --- | --- | --- |
| `frontend/components/auth/AuthGuard.tsx` | Modify | Whitelist `/portal` and `/public` paths from authentication redirect |
| `frontend/components/layout/MainLayout.tsx` | Modify | Exclude internal `Sidebar` and onboarding modal on public portal routes |
| `frontend/app/portal/page.tsx` | Create | Unauthenticated public portal main page |
| `frontend/components/public/PublicHeroHeader.tsx` | Create | Institutional header banner and search bar component |
| `frontend/components/public/PublicCalendarExplorer.tsx` | Create | Event filter toolbar and interactive calendar grid/list component |
| `frontend/components/public/PublicEventDetailModal.tsx` | Create | Modal component for event schedule, venue, category, and evidence links |
| `frontend/lib/api.ts` | Modify | Add `publicPortal` API client namespace and response types |
| `backend/app/api/v1/public_portal.py` | Create | Unauthenticated public router (`/calendar`, `/metadata`, `/events/{source_type}/{id}`, `/evidences/{id}/download`) |
| `backend/app/api/v1/api.py` | Modify | Register `public_portal.router` with prefix `/public` |
| `backend/tests/test_public_portal.py` | Create | Integration tests for public endpoints and security path traversal validation |

## Interfaces / Contracts
- `GET /api/v1/public/calendar?gestion_id=&sede_id=&career_id=&category_id=&start_date=&end_date=&search=` -> `{ items: PublicCalendarItem[] }`
- `GET /api/v1/public/metadata` -> `{ gestiones: [], sedes: [], careers: [], categories: [] }`
- `GET /api/v1/public/events/{source_type}/{id}` -> `PublicEventDetailResponse` (includes public evidence metadata)
- `GET /api/v1/public/evidences/{id}/download` -> Binary File Stream (HTTP 200) or error response (HTTP 400/404)

## Testing Strategy

| Layer | What to Test | Approach |
| --- | --- | --- |
| Frontend Routing | Route whitelisting & layout rendering | Verify unauthenticated access to `/portal` without login redirect |
| Backend API | Public calendar event listing & filtering | Execute `pytest` testing `/api/v1/public/calendar` with multiple filter criteria |
| Backend Security | Data sanitization | Confirm public endpoints omit user email addresses, audit logs, and internal IDs |
| Backend Security | Evidence path traversal prevention | Request evidence file with relative traversal string (`../`) and verify HTTP 400 |

## Migration / Rollout
- No database migrations required; leverages existing activity, career, sede, gestion, category, and evidence tables.
- Zero downtime deployment.

## Open Questions
- None.
