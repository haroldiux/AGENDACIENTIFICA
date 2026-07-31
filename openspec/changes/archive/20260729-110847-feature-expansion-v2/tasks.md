# Task Checklist: Feature Expansion v2

## Phase 1: Monorepo & Infrastructure Setup
- [x] Add `pandas`, `openpyxl`, and `python-multipart` to backend `requirements.txt` / `pyproject.toml`.
- [x] Rebuild backend Docker images to include the new dependencies.
- [x] Verify Jenkins pipeline is prepared to execute new Alembic migrations.

## Phase 2: Backend Development (Database & API)
- [x] Define the `Sede` model in `backend/app/models/` (id, name).
- [x] Create the `SedeCareer` associative table (many-to-many relationship).
- [x] Update the existing `Career` model to include the `sedes` relationship.
- [x] Generate Alembic migration script for the new tables and columns (`alembic revision --autogenerate`).
- [x] Apply Alembic migrations locally to verify additive changes (`alembic upgrade head`).
- [x] Implement CRUD endpoints for `Sede` (e.g., `GET /api/sedes`).
- [x] Implement the `POST /api/actividades` endpoint to accept the `ActivityCreate` schema and save it to the DB.

## Phase 3: Frontend Development (UI & Components)
- [x] Implement a functional "Nueva Actividad" button in the `actividades` view.
- [x] Create an activity creation modal or dedicated page (`/actividades/nueva`).
- [x] Build the frontend form to collect all required fields for a new activity.
- [x] Wire the activity creation form to the `POST /api/actividades` backend endpoint.
- [x] Implement the `UploadDropzone` component using `react-dropzone` for `.xlsx` drag-and-drop.
- [x] Add upload progress indicators to the frontend UI.
- [x] Implement robust toast notifications for creation and upload success/failure.

## Phase 4: Import Module (Excel Bulk Upload)
- [x] Create the `POST /api/upload-excel` backend endpoint accepting `UploadFile`.
- [x] Implement the Excel parsing flow using `pandas.read_excel(file.file)` to load data into a DataFrame.
- [x] Define the `ActivityRowValidator` Pydantic schema for strict row-level validation.
- [x] Implement iteration logic over DataFrame records to validate each row.
- [x] Implement separation logic for valid rows and validation errors (`ValidationError`).
- [x] Bulk-insert valid records using `session.bulk_insert_mappings()` or `session.add_all()` in a single transaction.
- [x] Format and return a JSON response with `inserted_count` and specific row `errors`.

## Phase 5: Verification & Testing
- [ ] Write backend unit tests using `pytest` for Excel uploads (simulate files with `io.BytesIO`).
- [ ] Write tests validating correct and malformed data against the Pydantic schemas.
- [ ] Write database tests to verify the M:N relationship (inserting a `Sede`, linking to `Career`s, querying).
- [ ] Write frontend component tests for `UploadDropzone` (e.g., rejecting `.pdf` files).

## Phase 6: Rollout & Deployment
- [ ] Deploy Alembic database migrations.
- [ ] Deploy updated FastAPI backend services.
- [ ] Deploy updated Next.js frontend application.
- [ ] Perform post-deployment verification of new features (Activity Creation, Bulk Upload, Sede associations).
