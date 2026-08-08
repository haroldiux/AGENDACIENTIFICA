# Design: Activity Form & Table Improvements

## Technical Approach

Five grouped work streams delivered across two tracks:

| Track | Work Streams |
|---|---|
| **Frontend-only** | Req 1A (role-gate toggle), Req 1B (career pre-fill/lock), Req 2 (labels, order, no auto-fill), Req 3 (client-side sort) |
| **Full-stack** | Req 1C (collaboration careers join table -> backend -> API -> frontend multi-select) |

---

## Architecture Decisions

### Decision: Collaboration careers as a `Table()` join object (not `relationship` secondary)
**Choice**: Define `scientific_activity_collaboration_careers` as a named `Table` object in `models.py` (same pattern as `user_career_association` and `sede_career_association`), then attach a `relationship("Career", secondary=..., viewonly=False)` to `ScientificActivity`.
**Alternatives considered**: A dedicated ORM class (`CollaborationCareer`) with its own model; or raw SQL `IN` queries without a relationship.
**Rationale**: Matches the existing codebase convention exactly. `viewonly=False` lets SQLAlchemy manage inserts/deletes when we reassign the list. No extra model class needed.

### Decision: Replace-all strategy for collaboration career updates
**Choice**: On PUT, delete all existing join rows and re-insert from the incoming list (vs. diffing and patching).
**Rationale**: Join table rows have no independent payload - replace-all is safe, simple, and the spec mandates it (section "Update activity clears old collaboration careers"). The `relationship` with `cascade` handles this cleanly by assigning a new list.

### Decision: Client-side sort state in `page.tsx` (no server changes)
**Choice**: A `useState<{col: SortKey; dir: 'asc' | 'desc'}>` initialized to `{col: 'fecha', dir: 'asc'}` drives a `.sort()` on `visibleActivities`.
**Rationale**: The proposal explicitly excludes server-side sort. All data is already in memory after the API fetch, so a simple comparator costs nothing extra.

### Decision: Multi-select implemented as a `<select multiple>` with Tailwind styling
**Choice**: Native `<select multiple>` element, styled to match the existing form inputs (dark background, border-[var(--border)], rounded-lg).
**Alternatives considered**: A third-party combobox (React Select, Downshift).
**Rationale**: Zero new deps; consistent with every other dropdown in `ActivityModal.tsx`; sufficient for the number of careers in scope.

---

## Data Flow

### Req 1C - Collaboration careers full-stack round-trip

```
ActivityModal (formData.collaboration_career_ids: number[])
  -> api.scientific.create/update({ ...payload, collaboration_career_ids })
  -> POST/PUT /api/v1/scientific/
  -> scientific.py endpoint
      * pops collaboration_career_ids from model_dump()
      * creates ScientificActivity row
      * reassigns db_activity.collaboration_careers = [Career objects]
      * db.commit()
  -> ScientificActivityResponse (collaboration_career_ids: [int, ...])
  -> ActivityModal pre-fills multi-select on edit open
```

### Req 3 - Client-side sort

```
page.tsx state: sortState = {col, dir}
  -> visibleActivities = activities
      .filter(status).filter(search)
      .sort(comparator(sortState))
  -> TableHead renders up/down arrow icon via ChevronUp/ChevronDown (lucide-react)
```

---

## File Changes

| File | Action | Description |
|---|---|---|
| `backend/alembic/versions/<new>_add_collaboration_careers.py` | **Create** | Migration: create `scientific_activity_collaboration_careers(activity_id FK, career_id FK, composite PK)`; upgrade/downgrade |
| `backend/app/models/models.py` | **Edit** | Add `scientific_activity_collaboration_careers` `Table` object; add `collaboration_careers` relationship to `ScientificActivity` |
| `backend/app/schemas/schemas.py` | **Edit** | Add `collaboration_career_ids: Optional[List[int]] = []` to `ScientificActivityCreate`, `ScientificActivityUpdate`, `ScientificActivityResponse` |
| `backend/app/api/v1/scientific.py` | **Edit** | POST: pop `collaboration_career_ids`, query `Career` objects, assign relationship. PUT: same replace-all logic |
| `frontend/lib/api.ts` | **Edit** | Add `collaboration_career_ids?: number[]` to `ScientificActivity` interface and create/update payload shapes |
| `frontend/app/actividades/components/ActivityModal.tsx` | **Edit** | Role guard, career pre-fill/lock, collaboration multi-select, label rename, field reorder, remove auto-fill coupling |
| `frontend/app/actividades/page.tsx` | **Edit** | Add sort state + comparator + clickable TableHead with direction indicator |

### `ActivityModal.tsx` edit detail

1. **Import** `useUser` from `@/context/AuthContext`.
2. **Role guard (Req 1A)**: `const canSetGlobal = !['jefe_investigacion','coordinator'].includes(user?.role ?? '')`. Wrap the global toggle div with `{canSetGlobal && (...)}`. Note: DB enum is `coordinator`, not `coordinador`.
3. **Career pre-fill/lock (Req 1B)**:
   - After fetching careers: `userCareers = user?.careers ?? []`.
   - `effectiveCareers = userCareers.length > 0 ? careers.filter(c => userCareers.some(u => u.id === c.id)) : careers`.
   - On create: default `career_id` to `String(userCareers[0]?.id ?? '')`.
   - `disabled` when `isEdit || isGlobal || userCareers.length === 1`.
4. **Collaboration multi-select (Req 1C)**:
   - Add `collaboration_career_ids: number[]` to `formData` initial state.
   - Render `<select multiple>` below primary career; options = `effectiveCareers.filter(c => c.id !== Number(formData.career_id))`.
   - On edit open: populate from `activity.collaboration_career_ids ?? []`.
   - Include in create/update payloads.
5. **Field reorder + rename (Req 2)**:
   - Move Categoria row **above** Tipo de Evento row in DOM order.
   - `"Categoria Dinamica"` label -> `"Categoria"` + `<p className="text-xs text-muted-foreground mt-1">Clasifica la actividad segun su naturaleza tematica.</p>`.
   - `"Tipo de Actividad"` -> `"Tipo de Evento"` + hint: `"Formato o modalidad del evento cientifico."`.
   - In Categoria `onChange`: **remove** the `setFormData(prev => ({...prev, activity_type: codeLower}))` side-effect block entirely.

---

## Interfaces / Contracts

### New Alembic migration (suggested revision ID: `a1b2c3d4e5f6`)
```sql
CREATE TABLE scientific_activity_collaboration_careers (
  activity_id INTEGER NOT NULL REFERENCES scientific_activities(id),
  career_id   INTEGER NOT NULL REFERENCES careers(id),
  PRIMARY KEY (activity_id, career_id)
);
```

### Updated backend schema fields
```python
# Added to ScientificActivityCreate, ScientificActivityUpdate, ScientificActivityResponse
collaboration_career_ids: Optional[List[int]] = []
```

### Endpoint mutation pattern (POST and PUT)
```python
# In create/update endpoint bodies:
collab_ids = activity_data.pop('collaboration_career_ids', []) or []
db_activity.collaboration_careers = (
    db.query(Career).filter(Career.id.in_(collab_ids)).all()
    if collab_ids else []
)
```

### `ScientificActivityResponse` serialization
Add a `@computed_field` or a plain field + `model_validator` that reads from the `collaboration_careers` relationship:
```python
collaboration_career_ids: List[int] = []
# populated via model_config from_attributes + property on ORM object
```
Preferred: add a Python `@property` on `ScientificActivity` model that returns `[c.id for c in self.collaboration_careers]` and expose it as a computed field.

### Updated frontend type
```typescript
// lib/api.ts - ScientificActivity interface
collaboration_career_ids?: number[];
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| **Alembic migration** | upgrade applies; downgrade drops table cleanly | `alembic upgrade head` + `alembic downgrade -1` on local dev DB |
| **Backend create** | `collaboration_career_ids=[2,3]` persists two rows; response echoes list | Manual Swagger UI POST |
| **Backend update replace-all** | Replace `[2,3]` with `[4]` -> join table has exactly one row | Manual Swagger UI PUT |
| **Backend empty field** | Omit field -> zero join rows | Manual POST without field |
| **Frontend role guard** | Log in as `jefe_investigacion` / `coordinator`; open modal; toggle absent | Manual browser test |
| **Frontend career pre-fill** | Single-career user -> dropdown disabled + pre-filled | Manual browser test |
| **Frontend multi-select save/load** | Create with 2 collab careers; re-open edit modal; multi-select pre-populated | Manual browser test |
| **Frontend sort** | Click Fecha twice: ASC then DESC; click Nombre: rows reorder correctly | Manual browser test |
| **Regression** | Existing CRUD (create, edit, delete, status update, evidence upload) remain functional | Manual smoke test |

---

## Migration / Rollout

1. **Deploy backend code** (schemas + model + endpoint changes); `collaboration_career_ids` defaults to `[]` — safe for existing DB.
2. **Run** `alembic upgrade head` on target DB — zero-data-loss DDL (CREATE TABLE only).
3. **Deploy frontend** — multi-select appears; existing activities show empty collab careers.
4. **Rollback**: `alembic downgrade -1` drops join table; revert backend + frontend commits independently.

---

## Open Questions

- **Role enum spelling**: The spec text says `coordinador` but the DB `RoleEnum` defines `coordinator`. Resolution: use `coordinator` in the frontend role check to match the token payload.
- **Multi-select height**: `<select multiple>` default browser rendering may be tall. Consider a fixed `size={4}` attribute or replace with checkboxes if UX review requires richer interaction.
- **`collaboration_career_ids` in response serialization**: SQLAlchemy `from_attributes=True` does not auto-serialize a relationship as IDs. Options: (a) `@property` on model + `model_config` picks it up, or (b) custom `model_validator(mode='before')` that flattens the relationship. Recommend option (a) — simpler and matches existing codebase.
