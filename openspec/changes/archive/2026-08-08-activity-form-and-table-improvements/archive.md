# Archive: Activity Form & Table Improvements

## Final Status
**Completed successfully** — archived 2026-08-08T12:01 (UTC-4)

## Change Metadata

| Field | Value |
|---|---|
| Change Name | `activity-form-and-table-improvements` |
| Project | AGENDA CIENTIFICA |
| Archived At | 2026-08-08T12:01 (UTC-4) |
| Archiver | sdd-archive agent |
| Archive Path | `openspec/changes/archive/2026-08-08-activity-form-and-table-improvements/` |

---

## Summary of Changes

This change introduced full-stack improvements to the scientific activity creation/editing workflow and the activities table view. The implementation spanned 7 phases across backend (DB -> Models -> Schemas -> API) and frontend (API client -> Modal -> Table).

### Key Features Delivered

1. **Collaboration Careers** - New `scientific_activity_collaboration_careers` join table enables linking a `ScientificActivity` to multiple additional careers. Includes Alembic migration (`a1b2c3d4e5f6`), ORM relationship, `@property collaboration_career_ids`, schema fields in Create/Update/Response, and POST/PUT handler logic with replace-all semantics.

2. **Role-Gated Global Activity Toggle** - `ActivityModal.tsx` hides the "Es actividad global/institucional" toggle for `jefe_investigacion` and `coordinador` roles via `canSetGlobal` derived from `useUser()`.

3. **Career Dropdown Pre-fill** - Career dropdown auto-populates and restricts options to `user.careers` for career-scoped roles; disabled when single career or edit mode; falls back to full list when `user.careers` is empty.

4. **Activity Form Field Renaming & Reordering** - "Tipo de Actividad" -> "Tipo de Evento", "Categoria Dinamica" -> "Categoria"; Categoria rendered above Tipo de Evento; hint text added beneath each field.

5. **Category-ActivityType Decoupling** - Removed side-effect that overwrote `activity_type` when `category_id` changed.

6. **Collaboration Careers Multi-Select** - New `<select multiple>` "Carreras en Colaboracion" in `ActivityModal.tsx`, filtered to exclude primary career; pre-populated on edit.

7. **Sortable Activities Table** - `/actividades` table supports client-side sort by Nombre, Fecha, Tipo, Carrera, Estado. Default: Fecha ASC. ChevronUp/ChevronDown indicators per column.

---

## Specs Synced into Main

| Delta Spec | Main Spec | Requirements Merged |
|---|---|---|
| `changes/.../specs/activities/spec.md` | `specs/activities/spec.md` | Collaboration Careers Association, Collaboration Career IDs in Schemas, Alembic Migration for Collaboration Careers, Dynamic Category decoupling scenario |
| `changes/.../specs/auth-roles/spec.md` | `specs/auth-roles/spec.md` | Role-Gated Global Activity Toggle, Career-Scoped Career Dropdown Pre-fill |
| `changes/.../specs/ui/spec.md` | `specs/ui/spec.md` | Activity Form Field Renaming and Ordering, Collaboration Careers Multi-Select in Activity Form, Sortable Columns on Activities Table |

---

## Verification Summary

All 7 task phases verified at `2026-08-08T11:56 (UTC-4)` by sdd-verify agent:

- `npx tsc --noEmit` -> Exit 0, zero TypeScript errors
- `npm run build` -> Exit 0, 10/10 pages built
- Backend Python imports -> OK
- `alembic current` -> `a1b2c3d4e5f6 (head)`
- All 21 spec scenarios: **PASS** (2 non-blocking warnings)

### Non-Blocking Warnings
1. `coordinador` vs `coordinator` in auth-roles spec - DB enum uses `coordinator`; design.md documents the discrepancy. No code change needed.
2. `alembic downgrade` not live-tested - downgrade body is correct by inspection; live DB preserved at head.

---

## Files Changed (Implementation)

| File | Change |
|---|---|
| `backend/alembic/versions/a1b2c3d4e5f6_add_collaboration_careers.py` | New migration |
| `backend/app/models/models.py` | Join table, relationship, @property |
| `backend/app/schemas/schemas.py` | collaboration_career_ids on Create/Update/Response |
| `backend/app/api/v1/scientific.py` | POST/PUT collab IDs pop + persist |
| `frontend/lib/api.ts` | collaboration_career_ids on TS interface |
| `frontend/app/actividades/components/ActivityModal.tsx` | Role guard, career pre-fill, collab multi-select, label rename, field reorder, category decoupling |
| `frontend/app/actividades/page.tsx` | SortKey, sortState, comparator, SortIcon |

---

## Risks

None - production-ready as of verification date.
