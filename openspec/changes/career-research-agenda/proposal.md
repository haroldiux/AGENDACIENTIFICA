# Proposal: Career Research Agenda

## Intent

Directors need a readable per-career scientific agenda. The `calendario` page is a placeholder and the existing PDF is a plain table. This change delivers a friendly month-grouped research agenda with PDF export and fixes backend tests.

## Scope

### In Scope
- Add `career_id`, `gestion_id`, `start_date`, `end_date` filters to `GET /api/v1/scientific/`.
- Replace the `calendario` placeholder with a month-grouped card agenda for selected filters.
- Wire PDF export to a new research-agenda template.
- Add `pytest` to backend dependencies and fix or quarantine stale tests.

### Out of Scope
- New entities or migrations.
- Auth/JWT enforcement.
- Calendar libraries, drag-and-drop, dashboard/header/import fixes, Excel reports.

## Capabilities

### New Capabilities
- `scientific-activity-filter`: optional career/gestión/date filters.
- `career-research-agenda-view`: agenda UI.
- `research-agenda-pdf-report`: per-career PDF export.

### Modified Capabilities
- `tracking-reports`: add research-agenda PDF template while preserving the table report.
- `agenda-cientifica`: render scientific agenda.

## Approach

Use a custom month-grouped card agenda instead of an external calendar library for readability. Add filters to the existing scientific endpoint to avoid schema migration. Add a new PDF template. Wire existing selectors and fix the hard-coded `gestion_id` in the PDF export call. Declare pytest in `pyproject.toml` and repair stale tests.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/app/api/v1/scientific.py` | Modified | Query filters |
| `backend/app/schemas/schemas.py` | Modified | Response shape |
| `backend/app/api/v1/reports.py` | Modified | New report type |
| `backend/app/workers/reports_worker.py` | Modified | PDF template |
| `backend/pyproject.toml` | Modified | pytest dependency |
| `backend/tests/test_api.py` | Modified | Fix/quarantine stale tests |
| `frontend/app/calendario/page.tsx` | Modified | Replace placeholder |
| `frontend/lib/api.ts` | Modified | Filter/report helpers |
| `frontend/app/reportes/page.tsx` | Modified | Wire report cards |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Stale tests fail | High | Add pytest; update or quarantine imports |
| Scope creep | Medium | Limit changes to `calendario` and reports |
| PDF latency | Low | Celery queue and polling |

## Rollback Plan

- Revert `calendario` and `frontend/lib/api.ts` to previous placeholder/export call.
- Remove filters from `scientific.py` and new report type from `reports.py`/`reports_worker.py`.
- Re-quarantine tests if needed.

## Dependencies

- Existing `ScientificActivity`, `Career`, `Gestion` models and `/api/v1/careers`.
- Celery/Redis and `reportlab` already installed.

## Success Criteria

- [ ] Director selects career and gestión on `calendario` and sees research activities grouped by month.
- [ ] `GET /api/v1/scientific/?career_id=X&gestion_id=Y` returns only matching activities.
- [ ] PDF export triggers research-agenda template via Celery polling and downloads.
- [ ] `docker compose exec backend pytest` runs without import errors.
- [ ] Existing academic/fusion endpoints and original PDF report still work.
