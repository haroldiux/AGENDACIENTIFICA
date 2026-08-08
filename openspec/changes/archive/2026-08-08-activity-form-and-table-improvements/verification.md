# Verification Report: Activity Form & Table Improvements

**Change**: `activity-form-and-table-improvements`
**Verified At**: 2026-08-08T11:56 (UTC-4)
**Verifier**: sdd-verify agent

---

## Verification Steps Performed

| Step | Command / Check | Result |
|---|---|---|
| Backend Python imports | `docker exec unitepc_backend python -c "..."` | OK |
| Alembic migration head | `docker exec unitepc_backend alembic current` | a1b2c3d4e5f6 (head) |
| TypeScript type check | `npx tsc --noEmit` | Exit 0, no errors |
| Frontend build | `npm run build` | Exit 0, 10/10 pages built |
| Code inspection: models.py | Manual review | Join table + relationship + property present |
| Code inspection: schemas.py | Manual review | collaboration_career_ids in Create/Update/Response |
| Code inspection: scientific.py | Manual review | POST/PUT handlers pop and persist collab IDs |
| Code inspection: api.ts | Manual review | collaboration_career_ids on interface |
| Code inspection: ActivityModal.tsx | Manual review | All 5 sub-tasks implemented |
| Code inspection: page.tsx | Manual review | Sort state, comparator, SortIcon, ChevronUp/Down |
| Migration file | Manual review | a1b2c3d4e5f6_add_collaboration_careers.py correct DDL |

---

## Spec Compliance Matrix

### specs/activities/spec.md

| Scenario | Status | Evidence |
|---|---|---|
| Create activity with collaboration careers | PASS | scientific.py POST assigns collaboration_careers; response serializes via ORM property |
| Update clears old collaboration careers (replace-all) | PASS | scientific.py PUT replaces list via relationship assignment |
| Empty collaboration_career_ids | PASS | Both POST and PUT branch to [] when empty |
| Response includes collaboration_career_ids | PASS | ScientificActivityResponse.collaboration_career_ids + ORM @property + from_attributes=True |
| Migration applies cleanly | PASS | alembic current shows a1b2c3d4e5f6 (head) |
| Migration rolls back cleanly | WARNING | Not tested live; downgrade() body is correct by inspection |
| Selecting category does NOT auto-fill activity_type | PASS | category_id onChange uses generic handleChange; no activity_type side-effect in code |

### specs/ui/spec.md

| Scenario | Status | Evidence |
|---|---|---|
| Modal renders "Tipo de Evento" (not "Tipo de Actividad") | PASS | ActivityModal.tsx: label "Tipo de Evento *" |
| Modal renders "Categoria" (not "Categoria Dinamica") | PASS | ActivityModal.tsx: label "Categoria" |
| "Categoria" field above "Tipo de Evento" in DOM | PASS | Categoria div precedes Tipo de Evento div in JSX |
| Hint text beneath Categoria | PASS | "Clasifica la actividad segun su naturaleza tematica." |
| Hint text beneath Tipo de Evento | PASS | "Formato o modalidad del evento cientifico." |
| Multi-select excludes primary career | PASS | .filter((c) => c.id !== Number(formData.career_id)) |
| Edit mode pre-fills collaboration careers | PASS | collaboration_career_ids: activity.collaboration_career_ids ?? [] on edit open |
| Default sort is Fecha ASC | PASS | useState<...>({ col: 'fecha', dir: 'asc' }) |
| Clicking column header sorts rows | PASS | handleSort() + comparator in sortedActivities.sort() |
| Toggling same column flips direction | PASS | prev.dir === 'asc' ? 'desc' : 'asc' logic |
| ChevronUp/Down indicator | PASS | SortIcon component uses ChevronUp/ChevronDown, opacity-30 for inactive |

### specs/auth-roles/spec.md

| Scenario | Status | Evidence |
|---|---|---|
| jefe_investigacion: toggle hidden | PASS | CAREER_SCOPED_ROLES includes jefe_investigacion; {canSetGlobal && (...)} wraps toggle |
| coordinador role: toggle hidden | WARNING | Spec says "coordinador" but DB enum is "coordinator". Implementation uses "coordinator" which is correct. Spec text has a typo documented in design.md. |
| vicerrectorado/director_investigacion: toggle visible | PASS | Not in CAREER_SCOPED_ROLES -> canSetGlobal = true |
| Single-career user: dropdown pre-filled + disabled | PASS | isCareerDisabled = ... || userCareers.length === 1; defaultCareerId = userCareers[0].id |
| Multi-career user: shows only user careers | PASS | effectiveCareers filtered to userCareers |
| Empty careers: shows full list | PASS | Fallback: userCareers.length > 0 ? ... : careers |

---

## Issues Found & Fixed

None. No bugs were introduced. All checks passed without code changes.

---

## Warnings (Non-Blocking)

1. **coordinador vs coordinator in spec**: auth-roles spec says coordinador but DB enum and token payload use coordinator. Design.md already documents and resolves this. No code change needed; the spec document has a typo.

2. **alembic downgrade not live-tested**: The downgrade() function is correct by inspection but was not executed to preserve the live DB head state.

---

## Build Summary

```
Next.js 14.2.3
Compiled successfully
Generating static pages (10/10)

Route                    Size      First Load JS
/actividades             7.34 kB   148 kB
```

- npx tsc --noEmit: exit 0, zero TypeScript errors
- npm run build: exit 0, 10/10 pages generated
- Backend import check: OK
- Alembic current: a1b2c3d4e5f6 (head)

---

## Final Status

**OK**

All 7 task phases implemented and verified. No critical issues. Two non-blocking warnings documented. Implementation is production-ready.
