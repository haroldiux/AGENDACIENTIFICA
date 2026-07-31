# Technical Design: Feature Expansion v2

## 1. Technical Strategy

The "feature-expansion-v2" phase aims to extend the UNITEPC Scientific Agenda system with missing frontend functionality for creating activities, adding bulk upload capabilities via Excel files, and refining the database schema to support campus locations (`Sede`) linked to academic programs (`Career`).

The strategy is:
- **Backend**: Use FastAPI to expose new endpoints for activity creation, bulk Excel upload, and `Sede` CRUD. We will use `pandas` and `openpyxl` to parse uploaded `.xlsx` files synchronously, validating each row via Pydantic schemas, and inserting valid records in bulk using SQLAlchemy.
- **Frontend**: Leverage Next.js 14 App Router. Implement functional modals for activity creation and a robust drag-and-drop file upload zone using `react-dropzone`.
- **Database**: Add `Sede` and an associative table `SedeCareer` to PostgreSQL 16, using Alembic for additive schema migrations without breaking existing legacy queries.

## 2. Architecture Decisions

- **Frameworks**: Next.js 14 App Router (React) for the frontend; FastAPI (Python) for the backend.
- **Database**: PostgreSQL 16.
- **Data Processing**: `pandas` provides robust handling of tabular data. `openpyxl` is required as the engine for reading `.xlsx` files.
- **Background Processing**: While Celery/Redis are available, we will perform the Excel upload synchronously for now, as typical academic schedule files are small enough (< 1MB) to process within standard HTTP timeouts. If file sizes grow, this endpoint can be offloaded to Celery.
- **File Uploads**: Files will be handled via `UploadFile` (using `python-multipart`) in FastAPI, processed entirely in memory, without saving temporarily to the filesystem, to improve performance and security.
- **DevOps**: Docker Compose v2 for local environment parity, and Jenkins CI/CD pipelines to run `alembic upgrade head` and automated tests prior to deployment.

## 3. Monorepo File Structure & Layout

### Backend
- `backend/app/models/sede.py`: New SQLAlchemy model for `Sede` and the `SedeCareer` associative table.
- `backend/app/models/career.py`: Update to include the `sedes` relationship.
- `backend/app/routers/upload.py`: New router for the `POST /api/upload-excel` endpoint.
- `backend/app/routers/sedes.py`: New router for `Sede` CRUD operations.
- `backend/app/routers/actividades.py`: Update to include the `POST` endpoint for single activity creation.
- `backend/alembic/versions/`: New migration scripts for creating `Sede` and `SedeCareer`.
- `backend/requirements.txt` & `pyproject.toml`: Add `pandas`, `openpyxl`, and `python-multipart`.

### Frontend
- `frontend/app/actividades/page.tsx`: Update to wire up the "Nueva Actividad" and "Upload" buttons.
- `frontend/app/actividades/components/ActivityModal.tsx`: New component containing the form for creating a single activity.
- `frontend/app/actividades/components/UploadDropzone.tsx`: New component utilizing `react-dropzone` for file selection, validation, and upload progress representation.

## 4. Interfaces, API Endpoints, and Models

### Database Models (SQLAlchemy 2.0)

```python
# backend/app/models/sede.py
from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from backend.app.database import Base

sede_career_association = Table(
    "sede_career",
    Base.metadata,
    Column("sede_id", Integer, ForeignKey("sedes.id"), primary_key=True),
    Column("career_id", Integer, ForeignKey("careers.id"), primary_key=True)
)

class Sede(Base):
    __tablename__ = "sedes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    
    careers = relationship("Career", secondary=sede_career_association, back_populates="sedes")
```

_Note: The `Career` model will be updated to include `sedes = relationship("Sede", secondary=sede_career_association, back_populates="careers")`._

### API Endpoints

1. **`POST /api/upload-excel`**
   - **Content-Type**: `multipart/form-data`
   - **Request**: `file: UploadFile`
   - **Response**: 
     ```json
     {
       "inserted_count": 150,
       "errors": [
         {"row": 2, "error": "Missing required field 'title'"}
       ]
     }
     ```

2. **`POST /api/actividades`**
   - **Content-Type**: `application/json`
   - **Request**: Pydantic schema `ActivityCreate`
   - **Response**: Created `Activity` object.

3. **`GET /api/sedes`**
   - **Response**: List of `Sede` objects.

### Excel Parsing Flow
1. **Receive**: `UploadFile` receives the `.xlsx` stream.
2. **Parse**: `pandas.read_excel(file.file)` loads the data into a DataFrame.
3. **Validate**: Iterate over the DataFrame records (`df.to_dict('records')`). Pass each dictionary to a Pydantic `ActivityRowValidator` schema.
4. **Collect**: Separate valid rows and validation errors (using `ValidationError`).
5. **Insert**: Use SQLAlchemy's `session.bulk_insert_mappings()` or `session.add_all()` to insert valid records in a single transaction.
6. **Return**: Send back the count of successes and a list of specific row errors.

## 5. Testing & Rollout Strategy

### Testing
- **Backend Unit Tests**: Write `pytest` tests simulating Excel uploads using `io.BytesIO` to provide mocked `.xlsx` files (both valid and malformed) directly to the FastAPI `TestClient`.
- **Validation Tests**: Ensure Pydantic schemas catch missing fields, invalid dates, and incorrect data types.
- **Frontend Component Tests**: Test the `UploadDropzone` component for file rejection (e.g., dropping a `.pdf`).
- **Database Tests**: Verify the many-to-many relationship by inserting a `Sede`, linking it to multiple `Career`s, and querying the relationships.

### Rollout
1. **Database Migrations**: Deploy Alembic migrations first. The changes are purely additive (new tables and columns) and will not affect existing `Career` queries.
2. **Backend Services**: Deploy the updated FastAPI application with the new dependencies (`pandas`, `openpyxl`).
3. **Frontend Application**: Deploy the updated Next.js build.
4. **Rollback**: If critical failures occur, revert frontend/backend code via Git, and run `alembic downgrade -1` to remove the new tables.
