# Design: Conflict Report

## Technical Approach

Add a dedicated conflict-detection service and FastAPI endpoint, then extend the existing async reports pipeline to export conflict data as PDF and Excel. The overlap predicate lives in one service module so the endpoint and worker use identical rules. Existing report types and the fusion calendar remain untouched.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| Overlap logic location | Inline in router + worker | Duplicated, diverges | Centralized `conflict_service.py` |
| Date overlap predicate | SQL `BETWEEN` / OR conditions | DB-specific, harder to unit test | Python predicate: `a.start <= b.end and b.start <= a.end` |
| Activity loading | Single joined SQL query | Complex with two heterogeneous tables | Query both tables separately, filter by career/gestión/status in SQL, compare in Python |
| Conflict report dispatch | Separate Celery task | More tasks to maintain | Reuse existing tasks, branch inside worker on `report_type` |
| Excel library | pandas | Already installed, but heavier for simple rows | openpyxl (already installed, direct row writing) |
| Worker DB access | Pass SQLAlchemy objects | Serialization issues with Celery | Query inside task with `SessionLocal`, call service function |

**Rationale**: Keeping the predicate in Python makes edge-case unit tests trivial and matches the current test style. Querying both tables separately fits the existing SQLAlchemy models and avoids a cross-table join that is not strictly needed for expected data volumes. Branching inside the existing worker tasks minimizes new Celery plumbing.

## Data Flow

### Synchronous conflict list

```
Frontend reportes page
        │
        ▼
GET /api/v1/conflicts?career_id=&gestion_id=
        │
        ▼
backend/app/api/v1/conflicts.py
        │
        ▼
backend/app/services/conflict_service.py
        │
        ├── query AcademicActivity by career_id, gestion_id
        ├── query ScientificActivity by career_id, gestion_id, status != cancelled
        └── apply overlap predicate
        │
        ▼
ConflictListResponse JSON
```

### Async conflict export

```
Frontend reportes page
        │
        ▼
POST /api/v1/reports/generate {format, report_type="conflict", career_id, gestion_id}
        │
        ▼
backend/app/api/v1/reports.py
        │
        ▼
Celery: generate_pdf_report_task / generate_excel_report_task
        │
        ▼
backend/app/workers/reports_worker.py
        │
        ├── report_type == "conflict" ? build_conflict_pdf / build_conflict_excel
        │   └── calls conflict_service.find_conflicts(db, career_id, gestion_id)
        └── report_type != "conflict" ? existing branches
        │
        ▼
Status polling → download via /reports/{task_id}/download
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/app/services/conflict_service.py` | Create | `find_conflicts`, `_overlaps`, and query helpers. |
| `backend/app/api/v1/conflicts.py` | Create | `GET /api/v1/conflicts` with required query params. |
| `backend/app/schemas/schemas.py` | Modify | Add `ConflictItem`, `ConflictListResponse`; extend `ReportRequest.report_type` Literal. |
| `backend/app/api/v1/api.py` | Modify | Include `conflicts.router` under `/conflicts`. |
| `backend/app/api/v1/reports.py` | Modify | Pass `report_type` to Excel task; dispatch conflict to worker. |
| `backend/app/workers/reports_worker.py` | Modify | Add `build_conflict_pdf`, `build_conflict_excel`, and conflict branches. |
| `frontend/lib/api.ts` | Modify | Add `ConflictItem`, `ConflictListResponse`, `ConflictFilters`; extend `ReportType` with `"conflict"`; add `api.conflicts.list`. |
| `frontend/app/reportes/page.tsx` | Modify | Enable conflict card with PDF/Excel export buttons wired to `report_type="conflict"`. |
| `backend/tests/test_conflicts.py` | Create | Service unit tests and endpoint integration tests. |
| `backend/tests/test_reports_worker.py` | Create | Worker conflict PDF/Excel generation tests. |

## Interfaces / Contracts

### Conflict service

```python
# backend/app/services/conflict_service.py
from sqlalchemy.orm import Session
from app.schemas.schemas import ConflictItem

def find_conflicts(
    db: Session,
    career_id: int,
    gestion_id: int,
) -> list[ConflictItem]: ...

def _overlaps(start_a: date, end_a: date, start_b: date, end_b: date) -> bool: ...
```

### Conflict router

```python
# backend/app/api/v1/conflicts.py
@router.get("/", response_model=ConflictListResponse)
def get_conflicts(
    career_id: int = Query(..., ge=1),
    gestion_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
): ...
```

### Schema additions

```python
class ConflictItem(BaseModel):
    academic_id: int
    academic_title: str
    scientific_id: int
    scientific_title: str
    scientific_type: ScientificActivityType
    scientific_start_date: date
    scientific_end_date: date

class ConflictListResponse(BaseModel):
    conflicts: list[ConflictItem]

class ReportRequest(BaseModel):
    ...
    report_type: Literal["table", "research-agenda", "conflict"] = "table"
```

### Worker dispatch

```python
@celery_app.task
def generate_pdf_report_task(career_id, gestion_id, report_type="table"):
    if report_type == "conflict": build_conflict_pdf(...)
    elif report_type == "research-agenda": ...
    else: _build_table_report(...)

@celery_app.task
def generate_excel_report_task(career_id, gestion_id, report_type="table"):
    if report_type == "conflict": build_conflict_excel(...)
    else: _build_table_excel(...)  # existing stub replacement or branch
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `_overlaps` predicate edge cases | Direct function calls with same-day, contained, touching, disjoint ranges. |
| Unit | Cancelled scientific activities excluded | Create cancelled + scheduled scientific rows, assert pair is absent. |
| Integration | `GET /api/v1/conflicts` | Use existing `client` fixture with SQLite override; seed activities; assert 200 and shape. |
| Integration | Missing query params | Call endpoint without `gestion_id`, assert 422. |
| Worker | Conflict PDF/Excel output | Call worker functions directly with `SessionLocal` over test DB or mocked list; assert file exists and is non-empty. |
| Regression | Existing report types | Generate `table` and `research-agenda` reports and verify unchanged behavior. |

Tests reuse the existing `conftest.py` in-memory SQLite setup and `client` fixture. The `get_db` dependency is overridden per test transaction so DB state is isolated.

## Migration / Rollout

No migration required. The change adds new code and extends an existing Literal; no database schema changes.

## Open Questions

- [ ] Should the Excel export use a branded header / column order, or plain rows only?
- [ ] Should the conflict card expose separate PDF and Excel buttons, or a single export trigger?
