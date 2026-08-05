# Exploration: Conflict Report

## Current State

The Agenda Científica UNITEPC system stores academic and scientific activities in two separate models that share the same date/career/gestión shape:

- `AcademicActivity` (`backend/app/models/models.py`): `career_id`, `gestion_id`, `title`, `start_date`, `end_date`, `category`, `origin_color`.
- `ScientificActivity` (`backend/app/models/models.py`): `career_id`, `gestion_id`, `title`, `activity_type`, `start_date`, `end_date`, `responsible_name`, `status`, `evidence_url`, `notes`.

The existing fusion endpoint (`GET /api/v1/fusion/`) already filters both tables by `career_id`, `gestion_id`, and an optional date window using the standard overlap predicate (`end_date >= window_start AND start_date <= window_end`), then returns a merged, sorted list of `MergedCalendarItem` objects. It does **not** detect or report overlaps between academic and scientific events.

Reports are already asynchronous: `POST /api/v1/reports/generate` queues a Celery task (`backend/app/workers/reports_worker.py`) and returns a `task_id`. The frontend (`frontend/app/reportes/page.tsx`) polls `/reports/{task_id}/status` and downloads the file when ready. Two PDF templates exist (`table` and `research-agenda`), but the Excel task is currently a stub that writes placeholder text to a `.xlsx` file.

The frontend already contains a disabled "Reporte de Conflictos" card on the reportes page with a "Próximamente" label, indicating the UI slot is reserved for this feature.

## Affected Areas

- `backend/app/models/models.py` — source of truth for activity schema and relationships.
- `backend/app/api/v1/fusion.py` — existing merge/filter logic and overlap predicate pattern.
- `backend/app/services/scientific_service.py` — existing date-range overlap helper (`start_date <= end_date AND end_date >= start_date`).
- `backend/app/api/v1/reports.py` — report dispatch logic; needs a new report type or format path for conflict reports.
- `backend/app/workers/reports_worker.py` — needs a new Celery task/template for conflict PDF/Excel generation.
- `backend/app/schemas/schemas.py` — needs conflict response schema and `ReportRequest` extension.
- `backend/tests/test_api.py` / `backend/tests/conftest.py` — needs new tests for conflict detection and report generation.
- `frontend/app/reportes/page.tsx` — enable the existing conflict-report card and wire it to the API.
- `frontend/lib/api.ts` — add conflict report types (`ReportType`, request/response types, `api.reports` methods).
- `openspec/specs/tracking-reports/spec.md` — delta spec will add conflict-report requirements.

## Approaches

### 1. Reports-worker-only conflict report

Add a new `report_type="conflict"` to the existing `POST /api/v1/reports/generate` flow and implement a dedicated conflict template in `reports_worker.py`. The worker queries academic and scientific activities for the selected career/gestión, computes pairwise overlaps, and renders PDF/Excel.

- **Pros**: Minimal API surface; reuses the existing Celery polling/download UI pattern.
- **Cons**: No synchronous endpoint for live preview; conflict logic is hidden inside the worker and harder to unit test; frontend cannot show a quick conflict count before exporting.
- **Effort**: Low

### 2. Dedicated conflict endpoint + worker extension (recommended)

Add `GET /api/v1/conflicts` (or `/api/v1/fusion/conflicts`) that returns a synchronous JSON list of detected overlaps for a given `career_id`/`gestion_id`. Reuse the same overlap-detection function in a shared service module. Then extend the reports worker to consume that function for PDF/Excel export under `report_type="conflict"`.

- **Pros**: Follows existing REST patterns; enables live preview/counts in the UI; conflict algorithm is centralized and unit-testable; the existing disabled frontend card can be wired to both preview and export.
- **Cons**: Slightly more files touched than option 1; requires extracting overlap logic into a service.
- **Effort**: Medium

### 3. Extend fusion response with conflict flags

Modify `GET /api/v1/fusion/` to optionally include a `conflicts` array alongside `items` when a query parameter such as `?include_conflicts=true` is passed.

- **Pros**: Single endpoint change; no new routes.
- **Cons**: Blends calendar merging with conflict analysis; the existing reports UI would still need a separate export path, and the `MergedCalendarResponse` schema would gain a field that is irrelevant for most callers.
- **Effort**: Medium

## Recommendation

Use **Approach 2**: create a dedicated `GET /api/v1/conflicts` endpoint backed by a reusable service function, and extend the reports worker with a `conflict` report type. This keeps the fusion endpoint focused on merging, gives the frontend a live conflict preview capability, and reuses the existing async export pipeline. It also aligns with the already-reserved "Reporte de Conflictos" UI slot.

## Risks

- **Excel generation is currently a stub**: the existing `generate_excel_report_task` writes plain text to an `.xlsx` file. Implementing a real conflict Excel report requires using `openpyxl`/`pandas`, which are already declared as dependencies.
- **Test coverage is weak**: most backend tests are skipped/quarantined; the new conflict logic should be covered with focused tests using the existing SQLite/pytest fixture setup.
- **Overlap semantics are undefined**: need to confirm whether same-day start/end counts as a conflict, whether cancelled scientific activities should be excluded, and whether conflicts should be reported per activity pair or as a flat list of overlapping days.
- **Status filter**: `ScientificActivity.status` has `cancelled`; the conflict algorithm should likely ignore cancelled activities, but this must be explicit in the spec.

## Ready for Proposal

Yes. The scope is clear: add backend conflict detection (synchronous endpoint + Celery export), extend the report schemas and worker templates, and enable the existing frontend card. The next phase should produce a proposal with explicit overlap rules, schema definitions, and a rollback plan.
