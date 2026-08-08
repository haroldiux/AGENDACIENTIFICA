# Tasks: Dynamic Activity Categories Managed by Vicerrectorado / Dirección Académica

## Phase 1: Database & Models
- [x] `backend/app/models/models.py`: Define `ActivityCategory` SQLAlchemy model (`id`, `name`, `code`, `scope`, `color`, `description`, `is_active`) and add optional `category_id` foreign key relationships to `AcademicActivity` and `ScientificActivity`.
- [x] `backend/alembic/versions/f9b2c3d4e5f6_add_activity_categories.py`: Create Alembic migration script to add `activity_categories` table, `category_id` foreign keys to activity tables, and seed initial dynamic categories from legacy enum values.

## Phase 2: Schemas & Backend Core Services
- [x] `backend/app/schemas/schemas.py`: Add Pydantic schemas for category creation, update, and response (`ActivityCategoryBase`, `ActivityCategoryCreate`, `ActivityCategoryUpdate`, `ActivityCategoryResponse`), and extend activity creation/response schemas with `category_id`.
- [x] `backend/app/api/v1/categories.py`: Implement `/api/v1/categories/` REST CRUD endpoints with role protection (`vicerrectorado`, `admin`, `super_admin`, `director_investigacion`), code uniqueness enforcement, and scope/active filtering.
- [x] `backend/app/api/v1/api.py`: Register `categories.router` in the main v1 API router under the `/categories` path prefix.

## Phase 3: Activity Endpoints & Import Updates
- [x] `backend/app/api/v1/academic.py`: Update academic activity CRUD handlers to support optional `category_id` assignment and retrieval.
- [x] `backend/app/api/v1/scientific.py`: Update scientific activity CRUD handlers to support optional `category_id` assignment and retrieval.
- [x] `backend/app/api/v1/importacion.py`: Implement dynamic category resolution (by name or code against active categories) during Excel import, with fallback to legacy string fields.

## Phase 4: Frontend API & Components
- [x] `frontend/lib/api.ts`: Add `ActivityCategory` TypeScript interface and client API functions (`getCategories`, `createCategory`, `updateCategory`, `deleteCategory`).
- [x] `frontend/app/actividades/components/ActivityModal.tsx`: Integrate dynamic category fetching by scope ('academic', 'scientific', 'both') and bind `category_id` to activity creation/edition forms.
- [x] `frontend/app/configuracion/categorias/page.tsx`: Create Category Management view for Vicerrectorado/Admin roles with category table, status toggling, and creation/editing modals.
