# Proposal: PDF Export and Career Filter

## Intent
Allow users to filter the merged calendar view by career and export the filtered merged calendar as a PDF document.

## Scope
**In Scope:**
- Adding a career dropdown filter to the frontend calendar page.
- Adding an "Export to PDF" button that triggers a background Celery task.
- Implementing the real PDF generation using `reportlab` in the Celery worker.
- Polling for task status and downloading the generated PDF.

**Out of Scope:**
- Changes to database schema.
- Exporting to formats other than PDF (e.g., Excel/CSV) beyond what is already supported.

## Approach
- **Backend:** 
  - Add `reportlab` to `pyproject.toml`.
  - Rebuild Docker image to include the new dependency.
  - Implement `generate_pdf_report_task` in `app/workers/reports_worker.py` to query merged activities (via FastAPI/SQLAlchemy) and draw a structured PDF calendar.
  - Rely on existing FastAPI endpoints for the calendar fusion and task management.
- **Frontend:** 
  - Update `calendario/page.tsx` (Next.js 14 App Router) to include a dropdown for careers.
  - Include an export button that posts to `/api/v1/reports/generate` and polls for completion.

## Affected Areas
- `backend/pyproject.toml`
- `backend/app/workers/reports_worker.py`
- `frontend/app/calendario/page.tsx`

## Risks & Mitigation
- **Risk:** PDF generation could be memory-intensive.
  - **Mitigation:** Execute PDF generation asynchronously using Celery (already configured).
- **Risk:** Timeouts during report polling.
  - **Mitigation:** Ensure UI provides feedback during generation and handles errors gracefully.

## Rollback Plan
Revert changes to `calendario/page.tsx` and `reports_worker.py`. Remove `reportlab` from `pyproject.toml` and rebuild containers.

## Success Criteria
- User can select a career from a dropdown and see only activities related to that career.
- User can click "Export", wait for a brief period, and download a PDF containing the filtered activities.
