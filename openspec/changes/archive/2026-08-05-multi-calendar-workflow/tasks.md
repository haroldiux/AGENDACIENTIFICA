# Tasks: Multi-Calendar Hierarchy, Research Roles & Activity Evidence Attachments

## Phase 1: Database & Schemas
- [x] `backend/app/models/models.py`: Add `vicerrectorado`, `director_investigacion`, and `jefe_investigacion` to `RoleEnum`, make `career_id` nullable in `AcademicActivity` and `ScientificActivity`, and introduce `ScientificActivityEvidence` model.
- [x] `backend/app/schemas/schemas.py`: Update `RoleEnum`, make `career_id` optional in activity creation schemas, add `scope` to `MergedCalendarItem`, and add evidence upload/response schemas.
- [x] `backend/alembic/versions/xxx_multi_calendar_and_evidence.py`: Generate Alembic migration script for updated `RoleEnum`, nullable `career_id`, and `scientific_activity_evidences` table.

## Phase 2: Auth & API Endpoints
- [x] `backend/app/api/deps.py`: Add `check_activity_scope_permission` helper to enforce scope boundary validation based on user role and assigned careers.
- [x] `backend/app/api/v1/fusion.py`: Update Fusion Engine query to merge global events (`career_id IS NULL`) with career-scoped events and append `scope` metadata to items.
- [x] `backend/app/api/v1/academic.py`: Implement scope-aware permission validation for creating, updating, and deleting academic activities.
- [x] `backend/app/api/v1/scientific.py`: Implement scope-aware permission validation and add evidence endpoints (`POST /{id}/evidence`, `GET /{id}/evidence`, `DELETE /evidence/{evidence_id}`).

## Phase 3: Frontend Client Integration
- [x] `frontend/lib/api.ts`: Update TypeScript interfaces (`RoleEnum`, `MergedCalendarItem`, `ScientificActivityEvidence`) and implement evidence upload, listing, and deletion API calls.

## Phase 4: Frontend UI & Components
- [x] `frontend/components/calendar/CalendarView.tsx`: Display visual scope badges ("Global" vs "Carrera") on calendar activity cards and detail modals.
- [x] `frontend/app/calendario/page.tsx`: Implement global calendar scope selection (`career_id = null`) in calendar page filters.
- [x] `frontend/app/actividades/components/ActivityModal.tsx`: Add file attachment dropzone and evidence list management to the scientific activity modal.

## Phase 5: Verification & Testing
- [x] `backend/tests/test_multi_calendar.py`: Implement unit and integration pytest cases for global activity fusion, scope RBAC permissions, and evidence file attachment storage.

