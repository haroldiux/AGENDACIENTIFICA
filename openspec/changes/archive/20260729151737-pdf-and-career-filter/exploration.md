# Exploration: PDF Export and Career Filter

## Overview
The goal is to allow filtering the merged calendar by career, and generating a PDF report of this merged calendar.

## Findings
1. **Database and Models**: `AcademicActivity` and `ScientificActivity` models both already include `career_id`. No schema changes are needed.
2. **Backend Endpoints**:
   - The endpoint `GET /api/v1/fusion/` already accepts `career_id` and correctly filters both types of activities.
   - The endpoint `POST /api/v1/reports/generate` triggers a Celery task.
   - The Celery worker `app/workers/reports_worker.py` currently has a **mocked** `generate_pdf_report_task` that sleeps and generates a dummy text file.
3. **Dependencies**: `pyproject.toml` does not contain a PDF generation library. We will need to add one (e.g., `reportlab` or `weasyprint`).
4. **Frontend**:
   - `frontend/app/calendario/page.tsx` is a stub with no `career_id` dropdown and no "Export to PDF" button.

## Proposed Implementation Plan

### Backend Changes
1. **Dependencies**: Add `reportlab` (or `weasyprint`) to `pyproject.toml`.
2. **Celery Task Implementation**:
   - Modify `app/workers/reports_worker.py` -> `generate_pdf_report_task`.
   - Query the DB using `career_id` and `gestion_id` to get both `AcademicActivity` and `ScientificActivity`.
   - Generate a real PDF report displaying the merged activities using the chosen PDF library.
   - Ensure the file is saved to `/tmp/reports/` and return the correct file path.

### Frontend Changes
1. **Calendario Page**:
   - Fetch the list of careers from `/api/v1/careers` to populate a select dropdown.
   - Update the `/api/v1/fusion` fetch call to include `career_id` when selected.
   - Add an **Export to PDF** button.
2. **PDF Export Flow**:
   - When the user clicks "Export to PDF", POST to `/api/v1/reports/generate` with `format: "pdf"`, `career_id`, and `gestion_id`.
   - Start polling `/api/v1/reports/{task_id}/status`.
   - Once completed, open or download `/api/v1/reports/{task_id}/download`.

## Summary
The backend architecture is already set up to support career filtering and asynchronous report generation via Celery. The missing pieces are the actual PDF generation logic in the worker and the UI elements to trigger it and filter the calendar.
