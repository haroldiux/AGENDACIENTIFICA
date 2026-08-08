# Exploration: Multi-Calendar Hierarchy, Research Roles & Activity Evidence Attachments

## Current State
Currently, `AcademicActivity` and `ScientificActivity` models in `backend/app/models/models.py` only store events linked directly to a single `career_id` (foreign key to `careers.id`). 
- **Global / Inherited Calendars**: There is no distinction between global activities (e.g. General Academic Calendar created by Vicerrectorado or Global Research Calendar created by Dirección de Investigación) and career-specific activities. The Fusion Engine (`backend/app/api/v1/fusion.py`) filters strictly by `AcademicActivity.career_id == career_id` and `ScientificActivity.career_id == career_id`, meaning career views cannot inherit global events where `career_id` is `NULL`.
- **Roles & Permissions**: `RoleEnum` supports `super_admin`, `admin`, `research`, `coordinator`, and `teacher`. Current endpoint checks in `scientific.py` allow `research` global access across all careers without scoping, while `coordinator` is scoped to `user.careers`. However, there is no explicit scoping for `jefe_investigacion` (research head per career) vs `director_investigacion` (global research director), nor clear isolation for `vicerrectorado` (general academic calendar authority).
- **Activity Evidence & Attachments**: `ScientificActivity` only holds a single string column `evidence_url` and basic `status` enum (`scheduled`, `in_progress`, `completed`, `cancelled`). `AcademicActivity` has no status tracking. There is no multi-file attachment model, no file upload endpoint for evidences/reports (PDFs, images, documents), and no execution metadata (e.g. `completed_at`, `file_type`, `file_size`, `uploaded_by`).

## Affected Areas
- `backend/app/models/models.py` — Update `RoleEnum` with explicit research and vicerrectorado roles (`director_investigacion`, `jefe_investigacion`, `vicerrectorado`), allow nullable `career_id` for global scope on `AcademicActivity` & `ScientificActivity`, add `ScientificActivityEvidence` model for multi-file attachment support.
- `backend/app/schemas/schemas.py` — Add schemas for `ActivityEvidence`, updated `RoleEnum`, update `AcademicActivityCreate`/`ScientificActivityCreate` to accept optional `career_id=None` (global scope), and updated filter parameters.
- `backend/app/api/v1/fusion.py` — Update calendar query logic to fetch both global events (`career_id IS NULL`) and career-specific events (`career_id == requested_career_id`), merging them cleanly.
- `backend/app/api/v1/academic.py` — Enforce permission checks: Vicerrectorado/Admin manages `career_id IS NULL` (General Academic Calendar), Coordinador manages career-specific academic events (`career_id IN user.careers`).
- `backend/app/api/v1/scientific.py` — Enforce permission checks: Director de Investigación manages global (`career_id IS NULL`) and all career scientific activities, Jefe de Investigación manages career scientific activities (`career_id IN user.careers`). Add attachment CRUD & file upload/download endpoints.
- `backend/app/services/scientific_service.py` & `backend/app/services/fusion_service.py` — Add query methods supporting hierarchy inheritance and file upload persistence.
- `frontend/app/lib/api.ts` — Update TypeScript interfaces and client API methods for role handling, global activity creation, evidence uploading/retrieval.
- `frontend/app/calendario/page.tsx` — Render badges indicating event scope (General / Vicerrectorado vs Carrera vs Global Investigación).
- `frontend/app/actividades/components/ActivityModal.tsx` — Add support for global vs career scope selection, file upload dropzone for attachments (PDFs/images), and multi-evidence status management.

## Approaches

1. **Option 1: Nullable `career_id` + Scope Filter in Fusion Engine + Dedicated `ScientificActivityEvidence` Model**
   - **Description**: Allow `career_id` to be `NULL` (indicating global/institutional scope). In `fusion.py`, query `(AcademicActivity.career_id == career_id OR AcademicActivity.career_id.is_(None))` and `(ScientificActivity.career_id == career_id OR ScientificActivity.career_id.is_(None))`. Introduce a separate table `scientific_activity_evidences` linked to `scientific_activities` with `filename`, `file_path`, `file_type`, `file_size`, `uploaded_at`, `uploaded_by_id`. Refine `RoleEnum` with explicit `director_investigacion`, `jefe_investigacion`, `vicerrectorado`, `coordinador`, `docente`.
   - **Pros**: Clean model hierarchy with backwards compatibility, minimal schema friction, accurate multi-tenant career inheritance.
   - **Cons**: Requires migration for `career_id` nullable support and new table creation.
   - **Effort**: Medium

2. **Option 2: Explicit Scope Flag (`is_global` / `scope`) + Poly-association Attachment System**
   - **Description**: Add an explicit `scope` enum column (`global`, `career`) to both activity tables, along with nullable `career_id`. Create a generic `ActivityAttachment` table with polymorphic `activity_type` ('academic', 'scientific'). Refine RBAC with dynamic scope policy engine.
   - **Pros**: Flexible for future entities (e.g. faculty-level calendars).
   - **Cons**: Higher complexity, polymorphic foreign keys in SQL cause lack of database-level referential integrity without complex triggers.
   - **Effort**: High

3. **Option 3: Separate `GeneralAcademicCalendar` & `GlobalResearchCalendar` Tables**
   - **Description**: Create new database tables for global calendars and union them in API requests.
   - **Pros**: Total isolation of global tables.
   - **Cons**: Duplicates code, queries, endpoints, and UI modal logic; harder to maintain consistency across global and career activities.
   - **Effort**: High

## Recommendation
**Option 1** is recommended. Using nullable `career_id` cleanly represents hierarchy:
- `career_id IS NULL` = Global event created by Vicerrectorado (Academic) or Dirección de Investigación (Scientific).
- `career_id = X` = Career-specific event created by Coordinador (Academic) or Jefe de Investigación (Scientific).
The Fusion engine can trivially combine `career_id == X OR career_id IS NULL`. The `ScientificActivityEvidence` table provides clean multi-file evidence attachment support (PDFs, images, reports) without breaking existing single `evidence_url` fields.

## Risks
- **Permission Leakage**: If role checks don't verify `career_id` association in `user.careers` for `jefe_investigacion` or `coordinador`, users could edit other careers' activities or modify global events.
- **File Storage Management**: Uploading large evidence files requires secure directory storage (e.g. `uploads/evidences/`) and validation of file extension/mime types (PDF, PNG, JPG, DOCX).

## Ready for Proposal
Yes — ready for proposal phase (`sdd-propose`).
