# Dynamic Activity Categories Managed by Vicerrectorado / Dirección Académica

## Intent
Provide dynamic management of activity categories and types by Vicerrectorado and Dirección Académica, replacing hardcoded strings and Postgres enums with manageable database entities and custom permissions while preserving full backward compatibility.

## Scope
### In Scope
- `ActivityCategory` DB model (`id`, `name`, `code`, `scope`, `color`, `description`, `is_active`) with Alembic migration.
- Dynamic linking via `category_id` FK in `AcademicActivity` and `ScientificActivity`.
- CRUD REST API `/api/v1/categories/` with role checks (`vicerrectorado`, `admin`, `super_admin`, `director_investigacion`).
- Dynamic frontend dropdowns in `ActivityModal.tsx` and new management view `/configuracion/categorias`.
- Category resolution update in Excel import (`importacion.py`).

### Out of Scope
- Structural redesign of non-category activity fields.
- Hard schema breaking changes dropping legacy string/enum columns during this transition.

## Approach
Implement Approach 1: Standalone `ActivityCategory` table with `scope` ('academic', 'scientific', 'both'), soft deletion (`is_active`), and dual nullable foreign keys (`category_id`) on activity tables. Legacy `category` strings and `ScientificActivityType` enums are preserved as fallbacks. Alembic migration seeds initial categories from current enum values.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `backend/app/models/models.py` | Medium | Add `ActivityCategory` model and `category_id` FK to activities |
| `backend/app/schemas/schemas.py` | Medium | Pydantic schemas for Category CRUD and activity payload extensions |
| `backend/app/api/v1/categories.py` | High | New CRUD endpoints for category administration |
| `backend/app/api/v1/importacion.py` | Medium | Resolve dynamic categories during Excel import |
| `frontend/app/configuracion/categorias/page.tsx` | High | New Category Management UI for Vicerrectorado/Admin |
| `frontend/app/actividades/components/ActivityModal.tsx` | Medium | Dynamic category fetching and selection in modal |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Migration data misalignment | Low | Seed legacy enum values and map existing activity records in Alembic migration |
| Excel import validation failure | Medium | Dynamic category name/code lookup with fallback handling |
| Unauthorized category modification | Low | Restrict write endpoints to `vicerrectorado`, `admin`, `super_admin`, `director_investigacion` |

## Rollback Plan
Revert frontend routes and router inclusion in `api.py`. Nullify `category_id` FK columns via down-migration; legacy `category` string and `ScientificActivityType` enum columns remain intact and functional.

## Dependencies
- Existing role permission system (`deps.py`).
- PostgreSQL database & Alembic migration framework.

## Success Criteria
- [ ] Vicerrectorado and authorized roles can create, update, and deactivate categories via `/configuracion/categorias`.
- [ ] Activity creation modal dynamically populates categories based on activity type scope.
- [ ] Excel import successfully maps dynamic categories by name or code.
- [ ] Backward compatibility with existing activity records maintained.
