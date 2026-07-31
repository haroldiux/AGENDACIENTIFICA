# Spec: PDF Export

## Feature Description
The system must be able to export a combined calendar of Academic and Scientific activities into a PDF format, processed asynchronously in the background.

## Requirements
1. The endpoint `POST /api/v1/reports/generate` should accept `format="pdf"`, `career_id` (optional), and `gestion_id`.
2. The Celery worker MUST use `reportlab` to build a PDF document containing a table or list of activities.
3. The generated PDF must be saved to `/tmp/reports/` and a path should be recorded.
4. The frontend MUST provide an "Export to PDF" button on the `calendario` page.
5. The frontend MUST poll the status endpoint until the report is ready, then trigger a download.
