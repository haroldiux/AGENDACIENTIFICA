# Domain: Tracking & Reports

## Requirements
- The system MUST allow tracking the status of scientific activities (e.g., Planned, In Progress, Completed, Cancelled).
- The system MUST allow users to upload or link evidence (e.g., documents, URLs) for completed activities.
- The system MUST support generating reports in PDF and Excel formats.
- Report generation MUST be handled asynchronously via Celery background tasks to prevent blocking the API.

## Scenarios

### Scenario: Updating activity status and adding evidence
- **Given** a scientific activity is marked as "Planned"
- **When** the responsible user changes the status to "Completed" and attaches a document link
- **Then** the system MUST update the status
- **And** store the evidence link associated with the activity

### Scenario: Requesting an Excel report
- **Given** a user wants a summary of scientific activities for a semester
- **When** they request an Excel report generation
- **Then** the system MUST queue a background task in Celery
- **And** return a task identifier or status indicating processing has started

### Scenario: Completing a background report task
- **Given** a report generation task is queued
- **When** Celery finishes processing the task
- **Then** the PDF or Excel file MUST be available for download
- **And** the system SHOULD notify the user or update the task status to completed

## PDF Export Implementation Details
- The endpoint `POST /api/v1/reports/generate` should accept `format="pdf"`, `career_id` (optional), and `gestion_id`.
- The Celery worker MUST use `reportlab` to build a PDF document containing a table or list of activities.
- The generated PDF must be saved to `/tmp/reports/` and a path should be recorded.
- The frontend MUST provide an "Export to PDF" button on the `calendario` page.
- The frontend MUST poll the status endpoint until the report is ready, then trigger a download.
