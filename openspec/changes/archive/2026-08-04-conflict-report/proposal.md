# Proposal: Conflict Report

## Intent

Enable users to detect scheduling conflicts between academic and scientific activities that belong to the same career and gestión, then export the findings as PDF or Excel.

## Scope

### In Scope
- Synchronous `GET /api/v1/conflicts` endpoint that returns overlapping academic/scientific activity pairs.
- Reusable overlap-detection service in the backend.
- New `report_type="conflict"` for the existing async `POST /api/v1/reports/generate` pipeline (PDF and Excel).
- Enable the existing "Reporte de Conflictos" card on `frontend/app/reportes/page.tsx`.
- Focused backend tests for overlap detection and report generation.

### Out of Scope
- Calendar conflict highlighting in the fused calendar UI.
- Automatic conflict resolution or scheduling suggestions.
- Email/push notifications.
- Cross-career or cross-gestión conflict detection.

## Capabilities

### New Capabilities
- `conflict-detection`: synchronous detection of date overlaps between `AcademicActivity` and `ScientificActivity` for a given `career_id` and `gestion_id`.

### Modified Capabilities
- `tracking-reports`: extend `POST /api/v1/reports/generate` and the Celery worker to support `report_type="conflict"` for PDF and Excel export.

## Approach

Implement the dedicated conflict endpoint + worker extension recommended by exploration. Extract the overlap predicate into a shared service so both the endpoint and the report worker use the same logic. Keep the fusion endpoint unchanged.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/app/services/conflict_service.py` | New | Shared overlap detection logic. |
| `backend/app/api/v1/conflicts.py` | New | FastAPI router for `GET /api/v1/conflicts`. |
| `backend/app/schemas/schemas.py` | Modified | Conflict response schema; extend `ReportRequest.report_type`. |
| `backend/app/api/v1/reports.py` | Modified | Dispatch `report_type="conflict"` to the worker. |
| `backend/app/workers/reports_worker.py` | Modified | Add conflict PDF/Excel templates. |
| `backend/app/main.py` | Modified | Include the conflicts router. |
| `frontend/app/reportes/page.tsx` | Modified | Enable conflict card and wire export. |
| `frontend/lib/api.ts` | Modified | Add conflict types and API helpers. |
| `openspec/specs/tracking-reports/spec.md` | Delta | Add conflict report requirements. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overlap business rules undefined | Med | Spec phase will define same-day handling, cancelled activities, and pair-vs-day output. |
| Excel worker is a stub | Med | Replace stub with `openpyxl`/`pandas` for real `.xlsx` output. |
| Weak backend test coverage | Med | Add focused tests for service and endpoint; do not rely on skipped tests. |
| Frontend assumes existing polling pattern | Low | Reuse the established report status/download flow. |

## Rollback Plan

1. Remove or revert `backend/app/api/v1/conflicts.py` and its `main.py` registration.
2. Revert changes to `schemas.py`, `reports.py`, and `reports_worker.py`.
3. Disable the conflict card in `frontend/app/reportes/page.tsx` (restore `disabled` + "Próximamente").
4. Drop the `conflict-detection` capability spec and remove the `tracking-reports` delta.

## Dependencies

- `openpyxl` and `pandas` are already declared in the backend dependencies.
- Celery worker and Redis must be running for async exports (already required by existing reports).

## Success Criteria

- [ ] `GET /api/v1/conflicts` returns a JSON list of overlapping academic/scientific activity pairs for valid `career_id`/`gestion_id`.
- [ ] Cancelled scientific activities are excluded from conflict detection.
- [ ] `POST /api/v1/reports/generate` with `report_type="conflict"` produces a downloadable PDF and Excel file.
- [ ] The frontend "Reporte de Conflictos" card is enabled and triggers conflict export.
- [ ] New backend tests pass for overlap service, endpoint, and report worker.
