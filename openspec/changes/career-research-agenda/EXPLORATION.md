# Exploration: career-research-agenda

## Current State

### Backend
- **Models** (`backend/app/models/models.py`): `Career`, `Gestion`, `AcademicActivity` and `ScientificActivity` exist. `ScientificActivity` is already the "scientific research department" activity type (it has `activity_type`, `status`, `responsible_name`, `evidence_url`, `notes`, `career_id`, `gestion_id`). There is no separate `department` or `origin` flag on scientific activities because the entire model represents research-department work.
- **Fusion API** (`backend/app/api/v1/fusion.py`): `GET /api/v1/fusion/` returns a merged list of academic + scientific items filtered by `career_id`, `gestion_id`, `start_date`, `end_date`.
- **Scientific API** (`backend/app/api/v1/scientific.py`): `GET /api/v1/scientific/` returns all scientific activities with **no query filters** for career, gestion or date range.
- **Reports API / Worker** (`backend/app/api/v1/reports.py`, `backend/app/workers/reports_worker.py`):
  - `POST /api/v1/reports/generate` queues PDF or Excel tasks.
  - The PDF worker already uses `reportlab` and produces a two-section table (academic + scientific) filtered by `career_id`/`gestion_id`.
  - The Excel worker is still mocked (writes a text file).
- **Careers API** (`backend/app/api/v1/careers.py`): simple list/CRUD exists.
- **Auth**: `User` and roles exist in the model, but no dependency is actually applied to the activity/report endpoints (they are open).
- **Tests** (`backend/tests/test_api.py`): stale mocks that reference missing modules (`app.models.auth`, `app.api.v1.deps`) and wrong endpoints; pytest is not declared in `pyproject.toml`.

### Frontend
- **Calendar page** (`frontend/app/calendario/page.tsx`): has a working career dropdown, month/list toggle and a working "Export to PDF" button with polling, but the calendar body is only a placeholder (`Vista de calendario ... irá aquí`). It fetches `/api/v1/fusion/merged` but does not render events.
- **Reports page** (`frontend/app/reportes/page.tsx`): static stub cards; buttons do nothing.
- **Activities page** (`frontend/app/actividades/page.tsx`): has a creation modal (`ActivityModal`) and an upload dropzone (`UploadDropzone`). The modal posts to `/api/actividades` (matches backend router). The dropzone posts to `/api/upload-excel`, but the actual backend endpoint is `/api/v1/upload-excel`.
- **Import page** (`frontend/app/importar/page.tsx`): visual dropzone only; no file input wiring or upload logic.
- **Dashboard** (`frontend/app/page.tsx`) and **layout** (`frontend/app/layout.tsx`): static mock data; the global career/gestion selects in the header are not wired.
- **API client** (`frontend/lib/api.ts`): base URL is `http://localhost:8000/api/v1`; wrappers exist for `fusion`, `academic`, `scientific`, `careers`, `gestiones`, `auth`.

### Existing specs / prior changes
- `openspec/specs/agenda-cientifica/` and `openspec/specs/agenda-academica/` define CRUD/import for both activity types.
- `openspec/specs/fusion-engine/` defines the merged endpoint and career filter.
- `openspec/specs/tracking-reports/` defines PDF/Excel async reports.
- Archived changes confirm the career filter, PDF export, activity modal and Excel import were already built, but the calendar view itself was never implemented.

## Affected Areas

- `backend/app/api/v1/scientific.py` — needs query filters so the UI can request "scientific activities for career X in gestión Y".
- `backend/app/schemas/schemas.py` — may need a dedicated scientific-agenda response shape (grouped by month) if we want backend-side grouping.
- `backend/app/api/v1/reports.py` + `backend/app/workers/reports_worker.py` — need a new "research agenda" PDF template that is friendlier than the current two-table report.
- `frontend/app/calendario/page.tsx` — placeholder must be replaced; career/gestion selects should be wired.
- `frontend/app/reportes/page.tsx` — stub buttons need to trigger real report generation.
- `frontend/lib/api.ts` — add scientific filtering helpers and report helpers.
- Optional new route, e.g. `frontend/app/agenda/[careerId]/page.tsx`, if we build a per-career landing view.

## Gap vs. User Goal

The user's MAIN OBJECTIVE is a **friendly, perfectly understandable per-career agenda/calendar focused on the scientific research department's activities**.

Current gaps:
1. **No rendered calendar/agenda** — only a placeholder.
2. **No dedicated "research department" filter** — scientific activities are a separate model, but the UI currently mixes them with academic activities through the fusion endpoint.
3. **No per-career scientific agenda page** — there is no view that says "Here is the research-agenda for Medicine, 2025".
4. **Reports are not agenda-oriented** — the existing PDF is a plain two-section table, not a readable per-career agenda.
5. **Gestion filter not wired** in the calendar header; gestion_id is hard-coded to `1` in the PDF export call.
6. **Frontend upload wiring has path mismatches** (`/api/upload-excel` vs `/api/v1/upload-excel`) and the import page is purely visual.

## Approaches

### A. Friendly per-career research agenda UI

#### 1. Enhanced grouped agenda / list view (custom React + Tailwind)
- **Description**: Build a card-based agenda grouped by month. Each card shows title, type badge, responsible, date range and status. Include career + gestion filters and an "Export agenda PDF" button.
- **Pros**: Fully matches "friendly and understandable"; small bundle; easy responsive/print/PDF parity; low effort; works well for a read-only agenda.
- **Cons**: Less "calendar-like" visually; users cannot drag events.
- **Effort**: Low-Medium.

#### 2. Full calendar library (FullCalendar or react-big-calendar)
- **Description**: Integrate a calendar library and color-code scientific events by type. Filter by career/gestion.
- **Pros**: Familiar month/week/day views; good for overlap detection.
- **Cons**: Extra bundle size (~100-300 kB); accessibility often requires extra work; print/PDF parity is harder; may still need a separate "agenda list" for clarity.
- **Effort**: Medium-High.

#### 3. Custom month-grid component
- **Description**: Render a real month grid (like a native calendar) with scientific events placed on their start date cells.
- **Pros**: Calendar look without heavy dependency; can be tailored to readability.
- **Cons**: More date-math effort; overlap rendering; accessibility/keyboard navigation.
- **Effort**: Medium.

### B. Distinguishing "scientific research department" activities

#### 1. Add query filters to the existing scientific endpoint
- **Description**: Extend `GET /api/v1/scientific/` with optional `career_id`, `gestion_id`, `start_date`, `end_date`. The frontend calls this to get only research-department activities for the selected career.
- **Pros**: No schema change; uses the existing `ScientificActivity` model which already represents research-department work; additive.
- **Cons**: None significant.
- **Effort**: Low.

#### 2. Extend the fusion endpoint with a `source_type` filter
- **Description**: Add `source_type` query param to `/api/v1/fusion/` (`academic`, `scientific`, `all`). Frontend requests `source_type=scientific` for the research agenda.
- **Pros**: Single endpoint; already supports career/gestion filters.
- **Cons**: Slightly couples the research-agenda use case to the fusion abstraction; response shape is flatter and loses scientific-specific fields (e.g. `responsible_name`, `status`) unless schema is expanded.
- **Effort**: Low-Medium.

#### 3. New `ResearchDepartmentActivity` entity
- **Description**: Create a separate model/table for research-department-only activities and migrate scientific activities into it.
- **Pros**: Very explicit domain separation.
- **Cons**: Schema migration; data migration; duplicates most of `ScientificActivity`; breaks existing scientific endpoints and reports.
- **Effort**: High.

## Recommendation

- **UI**: Build the **enhanced grouped agenda / list view** (Approach A.1). The user's wording emphasizes "friendly and perfectly understandable" over a classic dense calendar grid. Month-grouped cards with clear badges and responsible names best satisfy that goal.
- **Research-department filter**: **Add query filters to the existing scientific endpoint** (Approach B.1). `ScientificActivity` already is the research-department activity; no schema or data migration is required. This keeps the change additive and avoids breaking the existing fusion/report flows.
- **Reports**: Add a new PDF worker template specifically for the per-career scientific agenda (month-grouped, readable layout) rather than replacing the existing table-based report, so existing behavior stays intact.

## Risks

- **No schema change required**, but if future requirements demand a `department` field, a later migration will be needed.
- **Breaking change risk is low** if we add filters rather than change the fusion endpoint signature.
- **Backend tests are stale** and reference missing files; running them will likely fail, so verification will rely on manual/API checks until tests are fixed.
- **No frontend test runner** is configured; UI regressions must be caught via manual review or a separate testing decision.
- **Scope creep**: the user mentions careers, activities per career and report generation. The MAIN OBJECTIVE is the per-career scientific agenda; unrelated fixes (import page, global header filters, dashboard stats) should be excluded or tracked separately.
- **Auth not enforced**: new agenda endpoints will be public like the existing ones unless the project decides to apply JWT dependencies as part of this change.

## Ready for Proposal

Yes. The next phase should produce a proposal that scopes the work to:
1. Backend filters on `/api/v1/scientific/`.
2. A friendly per-career scientific agenda view in the frontend (grouped by month).
3. A matching per-career scientific agenda PDF report.
4. Wire the existing calendar/report buttons (gestion filter, export) without redesigning unrelated pages.
