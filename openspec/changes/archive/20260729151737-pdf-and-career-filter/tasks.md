# Tasks: PDF Export and Career Filter

## Backend
- [x] Add `reportlab` to `pyproject.toml`.
- [x] Rebuild Docker containers to ensure `reportlab` is installed in the backend image.
- [x] Update `app/workers/reports_worker.py`:
  - [x] Import `reportlab` components.
  - [x] Implement database querying for activities inside `generate_pdf_report_task`, passing `career_id`.
  - [x] Build the PDF layout using `Platypus` (Tables, Paragraphs).
  - [x] Save the generated PDF file to `/tmp/reports/` and return the correct file reference.

## Frontend
- [x] Update `calendario/page.tsx` state:
  - [x] Add `career_id` state.
  - [x] Add `careers` list state.
  - [x] Add `exporting` boolean state.
- [x] Implement career fetch logic in `calendario/page.tsx`:
  - [x] Create `useEffect` to fetch from `/api/v1/careers`.
  - [x] Render a `<select>` dropdown to choose a career.
- [x] Update `fusion` API call to include `career_id` query param when selected.
- [x] Add Export button:
  - [x] Render an "Export to PDF" button.
  - [x] Add `onClick` handler to POST `/api/v1/reports/generate`.
  - [x] Implement polling logic for `/api/v1/reports/{task_id}/status`.
  - [x] Implement download trigger when status is completed.
