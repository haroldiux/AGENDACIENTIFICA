# Tasks: Activity Form & Table Improvements

> **Change**: `activity-form-and-table-improvements`
> **Tracks**: Backend (DB → Models → Schemas → API) then Frontend (API client → Modal → Table)

---

## Phase 1: Database Migration

- [x] `backend/alembic/versions/a1b2c3d4e5f6_add_collaboration_careers.py`: Create new Alembic migration file. In `upgrade()`, emit `op.create_table('scientific_activity_collaboration_careers', ...)` with columns `activity_id` (FK → `scientific_activities.id`, PK) and `career_id` (FK → `careers.id`, PK) and a composite PK. In `downgrade()`, emit `op.drop_table('scientific_activity_collaboration_careers')`. Set `revision = 'a1b2c3d4e5f6'` and chain `down_revision` to the current head (`f9b2c3d4e5f6`).

## Phase 2: Backend — Models

- [x] `backend/app/models/models.py`: Add the `scientific_activity_collaboration_careers` join `Table` object (mirroring the `user_career_association` / `sede_career_association` pattern) with columns `activity_id` (FK → `scientific_activities.id`) and `career_id` (FK → `careers.id`) and a composite PK.
- [x] `backend/app/models/models.py`: Add a `collaboration_careers` SQLAlchemy `relationship("Career", secondary=scientific_activity_collaboration_careers, viewonly=False)` to the `ScientificActivity` ORM class.
- [x] `backend/app/models/models.py`: Add a `@property collaboration_career_ids` on `ScientificActivity` that returns `[c.id for c in self.collaboration_careers]` so Pydantic `from_attributes=True` can serialize it automatically.

## Phase 3: Backend — Schemas

- [x] `backend/app/schemas/schemas.py`: Add `collaboration_career_ids: Optional[List[int]] = []` field to `ScientificActivityCreate`.
- [x] `backend/app/schemas/schemas.py`: Add `collaboration_career_ids: Optional[List[int]] = []` field to `ScientificActivityUpdate`.
- [x] `backend/app/schemas/schemas.py`: Add `collaboration_career_ids: List[int] = []` field to `ScientificActivityResponse` (non-optional; always returned). Confirm `model_config` has `from_attributes=True` so the ORM property is picked up automatically.

## Phase 4: Backend — API Endpoint

- [x] `backend/app/api/v1/scientific.py`: In the **POST** (create) handler, after `model_dump()`-ing the payload: pop `collaboration_career_ids`, create and flush the `ScientificActivity` row, then assign `db_activity.collaboration_careers = db.query(Career).filter(Career.id.in_(collab_ids)).all()` (or `[]` if empty), and commit.
- [x] `backend/app/api/v1/scientific.py`: In the **PUT** (update) handler, apply the same replace-all pattern: pop `collaboration_career_ids` from the update dict, reassign `db_activity.collaboration_careers` to the newly queried `Career` objects (or `[]`), and commit. SQLAlchemy handles the delete-old/insert-new cycle via the relationship.

## Phase 5: Frontend — API Client

- [x] `frontend/lib/api.ts`: Add `collaboration_career_ids?: number[]` to the `ScientificActivity` TypeScript interface.
- [x] `frontend/lib/api.ts`: Add `collaboration_career_ids?: number[]` to the create-activity and update-activity payload shapes so the field is forwarded in `POST` and `PUT` calls.

## Phase 6: Frontend — Activity Modal

- [x] `frontend/app/actividades/components/ActivityModal.tsx`: Import `useUser` from `@/context/AuthContext` and destructure `user` from it at the top of the component.
- [x] `frontend/app/actividades/components/ActivityModal.tsx`: **Req 1A — Role guard**: Derive `const canSetGlobal = !['jefe_investigacion', 'coordinator'].includes(user?.role ?? '')` and wrap the "Es actividad global/institucional" toggle `<div>` with `{canSetGlobal && (...)}` so it is removed from the DOM for restricted roles.
- [x] `frontend/app/actividades/components/ActivityModal.tsx`: **Req 1B — Career pre-fill**: After fetching `careers`, derive `userCareers = user?.careers ?? []` and `effectiveCareers = userCareers.length > 0 ? careers.filter(c => userCareers.some(u => u.id === c.id)) : careers`. On create, default `formData.career_id` to `String(userCareers[0]?.id ?? '')`. Set the career `<select>` to `disabled` when `isEdit || isGlobal || userCareers.length === 1`. Render only `effectiveCareers` as options.
- [x] `frontend/app/actividades/components/ActivityModal.tsx`: **Req 1C — Collaboration multi-select state**: Add `collaboration_career_ids: number[]` to the `formData` initial state. On edit-mode open, populate it from `activity.collaboration_career_ids ?? []`. Include it in the create and update API call payloads.
- [x] `frontend/app/actividades/components/ActivityModal.tsx`: **Req 1C — Collaboration multi-select UI**: Render a `<select multiple>` with label "Carreras en Colaboración" positioned below the primary career dropdown. Options are `effectiveCareers.filter(c => c.id !== Number(formData.career_id))`. Style to match existing inputs (dark background, `border-[var(--border)]`, `rounded-lg`). Wire `onChange` to update `formData.collaboration_career_ids`.
- [x] `frontend/app/actividades/components/ActivityModal.tsx`: **Req 2 — Field reorder**: Move the Categoria field row above the Tipo de Evento field row in the JSX DOM order.
- [x] `frontend/app/actividades/components/ActivityModal.tsx`: **Req 2 — Label rename + hint text**: Change label "Categoria Dinamica" to "Categoria" and add `<p className="text-xs text-muted-foreground mt-1">Clasifica la actividad segun su naturaleza tematica.</p>` beneath it. Change label "Tipo de Actividad" to "Tipo de Evento" and add `<p className="text-xs text-muted-foreground mt-1">Formato o modalidad del evento cientifico.</p>` beneath it.
- [x] `frontend/app/actividades/components/ActivityModal.tsx`: **Req 2 — Remove auto-fill side-effect**: In the Categoria `onChange` handler, delete the `setFormData(prev => ({...prev, activity_type: codeLower}))` side-effect block entirely so changing "Categoria" no longer overwrites the "Tipo de Evento" field.

## Phase 7: Frontend — Activities Page (Table Sort)

- [x] `frontend/app/actividades/page.tsx`: Add `SortKey` type alias (`type SortKey = 'nombre' | 'fecha' | 'tipo' | 'carrera' | 'estado'`) and `sortState` React state (`useState<{col: SortKey; dir: 'asc' | 'desc'}>`) initialized to `{ col: 'fecha', dir: 'asc' }`.
- [x] `frontend/app/actividades/page.tsx`: Add a `comparator` function (or inline sort callback) that sorts `visibleActivities` by `sortState.col` and `sortState.dir`, applied after the existing `.filter(status).filter(search)` chain.
- [x] `frontend/app/actividades/page.tsx`: Update each sortable `<th>` (Nombre, Fecha, Tipo, Carrera, Estado) to be a clickable element calling `handleSort(col: SortKey)` — toggles direction when the same column is clicked again, resets to ASC when a new column is selected.
- [x] `frontend/app/actividades/page.tsx`: Import `ChevronUp` and `ChevronDown` from `lucide-react`. Render the appropriate icon inside each sortable header: active sort icon (up/down) for the active column, neutral indicator for inactive columns.
