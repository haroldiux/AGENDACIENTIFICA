## Exploration: Dynamic Activity Categories Managed by Vicerrectorado / Dirección Académica

### Current State
Currently, activity categories and types are split and hardcoded across backend and frontend models:
- **Academic Activities**: Stored as a string column `category` in the `AcademicActivity` model (e.g., "GENERAL", "EVALUACION", "FERIA", "EXAMEN").
- **Scientific Activities**: Stored using a PostgreSQL Enum `ScientificActivityType` ("congreso", "webinar", "defensa", "feria", "olimpiada", "master_class") in the `ScientificActivity` model.
- **Frontend Hardcoding**: `ActivityModal.tsx` and `agenda-helpers.ts` hardcode dropdown options and type labels.
- **Excel Import**: `importacion.py` hardcodes expected categories ("GENERAL", "FERIADO", etc.) and activity types in template generation and row validation.
- **Role Permissions**: `check_activity_scope_permission` in `deps.py` already checks roles such as `vicerrectorado`, `admin`, `director_investigacion`, but category management lacks dedicated permissions and CRUD endpoints.

### Affected Areas
- `backend/app/models/models.py` — Add new `ActivityCategory` model (`id`, `name`, `code`, `scope`, `color`, `description`, `is_active`, timestamps). Add optional `category_id` FK to `AcademicActivity` and `ScientificActivity` for backward compatibility and dynamic linking.
- `backend/app/schemas/schemas.py` — Add Pydantic schemas for `ActivityCategoryCreate`, `ActivityCategoryUpdate`, `ActivityCategoryResponse`, and update `AcademicActivity` and `ScientificActivity` schemas to include `category_id` and category details.
- `backend/app/api/v1/categories.py` (New) — CRUD API endpoints under `/api/v1/categories/` (`GET /`, `POST /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` / deactivate) with role checks (`vicerrectorado`, `admin`, `super_admin`, `director_investigacion`).
- `backend/app/api/v1/api.py` — Include new `/categories` router in main `api_router`.
- `backend/app/api/deps.py` — Add `check_category_manage_permission` helper.
- `backend/alembic/versions/` — New Alembic migration to create `activity_categories` table and add FK columns.
- `backend/app/api/v1/actividades.py`, `backend/app/api/v1/academic.py`, `backend/app/api/v1/scientific.py`, `backend/app/api/v1/importacion.py`, `backend/app/api/v1/fusion.py` — Update creation, lookup, template download, and fusion mapping to resolve category objects/IDs dynamically while preserving fallback logic.
- `frontend/lib/api.ts` — Add `Category` interface and `api.categories` namespace for CRUD calls.
- `frontend/app/actividades/components/ActivityModal.tsx` — Replace hardcoded `<option>` tags with dynamic categories fetched from API.
- `frontend/app/configuracion/categorias/page.tsx` (New UI View) — Category management interface for Vicerrectorado / Dirección Académica / Admin.
- `frontend/components/layout/Sidebar.tsx` — Add "Categorías" navigation item visible to authorized roles.

### Approaches

1. **Approach 1: Standalone ActivityCategory Table with Dual Foreign Keys and Soft Delete (Recommended)**
   - Create a unified `ActivityCategory` model (`id`, `name`, `code`, `scope` ['academic', 'scientific', 'both'], `color`, `description`, `is_active`).
   - Add nullable foreign keys `category_id` to both `AcademicActivity` and `ScientificActivity`.
   - Maintain backward compatibility: keep existing `category` (string) and `activity_type` (Enum/string) columns as fallback/read-only or auto-populated fields from category name/code.
   - Implement soft delete (`is_active = False`) so deactivating a category does not break historic activities.
   - Pros: High backward compatibility, zero downtime migration, clean dynamic UI dropdowns, flexible multi-domain scope.
   - Cons: Dual field persistence (`category_id` and string `category`/`activity_type`) during transition phase.
   - Effort: Medium

2. **Approach 2: Direct Migration replacing string/enum with Non-nullable Foreign Keys**
   - Create `ActivityCategory` table, populate with current values, add non-nullable `category_id` column, drop old string/enum columns.
   - Pros: Single source of truth, cleaner database schema.
   - Cons: Risk of breaking Excel imports, historical data loss if seed/unrecognized categories exist, breaking API consumers expecting legacy string representations.
   - Effort: High

3. **Approach 3: Polymorphic/Separate Category Tables (`AcademicCategory` & `ScientificCategory`)**
   - Create two distinct tables for academic and scientific categories.
   - Pros: Clear separation between academic and scientific domains.
   - Cons: Code duplication across API endpoints, schemas, frontend components, and database tables; harder for Vicerrectorado to manage unified view.
   - Effort: Medium-High

### Recommendation
Adopt **Approach 1**: Standalone `ActivityCategory` table with `scope` flag ('academic', 'scientific', 'both'), nullable `category_id` foreign keys on activities for full backward compatibility, soft-deletes (`is_active`), and a dedicated `/api/v1/categories/` router with Vicerrectorado/Admin UI control.

### Risks
- **Data Migration Risk**: Alembic migration must seed existing enum values ("congreso", "webinar", "defensa", etc.) and default academic categories into `activity_categories` and populate existing records' `category_id`s to prevent null reference issues.
- **Excel Import Compatibility**: `importacion.py` must lookup dynamic categories by name or code before saving, creating new categories or throwing user-friendly validation errors if inactive/unrecognized.
- **Role Permission Enforcement**: Ensure only `vicerrectorado`, `admin`, `super_admin`, and `director_investigacion` can mutate categories, while all active users can read active categories for forms and filters.

### Ready for Proposal
Yes — Clear scope, backward-compatible design, detailed file targets, and role boundary defined for Vicerrectorado / Dirección Académica.
