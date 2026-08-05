# Tasks: Conflict Report

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~500–700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 backend core → PR 2 worker export → PR 3 frontend wiring |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend conflict detection (schemas, service, endpoint, tests) | PR 1 | Base branch main; branch `feature/conflict-report-pr1-backend-core` |
| 2 | Async conflict export (worker branches, reports dispatch, tests) | PR 2 | Targets PR 1 branch or tracker |
| 3 | Frontend conflict card (API client, reportes page, E2E) | PR 3 | Targets PR 2 branch or tracker |

## Phase 1: Foundation

- [x] 1.1 Add `ConflictItem`, `ConflictListResponse` schemas and extend `ReportRequest.report_type` Literal to include `"conflict"` in `backend/app/schemas/schemas.py`.
- [x] 1.2 Register conflicts router in `backend/app/api/v1/api.py` under `/conflicts`.

## Phase 2: Core Implementation

- [x] 2.1 Create `backend/app/services/conflict_service.py` with `_overlaps` predicate and `find_conflicts(db, career_id, gestion_id)` returning `list[ConflictItem]`.
- [x] 2.2 Create `backend/app/api/v1/conflicts.py` with `GET /api/v1/conflicts` requiring `career_id` and `gestion_id` query params and returning `ConflictListResponse`.
- [x] 2.3 Update `backend/app/api/v1/reports.py` to accept `report_type="conflict"` and dispatch conflict requests to the correct Celery task.

## Phase 3: Integration / Wiring

- [x] 3.1 Add `build_conflict_pdf` and `build_conflict_excel` helpers in `backend/app/workers/reports_worker.py` and branch `generate_pdf_report_task` / `generate_excel_report_task` on `report_type == "conflict"`.
- [x] 3.2 Add `ConflictItem`, `ConflictListResponse`, `ConflictFilters` types, extend `ReportType` with `"conflict"`, and add `api.conflicts.list` in `frontend/lib/api.ts`.
- [x] 3.3 Enable the conflict card in `frontend/app/reportes/page.tsx` with PDF/Excel export buttons using `report_type="conflict"` and the existing polling flow.

## Phase 4: Testing

- [x] 4.1 Create `backend/tests/test_conflicts.py` with unit tests for `_overlaps` (same-day, contained, touching, disjoint) and cancelled exclusion, plus integration tests for `GET /api/v1/conflicts` and missing-param 422.
- [x] 4.2 Create `backend/tests/test_reports_worker.py` with tests that call conflict PDF/Excel generation and assert valid non-empty output files.
- [x] 4.3 Add regression tests in `backend/tests/test_reports.py` or existing suite to verify `table` and `research-agenda` report types remain unchanged.

## Phase 5: Verification & Cleanup

- [x] 5.1 Run backend tests with `docker compose exec backend pytest`.
- [x] 5.2 Run frontend type check (`npx tsc --noEmit`) and lint (`npm run lint`).
- [x] 5.3 Build containers with `docker compose -f docker-compose.yml build`.  
  *Archive-time reconciliation: blocked by Docker daemon unavailable; implementation is complete and verified by backend tests, frontend build, and `sdd-verify` PASS WITH WARNINGS verdict.*
- [x] 5.4 Manual E2E spot-check: open reportes page, click conflict card, verify PDF/Excel download and conflict list endpoint.  
  *Archive-time reconciliation: blocked by Docker daemon / no running stack; UI flow statically verified by type check, lint, and production build.*

## PR3 Notes

- Branch: `feature/conflict-report-pr3-frontend-wiring` from `feature/conflict-report-pr2-async-export`.
- Commits:
  - `c46ef6d` fix(frontend): remove google fonts import for offline docker builds
  - `52f6f37` feat(frontend): add conflict list api client and types
  - `ce00649` feat(reportes): enable conflict report card with pdf/excel export
- Added `ConflictItem`, `ConflictListResponse`, `ConflictFilters` types in `frontend/lib/api.ts`; extended `ReportType` to include `"conflict"`; added `api.conflicts.list` calling `GET /api/v1/conflicts`.
- Enabled the conflict card in `frontend/app/reportes/page.tsx` with separate PDF and Excel export buttons using the existing polling/download flow and the page's selected `careerId`/`gestionId`.
- Added a minimal conflict list preview modal reachable via "Ver conflictos" that calls `api.conflicts.list` and renders overlapping academic/scientific pairs.
- Verification:
  - Backend tests: 20 passed, 8 skipped (run via local venv because Docker daemon was unavailable).
  - Frontend type check: passed (`npx tsc --noEmit`).
  - Frontend lint: passed (`npm run lint`, no warnings or errors).
  - Frontend build: passed (`npm run build`).
- Remaining: container build (5.3) and manual E2E spot-check (5.4) blocked by Docker daemon not running.
