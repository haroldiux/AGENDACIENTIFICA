# Proposal: Feature Expansion v2

## Intent
The purpose of this change is to implement the "feature-expansion-v2" phase of the UNITEPC Scientific Agenda system. This focuses on fixing missing functionality in the frontend for creating activities, adding bulk upload capabilities via Excel, and refining the database schema to support Sedes (campuses) linked to Careers (M:N relationship).

## Scope
### In Scope
1. **Fixing frontend buttons and adding creation modals:** Make the "Nueva Actividad" button in `actividades` functional by adding a state-driven creation modal or a dedicated page (`/actividades/nueva`), and wiring it up to the backend.
2. **Adding Excel (`.xlsx`) bulk upload for activities:** Implement an API endpoint using FastAPI and `pandas`/`openpyxl` to parse and insert uploaded activities into PostgreSQL, and build a frontend drag-and-drop zone using `react-dropzone`.
3. **Modeling `Sede` and associating it with `Career` (M:N):** Create a `Sede` model (Cochabamba, La Paz, etc.) and establish a many-to-many relationship with the `Career` model, allowing a career to be taught across multiple campuses.

### Out of Scope
- Full automation of OCR for PDF/image calendar imports (deferred to later phases).
- User authentication and role-based access control adjustments beyond what is necessary for these specific features.
- Advanced reporting and analytics based on the uploaded activities.

## Approach
- **Frontend (Next.js 14 App Router):** Add state management for modals or new page routing for activity creation. Implement a file upload component with `react-dropzone`, showing progress and feedback toasts.
- **Backend (FastAPI):** Introduce the `POST /api/upload-excel` endpoint. Process Excel files using `pandas`, validate rows with Pydantic schemas, and bulk-insert via SQLAlchemy.
- **Database (PostgreSQL 16):** Create the `Sede` table and an associative `SedeCareer` table using SQLAlchemy models and Alembic migrations.
- **Background Processing (Celery/Redis):** While bulk upload could be synchronous for small files, Celery can be integrated for large file processing if necessary (currently focusing on synchronous or simple async backend operations based on file size).
- **Infrastructure (Docker Compose v2 / Nginx):** Ensure the new dependencies (`pandas`, `openpyxl`, `python-multipart`) are added to the backend `requirements.txt` / `pyproject.toml` and built into the Docker images.
- **CI/CD (Jenkins):** Leverage the existing Jenkins pipeline for automated testing and migrations (`alembic upgrade head`) before deploying.

## Affected Areas
- **Frontend:** `frontend/app/actividades/page.tsx` (and potentially new components like `ActivityModal` or `UploadDropzone`).
- **Backend API:** New endpoints for Excel upload, CRUD operations for `Sede`.
- **Database / Models:** `backend/app/models/` (New `Sede` and `SedeCareer` models, updates to `Career` if necessary), `backend/alembic/versions/` (New migrations).

## Risks & Mitigation
- **Risk:** Malformed or maliciously crafted Excel files causing backend crashes.
  - **Mitigation:** Implement strict Pydantic validation for each parsed row and handle file reading exceptions gracefully.
- **Risk:** Complex UI state management for large uploads.
  - **Mitigation:** Use robust toast notifications and simple progress indicators to keep user feedback clear.
- **Risk:** Existing queries might break if `Career` structure drastically changes.
  - **Mitigation:** Implement the M:N relationship additively; ensure existing `Career` references still work while expanding `Sede` capabilities.

## Rollback Plan
- Revert the frontend UI changes via Git (rollback to the previous commit).
- Downgrade the database schema using Alembic (`alembic downgrade -1`).
- Revert the backend API endpoints and dependency additions.

## Success Criteria
- The "Nueva Actividad" button successfully opens a form and creates a new activity in the database.
- Users can upload an `.xlsx` file and see the valid rows inserted as new activities, with appropriate feedback.
- The `Sede` model is successfully created and linked to `Career` via a many-to-many relationship, verified via the database schema and basic CRUD tests.
