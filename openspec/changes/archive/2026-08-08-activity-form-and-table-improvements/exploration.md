# Exploration: Activity Form UX Improvements & Table Column Sorting

## Change Name: `activity-form-and-table-improvements`
**Project**: AGENDA CIENTÍFICA  
**Date**: 2026-08-08

---

## Current State

### Key Files

| File | Role |
|---|---|
| `frontend/app/actividades/page.tsx` | Activities list page — renders filter bar, search, table, hosts `<ActivityModal>` |
| `frontend/app/actividades/components/ActivityModal.tsx` | Form modal for create/edit — 515 lines, owns all form state |
| `frontend/context/AuthContext.tsx` | Provides `user` (with `role: string` and `careers: {id,name}[]`) via `useUser()` hook |
| `frontend/lib/api.ts` | API client — defines `RoleEnum`, `ScientificActivity`, `ActivityCategory` types |
| `frontend/components/agenda/agenda-helpers.ts` | `activityTypeLabels`, `activityStatusLabels`, `formatDateRange`, etc. |
| `backend/app/api/v1/scientific.py` | REST CRUD for scientific activities; calls `check_activity_scope_permission` |
| `backend/app/api/deps.py` | `check_activity_scope_permission` — enforces career-scoped vs global writes |
| `backend/app/models/models.py` | `ScientificActivity` model — `career_id` nullable (None = global); no collaboration field yet |
| `backend/app/schemas/schemas.py` | `ScientificActivityCreate`, `ScientificActivityUpdate` — no collaboration_career_ids yet |

### Role Hierarchy (confirmed from deps.py + models.py)

Global-scope allowed:   super_admin, admin, vicerrectorado, director_investigacion, research
Career-scoped:          coordinator, jefe_investigacion
Restricted (no writes): teacher

The backend ALREADY enforces that coordinator/jefe_investigacion cannot set career_id = null (global).
The frontend does NOT enforce this — the global toggle is visible to ALL roles.

### ActivityModal.tsx — Current Form Layout (lines 223-360)

1. "Es actividad global/institucional" — plain checkbox visible to ALL roles (no role guard)
2. Carrera dropdown — shows all careers from api.careers.list(); no pre-fill from user context
3. "Tipo de Actividad" (static enum: congreso, webinar, defensa, feria, olimpiada, master_class)
4. "Categoría Dinámica" (dynamic from activity_categories table); has side-effect auto-filling activity_type from category code (line 341-345)
5. No useUser() import anywhere in ActivityModal.tsx — does not know current user's role or careers

### page.tsx — Table (lines 231-291)

- Static TableHead cells: Nombre, Fecha, Tipo, Carrera, Estado, Acciones
- No sort state — visibleActivities is filtered but not sorted
- Default order is API response order (undefined / DB insertion order)

### AuthContext.tsx

- User interface has careers: { id: number; name: string }[] — already populated from GET /users/me
- UserResponse schema in backend includes careers: List[CareerResponse]
- useUser() hook is already exported and usable anywhere

### Backend: Collaboration Careers

- ScientificActivity model has NO collaboration_career_ids field
- ScientificActivityCreate/Update schemas have NO such field
- A new many-to-many join table would be needed: scientific_activity_collaboration_careers

---

## Affected Areas

### Requirement 1 — Role-based Form Permissions

- frontend/app/actividades/components/ActivityModal.tsx — add useUser(), conditionally hide global toggle and restrict career dropdown
- frontend/lib/api.ts — add collaboration_career_ids?: number[] to ScientificActivity and create/update payload types
- backend/app/models/models.py — add collaboration_career_ids join table + relationship
- backend/app/schemas/schemas.py — add collaboration_career_ids: Optional[List[int]] = [] to create/update schemas
- backend/app/api/v1/scientific.py — persist collaboration careers on create/update
- backend — Alembic migration for new table

### Requirement 2 — Label Renaming + Tooltips

- frontend/app/actividades/components/ActivityModal.tsx — rename two labels, add hint text, consider field order swap
- frontend/components/agenda/agenda-helpers.ts — no changes needed (labels are in modal)
- frontend/app/actividades/page.tsx — "Tipo" column header may optionally be renamed "Tipo de Evento"

### Requirement 3 — Table Column Sorting

- frontend/app/actividades/page.tsx — add sort state, click handlers, sort icons, sorted visibleActivities
- frontend/components/agenda/agenda-helpers.ts — no changes needed; sort logic lives in page

---

## Approaches

### Req 1A: Role-based Global Toggle Visibility

**Approach A — Client-side role guard in modal (recommended)**
- Import useUser() in ActivityModal.tsx; define GLOBAL_ALLOWED_ROLES = ['vicerrectorado','director_investigacion','super_admin','admin']
- Conditionally render global toggle only when user.role is in the allowed set
- Pros: Zero backend changes; mirrors backend logic already in deps.py
- Cons: Frontend-only guard (backend already blocks unauthorized writes — defense in depth)
- Effort: Low

**Approach B — Backend-driven via user permissions field**
- Extend UserResponse with a permissions array; UI reads permissions
- Pros: Single source of truth
- Cons: Requires backend schema change + frontend update; over-engineered
- Effort: High

### Req 1B: Career Pre-fill and Lock for jefe_investigacion/coordinator

**Approach A — Pre-fill from user.careers (recommended)**
- If user.role is career-scoped and user.careers.length > 0, pre-set formData.career_id = String(user.careers[0].id)
- Disable dropdown (or show static text) when user has exactly 1 career
- If user has multiple careers, show only those careers in the dropdown (filtered list)
- Pros: No backend changes; user.careers is already returned by /users/me
- Effort: Low

**Approach B — Server returns restricted list**
- Modify GET /careers/ to return only user's careers based on JWT
- Cons: Breaks the global filter bar; requires backend changes; over-engineered
- Effort: High

### Req 1C: "Carreras en Colaboración" Multi-select

**Approach A — New join table + schema extension (recommended)**
- Add scientific_activity_collaboration_careers table (activity_id, career_id)
- Add collaboration_career_ids: Optional[List[int]] = [] to create/update schemas
- In scientific.py, persist collaboration careers after activity save
- Add collaboration_careers: List[CareerResponse] to ScientificActivityResponse
- Frontend: add multi-select in modal (filtered to exclude primary career)
- Pros: Clean, normalized; future reports can query collaboration
- Cons: Requires DB migration + backend schema change
- Effort: Medium

**Approach B — Store as JSON string in a text column**
- Pros: No migration complexity for now
- Cons: Not queryable; anti-pattern; hard to extend
- Effort: Low (but bad)

### Req 2: Label Rename + Tooltips

**Single Approach — In-place label edits + hint text**
- Rename label: "Tipo de Actividad *" -> "Tipo de Evento *"
- Add hint: "Formato/modalidad del evento (congreso, webinar, etc.)"
- Rename label: "Categoría Dinámica" -> "Categoría"
- Add hint: "Clasificación temática desde el catálogo institucional"
- Move Categoría field ABOVE Tipo de Evento (swap positions) to make it primary selector
- Remove auto-fill side effect (lines 341-345) — it couples two distinct concepts
- Optionally rename "Tipo" column header in page.tsx to "Tipo de Evento"
- Effort: Low

### Req 3: Table Column Sorting

**Approach A — Client-side sort state (recommended)**
- Add sortColumn state (default 'start_date') and sortDir state (default 'asc')
- Compute sortedActivities from visibleActivities using stable comparator
- Replace static TableHead cells with clickable headers + toggle sort dir + show up/down arrows
- Career sort compares careerName(activity.career_id) strings
- Pros: No backend changes; instant response; consistent with current filtering model
- Cons: Sorts only the loaded/filtered page (acceptable given limit=100)
- Effort: Low

**Approach B — Server-side sort via query param**
- Add sort_by/sort_dir params to GET /scientific/
- Pros: Works at any scale
- Cons: Backend change, loading flicker on each header click, over-engineered
- Effort: Medium

---

## Recommendation

| # | Requirement | Recommended Approach | Effort |
|---|---|---|---|
| 1A | Global toggle role guard | Client-side role check in modal using useUser() | Low |
| 1B | Career pre-fill & lock | Pre-fill from user.careers, filter dropdown list | Low |
| 1C | Collaboration careers | New join table + schema extension | Medium |
| 2 | Label rename + tooltips | In-place label edit + hint text, swap field order, remove coupling side-effect | Low |
| 3 | Column sorting | Client-side sort state with default date ASC | Low |

Overall strategy: Req 1A, 1B, 2, and 3 are pure frontend changes and can be done in one pass.
Req 1C is the only item requiring a backend DB migration + schema update — treat as separate sub-task.

---

## Risks

1. **Collaboration careers DB migration**: Adding the join table requires an Alembic migration.
   Use standard PostgreSQL migration (no batch mode needed). Low risk but requires migration step.

2. **Auto-fill coupling removal (Req 2)**: Lines 341-345 currently auto-fill activity_type from category code.
   Removing this silently changes UX. Must be explicitly confirmed with the user in the proposal.

3. **Career pre-fill with multiple careers (Req 1B)**: A jefe_investigacion with 2+ careers will see
   a filtered dropdown — correct, but the first-career auto-selection (modal line 112) currently picks
   c[0] from the full list; after change it should pick from user.careers[0]. Edge case: empty user.careers
   (misconfigured account) must be handled gracefully.

4. **No AuthContext in page.tsx currently**: Neither actividades/page.tsx nor ActivityModal.tsx import
   useUser(). If we want to hide "Nueva Actividad" for read-only roles, that's follow-up — not in scope,
   but proximity invites scope creep. Flag this in the proposal.

5. **Sorting — career column**: careerName() returns "Global / Vicerrectorado" for null career_id.
   Alphabetical sort will group global activities together, which may be unexpected.
   Defaulting to date sort avoids confusion on initial load.

---

## Ready for Proposal

Yes — all three requirements are well-understood. The proposal should:
1. Confirm removal of the auto-fill side-effect (Req 2)
2. Confirm scope of Req 1C (collaboration careers) — specifically whether DB migration is in scope or deferred
3. Confirm whether "Nueva Actividad" button visibility should also be role-gated (currently out of scope)
