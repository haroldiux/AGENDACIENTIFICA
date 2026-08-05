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

# Delta: Career Research Agenda (ADDED)

The following requirements were added by the `career-research-agenda` change.

## ADDED Requirements

### Requirement: Research Agenda Report Type

The system MUST accept `report_type="research-agenda"` on `POST /api/v1/reports/generate` in addition to existing report types.

#### Scenario: Request a research-agenda report

- GIVEN a client supplies a valid `career_id`, `gestion_id`, and `report_type=research-agenda`
- WHEN the request is submitted
- THEN the system MUST queue the research-agenda PDF template

### Requirement: Dedicated Research Agenda Template

The Celery worker MUST use a dedicated research-agenda PDF template that renders a month-grouped, career-branded agenda layout.

#### Scenario: Generate a research-agenda PDF

- GIVEN a research-agenda task is queued
- WHEN the Celery worker processes the task
- THEN the worker MUST render the research-agenda template
- AND the output MUST contain the career name, gestión name, and month-grouped activities

### Requirement: Preserve Existing Table Report

The existing table-based PDF report template MUST remain available and unchanged when its existing report type is requested.

#### Scenario: Request the original table report

- GIVEN a client requests the original table report type
- WHEN the worker processes the task
- THEN the worker MUST use the original table template
- AND the output MUST match the existing table report format

### Requirement: Template Selection

The report worker MUST select the correct template based on the `report_type` parameter.

#### Scenario: Different report types use different templates

- GIVEN two queued tasks with different `report_type` values
- WHEN the worker processes each task
- THEN the research-agenda type MUST use the agenda template
- AND the original table type MUST use the original table template

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.

## Delta: Conflict Report (ADDED / MODIFIED)

The following requirements were added or modified by the `conflict-report` change.

## ADDED Requirements

### Requirement: Conflict report type
The system MUST accept `report_type="conflict"` on `POST /api/v1/reports/generate`.

#### Scenario: Request conflict report
- GIVEN valid `career_id`, `gestion_id`, and `report_type="conflict"`
- WHEN the request is submitted
- THEN the system MUST queue a conflict report task

### Requirement: Worker dispatch branch
The Celery worker MUST route `report_type="conflict"` to a dedicated conflict report branch.

#### Scenario: Conflict task routed
- GIVEN a queued task with `report_type="conflict"`
- WHEN the worker processes it
- THEN it MUST execute conflict-specific PDF or Excel generation

### Requirement: Conflict PDF template
The worker MUST generate a PDF listing conflict pairs grouped by month using ReportLab.

#### Scenario: Conflict PDF generated
- GIVEN a conflict PDF task
- WHEN the worker processes it
- THEN the output MUST contain overlapping academic/scientific pairs grouped by month

### Requirement: Conflict Excel template
The worker MUST generate a real `.xlsx` file with conflict pairs using `openpyxl` or `pandas`.

#### Scenario: Conflict Excel generated
- GIVEN a conflict Excel task
- WHEN the worker processes it
- THEN the output MUST be a valid `.xlsx` file with one conflict pair per row

### Requirement: Worker test coverage
Conflict report generation MUST be covered by worker tests.

#### Scenario: Worker tests pass
- GIVEN conflict PDF and Excel generation paths
- WHEN worker tests run
- THEN both formats MUST produce valid output files

## MODIFIED Requirements

### Requirement: Report type literal
`ReportRequest.report_type` MUST include `"conflict"` in its allowed Literal values.
(Previously: the Literal only contained existing report types.)

#### Scenario: Conflict type accepted
- GIVEN a request with `report_type="conflict"`
- WHEN schema validation runs
- THEN the request MUST be accepted

### Requirement: Existing report types preserved
Existing `report_type` values and templates MUST remain unchanged and functional.
(Previously: existing report types used their original templates.)

#### Scenario: Original report still works
- GIVEN a request with an original `report_type`
- WHEN the worker processes it
- THEN the original template and behavior MUST be used

## REMOVED Requirements

None.

## RENAMED Requirements

None.
