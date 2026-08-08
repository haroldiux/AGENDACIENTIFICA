# Proposal: Activity Form & Table Improvements

## Intent
Improve the activity creation/edit form with role-aware field behaviour, add a collaboration-careers multi-select backed by a new DB join table, decouple "Tipo de Evento" from "Categoría", and add client-side sortable columns to the activities table.

## Scope

### In Scope
- **Req 1A** — Hide the "Es actividad global/institucional" toggle from `jefe_investigacion` and `coordinator` (client-side role guard using `useUser()`).
- **Req 1B** — Pre-fill career dropdown from `user.careers`; lock to read-only when the user has exactly one career; restrict dropdown options to `user.careers` for career-scoped roles.
- **Req 1C** — New "Carreras en Colaboración" multi-select: Alembic migration, new `scientific_activity_collaboration_careers` join table, backend schema + persistence, frontend multi-select (excludes primary career).
- **Req 2** — Rename "Tipo de Actividad" → "Tipo de Evento", rename "Categoría Dinámica" → "Categoría", add hint text to each, swap field order (Categoría above Tipo de Evento), **remove** the auto-fill side-effect coupling `activity_type` from category code.
- **Req 3** — Client-side sortable columns: Nombre, Fecha, Tipo, Carrera, Estado; ↑/↓ indicator; default sort = Fecha ASC.

### Out of Scope
- Role-gating the "Nueva Actividad" button.
- Server-side sort/pagination.
- Renaming `activity_type` enum values in the DB.
- Backend-driven permissions array on `UserResponse`.

## Approach
1. **Frontend-only for Reqs 1A, 1B, 2, 3** — import `useUser()` into `ActivityModal.tsx` and `page.tsx`; add sort state; edit labels and render conditions.
2. **Full-stack for Req 1C** — Alembic migration → model relationship → schema fields → endpoint persistence → frontend multi-select.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `frontend/app/actividades/components/ActivityModal.tsx` | High | Add `useUser()`, hide global toggle by role, pre-fill/lock career, add collaboration multi-select, rename labels, add hints, swap field order, remove auto-fill coupling |
| `frontend/app/actividades/page.tsx` | Medium | Add sort state + comparator, clickable column headers with ↑/↓ icons |
| `frontend/lib/api.ts` | Low | Add `collaboration_career_ids?: number[]` to `ScientificActivity`, create/update payload types |
| `backend/app/models/models.py` | Medium | Add `scientific_activity_collaboration_careers` join table + relationship on `ScientificActivity` |
| `backend/app/schemas/schemas.py` | Low | Add `collaboration_career_ids: Optional[List[int]] = []` to create/update/response schemas |
| `backend/app/api/v1/scientific.py` | Low | Persist collaboration careers on create and update endpoints |
| `backend/alembic/` | Medium | New migration for `scientific_activity_collaboration_careers` table |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Alembic migration on production DB | Low | Standard PostgreSQL CREATE TABLE — no data loss; test on staging first |
| Auto-fill removal changes existing UX silently | Low | Confirmed in scope; add release note in PR description |
| `user.careers` empty (misconfigured account) | Low | Graceful fallback: show full career list and skip pre-fill |
| Career sort groups global activities unexpectedly | Low | Default sort is Fecha ASC — career sort is opt-in by click |

## Rollback Plan
- **Frontend** — revert commits to `ActivityModal.tsx` and `page.tsx`; no data impact.
- **Backend/DB** — run `alembic downgrade -1` to drop the join table before reverting backend code.

## Dependencies
- `useUser()` hook already exported from `AuthContext.tsx` — no new auth work.
- `user.careers` already populated in `UserResponse` from `GET /users/me` — no backend changes needed for Req 1B.
- Alembic migration must run before deploying Req 1C backend code.

## Success Criteria
- [ ] "Es actividad global" toggle is invisible to `jefe_investigacion` and `coordinator` roles.
- [ ] Career dropdown pre-fills from `user.careers` and is disabled when the user belongs to exactly one career.
- [ ] "Carreras en Colaboración" multi-select saves and loads correctly via the new join table.
- [ ] "Tipo de Evento" and "Categoría" labels appear correctly; changing Categoría does NOT auto-fill Tipo de Evento.
- [ ] Categoría field renders above Tipo de Evento in the form.
- [ ] Clicking a sortable column header sorts the visible activities; indicator toggles ↑/↓; default load is Fecha ASC.
- [ ] All existing CRUD operations for activities remain functional.
- [ ] Alembic migration applies and rolls back cleanly.
