# Exploration: Feature Expansion v2

## 1. Broken Buttons in "Actividades"
**Issue:** The "Nueva Actividad" button in `frontend/app/actividades/page.tsx` currently has no `onClick` handler, nor does the page have state for a creation modal or navigation to a dedicated form page.
**Solution:**
- Add state management (`useState`) to toggle a "Create Activity" modal or integrate a Next.js `Link` to route to a new `/actividades/nueva` page.
- Implement the form with fields matching the backend schema and submit via fetch/axios to the FastAPI backend.

## 2. Excel Upload Feature
**Backend (FastAPI):**
- **Dependencies:** Install `pandas`, `openpyxl`, and `python-multipart`.
- **Implementation:** Create an endpoint `POST /api/upload-excel` accepting an `UploadFile`. Use `pandas.read_excel(file.file)` to parse the file into a DataFrame.
- **Validation:** Iterate over rows, passing them through a Pydantic schema for validation.
- **Database Insertion:** Bulk insert valid rows into PostgreSQL using SQLAlchemy.

**Frontend (Next.js):**
- **Component:** Use `react-dropzone` to implement a drag-and-drop file upload zone.
- **Action:** Append the selected `.xlsx` file to a `FormData` object and send it to the backend endpoint via a `POST` request. Provide user feedback (success/error toasts and a progress bar).

## 3. Careers & Sedes (Campuses)
**Analysis:** UNITEPC operates in multiple cities (Sedes). Careers can be offered across different Sedes.
**Proposed Schema Changes:**
- Create a `Sede` model:
  - `id`: UUID (Primary Key)
  - `name`: String (e.g., Cochabamba, La Paz, Santa Cruz, El Alto, Cobija)
  - `address`: String (optional)
- Create a `Career` model (if not fully fleshed out):
  - `id`: UUID (Primary Key)
  - `name`: String (e.g., Medicina, Odontología)
- Create an associative table `SedeCareer` (Many-to-Many):
  - `sede_id`: Foreign Key
  - `career_id`: Foreign Key
  This handles the reality that the same career (e.g. Medicina) can be taught at multiple Sedes.
