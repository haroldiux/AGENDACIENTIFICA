# Tasks: Career Research Agenda

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~1,300 |
| 800-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (infra) → PR 2 (backend filters) → PR 3 (backend reports) → PR 4 (frontend UI) → PR 5 (wiring + verification) |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Restore runnable pytest suite | PR 1 | Adds `pytest`/`httpx`, SQLite `get_db` override, quarantines stale tests |
| 2 | Add scientific activity filters | PR 2 | Service + schema + router; base = feature/career-research-agenda |
| 3 | Add research-agenda PDF backend | PR 3 | Report type param + worker template; base = PR 2 branch |
| 4 | Build month-grouped agenda UI | PR 4 | Components + `calendario/page.tsx` + `lib/api.ts`; base = PR 1 branch (UI-only) or tracker |
| 5 | Wire report export and verify | PR 5 | `reportes/page.tsx` + smoke tests + manual review; base = PR 3 & PR 4 integration |

## Phase 1: Infrastructure

- [x] 1.1 Add `pytest` and `httpx` to `backend/pyproject.toml` dependencies. Implements `backend-test-infrastructure` spec.
- [x] 1.2 Create `backend/tests/conftest.py` with SQLite `get_db` override for FastAPI `TestClient`. Implements design § Testing Strategy.
- [x] 1.3 Quarantine stale tests in `backend/tests/test_api.py`: move `app.models.auth`/`app.schemas.auth` imports inside the test functions and add `@pytest.mark.skip(reason="quarantined stale test")`. Implements design § Stale Tests and `backend-test-infrastructure` spec.
- [x] 1.4 Run `docker compose exec backend pytest` and confirm collection passes without import errors. Verifies `backend-test-infrastructure` spec.

_Note: Docker Desktop was unavailable on the apply workstation, so verification used a local venv with dependencies installed from `backend/pyproject.toml`. Pytest collected successfully with 8 quarantined tests skipped and 0 failures. Additionally, a minimal `backend/app/api/deps.py` was added because the baseline routers (`sedes.py`, `actividades.py`) import `app.api.deps`, which did not exist and prevented pytest collection; the module is pure infrastructure with no business logic._

## Phase 2: Backend Filters

- [ ] 2.1 Create `backend/app/services/scientific_service.py` with `list_scientific_activities(db, career_id, gestion_id, start_date, end_date)` using overlap filter `start_date <= end_date AND end_date >= start_date`. Implements design § Filter Service and `scientific-activity-filter` spec.
- [ ] 2.2 Add filter parameter model to `backend/app/schemas/schemas.py` (`career_id`, `gestion_id`, `start_date`, `end_date` optional). Implements design § Query Parameters.
- [ ] 2.3 Modify `backend/app/api/v1/scientific.py` to accept query parameters and delegate to `ScientificService.list`. Returns 422 for invalid dates / `start_date > end_date` via FastAPI validation. Implements `scientific-activity-filter` spec.

## Phase 3: Backend Reports

- [ ] 3.1 Modify `backend/app/schemas/schemas.py` so `ReportRequest` includes `report_type: str = "table"`. Implements design § Report Request and `tracking-reports` spec.
- [ ] 3.2 Modify `backend/app/api/v1/reports.py` to accept `report_type` and pass it to the Celery task. Implements `tracking-reports` and `research-agenda-pdf-report` specs.
- [ ] 3.3 Modify `backend/app/workers/reports_worker.py` to branch on `report_type` and keep the existing table path as default. Implements design § Celery task and `tracking-reports` § Template Selection.
- [ ] 3.4 Implement `build_research_agenda_pdf(doc, activities, career_name, gestion_name)` with header, month sections, and activity cards. Implements design § PDF Template and `research-agenda-pdf-report` spec.

## Phase 4: Frontend Implementation

- [ ] 4.1 Add `api.scientific.list`, `api.reports.generate`, `api.reports.status`, and `api.reports.download` helpers to `frontend/lib/api.ts`. Implements design § Frontend API Helpers.
- [ ] 4.2 Create `frontend/components/agenda/AgendaFilterBar.tsx` with career and gestión selectors. Implements `career-research-agenda-view` § Career Selector / Gestión Selector.
- [ ] 4.3 Create `frontend/components/agenda/AgendaNoCareerSelected.tsx` prompt. Implements `agenda-cientifica` § Career Selection Required.
- [ ] 4.4 Create `frontend/components/agenda/AgendaMonthGroup.tsx` and `AgendaActivityCard.tsx` for month-grouped cards showing title, type, responsible, dates, status, notes. Implements `career-research-agenda-view` § Month-Grouped Agenda / Activity Card Content.
- [ ] 4.5 Create `frontend/components/agenda/AgendaSkeleton.tsx`, `AgendaEmptyState.tsx`, and `AgendaErrorState.tsx`. Implements `career-research-agenda-view` § Loading State / Empty State / Error State.
- [ ] 4.6 Rewrite `frontend/app/calendario/page.tsx` as the container: hold filters, fetch activities, group by month, render states, and trigger PDF export. Implements `agenda-cientifica` and `career-research-agenda-view` specs.

## Phase 5: Wiring & Verification

- [ ] 5.1 Wire the research-agenda PDF export in `frontend/app/reportes/page.tsx` (add option/button that calls `api.reports.generate` with `report_type: 'research-agenda'`). Resolves leftover proposal/design mismatch for this file.
- [ ] 5.2 Verify `GET /api/v1/scientific/?career_id=X&gestion_id=Y` returns filtered activities and empty list with 200 when no matches. Verifies `scientific-activity-filter` scenarios.
- [ ] 5.3 Verify existing table report still works and research-agenda PDF downloads after polling. Verifies `tracking-reports` and `research-agenda-pdf-report` specs.
- [ ] 5.4 Manual UI review: placeholder removed, month ordering, loading/empty/error states, export flow. Verifies `agenda-cientifica` and `career-research-agenda-view` specs.
- [ ] 5.5 Smoke-test worker PDF output contains career name and month text. Verifies design § Testing Strategy.

## Design Refinements & Out-of-Scope Notes

- Leftover 1 (`frontend/app/reportes/page.tsx`): resolved by adding task 5.1 to wire the research-agenda export option.
- Leftover 2 (`start_date > end_date` and `>=1` id constraints): accepted as FastAPI-level design refinement in task 2.3; not duplicated in the service.
- Leftover 3 (`ScientificService.list_scientific_activities` unit test): marked follow-up/out-of-scope per design § New Tests; task 5.2 uses integration checks instead.
