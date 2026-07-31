# Archive Report: career-research-agenda

**Change**: career-research-agenda  
**Archived to**: `openspec/changes/archive/20260731150000-career-research-agenda/`  
**Archive date**: 2026-07-31  
**Implementation branch**: `feature/career-research-agenda-pr5-wiring`  
**Commits**: `81178f7` → `aad6879` → `35e8b98` → `42e9b06` → `f560ca8` → `d75c927` (+ chore commit)  
**Verification verdict**: PASS (40/40 requirements, 22/22 tasks complete)  
**Judgment-day**: PASS ×2 judges after round-1 fixes  

## What Shipped

1. **Scientific activity filters** on `GET /api/v1/scientific/` (`career_id`, `gestion_id`, `start_date`, `end_date`) with AND semantics, empty-result 200, and 422 validation for invalid/inverted dates.
2. **Career research agenda view** replacing the `/calendario` placeholder: month-grouped card agenda with career/gestión selectors, loading/empty/error states, chronological ordering, and PDF export button.
3. **Research-agenda PDF report** generated asynchronously by the Celery worker, with month grouping, career/gestión header, and escaped dynamic content, while preserving the original table report via `report_type` selection.
4. **Backend test-infrastructure repair**: `pytest` and `httpx` declared in `backend/pyproject.toml`, SQLite `get_db` override in `backend/tests/conftest.py`, and stale tests quarantined in `backend/tests/test_api.py` so pytest collects cleanly.
5. **Reports wiring** in `frontend/app/reportes/page.tsx` with a dedicated research-agenda report card.

## Spec Sync

Delta specs merged into main specs (`openspec/specs/`):

| Domain | Action | Source delta |
|---|---|---|
| scientific-activity-filter | Created | `openspec/changes/career-research-agenda/specs/scientific-activity-filter/spec.md` |
| career-research-agenda-view | Created | `openspec/changes/career-research-agenda/specs/career-research-agenda-view/spec.md` |
| research-agenda-pdf-report | Created | `openspec/changes/career-research-agenda/specs/research-agenda-pdf-report/spec.md` |
| backend-test-infrastructure | Created | `openspec/changes/career-research-agenda/specs/backend-test-infrastructure/spec.md` |
| agenda-cientifica | Updated (additive) | `openspec/changes/career-research-agenda/specs/agenda-cientifica/spec.md` |
| tracking-reports | Updated (additive) | `openspec/changes/career-research-agenda/specs/tracking-reports/spec.md` |

All merges were additive; no requirements were removed or renamed.

## Verification Summary

- Backend tests: 8 skipped (quarantined), 0 failures.
- Frontend lint, TypeScript `--noEmit`, and Next.js static build all passed.
- TestClient probes confirmed filter behaviors, report endpoint validation, and direct PDF generation with pypdf text extraction.
- Compliance matrix: 40/40 requirements compliant.
- No CRITICAL issues in verification report.

## Known Limitations / Deferred Follow-ups

1. **Single-sided date filter UX**: providing only `start_date` or only `end_date` is silently ignored. The spec only defines behavior when both are supplied; consider returning 422 or applying a partial filter to make the API behavior explicit.
2. **Quarantined-test import paths**: all 8 pre-existing tests in `backend/tests/test_api.py` remain skipped; their broken `app.models.auth`/`app.schemas.auth` imports were moved inside test functions. Future cleanup should either fix the imports/endpoints or delete the obsolete tests.
3. **`test_scientific_filters.py` follow-up**: the design recommended a dedicated test file covering unfiltered list, individual filters, combined filters, empty result, invalid-date 422, and inverted-range 422; this was deferred out of scope.
4. **Live Celery/Postgres end-to-end check pending**: verification used a local venv, FastAPI `TestClient`, and direct worker function calls. A real Docker Compose run with Redis/Postgres/Celery should be performed in the deployment environment before relying on the async pipeline in production.
5. **Frontend fetch abort on unmount**: polling cleanup clears the scheduled timeout but does not abort an in-flight `fetch`; a late response could theoretically reschedule polling in a small race window.

## Task Completion

All 22 implementation tasks in `tasks.md` were checked `[x]` before archive. No stale-checkbox reconciliation was required.

## Traceability

- Engram observation: `sdd/career-research-agenda/verify-report` (#462)
- Engram observation: `career-research-agenda apply progress (slices 1-5 + judgment-day round 1)` (#458)
- Filesystem artifacts: `openspec/changes/archive/20260731150000-career-research-agenda/`

## SDD Cycle Status

Complete. The change has been planned, implemented, verified, judgment-day reviewed, and archived.
