# Design: PDF Export and Career Filter

## Overview
This document outlines the technical design for implementing the PDF export and career filtering features for the merged calendar.

## Backend Changes

### Dependency Management
- **`pyproject.toml`**: Add `reportlab` as a dependency under `[tool.poetry.dependencies]`.
- **Docker**: Requires rebuilding the backend docker image to install the new dependency.

### Celery Worker (`app/workers/reports_worker.py`)
- Replace the mocked sleep logic in `generate_pdf_report_task` with real generation logic.
- **Workflow**:
  1. Retrieve `AcademicActivity` and `ScientificActivity` based on `gestion_id` and optional `career_id`.
  2. Instantiate a `reportlab.platypus.SimpleDocTemplate`.
  3. Create a `Table` grouping activities by month or simply listing them chronologically.
  4. Save the PDF to a temporary directory (e.g., `/tmp/reports/report_<uuid>.pdf`).
  5. Return the absolute path or a key for retrieval via the download endpoint.

## Frontend Changes

### UI Components (`calendario/page.tsx`)
- **State Management**:
  - `selectedCareer`: state for the currently selected career filter.
  - `isExporting`: boolean state for the export button loading indicator.
- **Career Dropdown**:
  - Load careers using `useEffect` on mount.
  - Render a standard styled Next.js / Tailwind select input.
- **Export Button**:
  - Placed alongside the filter controls.
  - On click: fires `POST /api/v1/reports/generate` with current filters.
  - Uses `setInterval` or recursive timeout to poll `GET /api/v1/reports/{task_id}/status`.
  - When status is `COMPLETED`, opens a window/tab pointing to `GET /api/v1/reports/{task_id}/download` to trigger the browser download.

## Error Handling
- Celery task failures should update the task status to `FAILED`.
- The frontend should gracefully display a toast or alert if the polling returns an error or fails.
