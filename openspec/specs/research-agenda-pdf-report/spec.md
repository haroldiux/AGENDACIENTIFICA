# Domain: Research Agenda PDF Report

## Purpose

Define the per-career scientific agenda PDF export, generated asynchronously by the Celery worker, while preserving the existing table-based report.

## Requirements

### Requirement: Research Agenda Report Type

The system MUST accept `report_type="research-agenda"` on `POST /api/v1/reports/generate`.

#### Scenario: Request a research-agenda PDF

- GIVEN a valid `career_id` and `gestion_id`
- WHEN the client sends `POST /api/v1/reports/generate` with `report_type=research-agenda`
- THEN the system MUST queue a Celery task to generate the report
- AND the response MUST include a task identifier

### Requirement: Required Report Parameters

The research-agenda report MUST require `career_id` and `gestion_id` parameters.

#### Scenario: Request without required parameters

- GIVEN a client sends a research-agenda request missing `career_id`
- WHEN the request is validated
- THEN the response MUST have status 422
- AND the response MUST indicate the missing parameter

### Requirement: PDF Header

The generated research-agenda PDF MUST display the career name and gestión name in the header.

#### Scenario: Open the generated PDF

- GIVEN a research-agenda PDF was generated for career "Medicine" and gestión "2025"
- WHEN the PDF is opened
- THEN the header MUST contain "Medicine" and "2025"

### Requirement: Month Grouping in PDF

The research-agenda PDF MUST group activities by month with readable month names.

#### Scenario: PDF shows grouped activities

- GIVEN activities exist in March and April
- WHEN the PDF is generated
- THEN the PDF MUST contain separate sections for March and April

### Requirement: Activity Details in PDF

Each activity entry in the research-agenda PDF MUST display title, activity type, responsible name, date range, status, and notes.

#### Scenario: Review an activity entry

- GIVEN a scientific activity has title, type, responsible, dates, status, and notes
- WHEN the PDF is generated
- THEN the activity entry MUST show all of those fields

### Requirement: Asynchronous Generation

The research-agenda PDF MUST be generated asynchronously by the Celery worker.

#### Scenario: Task is queued and processed

- GIVEN a research-agenda PDF request is accepted
- WHEN the Celery worker processes the task
- THEN the worker MUST generate the PDF and store it at a retrievable path

### Requirement: Frontend Polling

The frontend MUST poll the report status endpoint until the task status is "completed" or "failed".

#### Scenario: Poll for report completion

- GIVEN a research-agenda PDF task is queued
- WHEN the frontend polls the status endpoint
- THEN the frontend MUST continue polling while the status is "processing"
- AND MUST stop polling when the status is "completed" or "failed"

### Requirement: Download on Completion

When the report status is "completed", the frontend MUST trigger a download of the generated file.

#### Scenario: Report is ready

- GIVEN the report status endpoint returns "completed" with a download URL
- WHEN the frontend receives the response
- THEN the browser MUST initiate a download of the PDF

### Requirement: Error Handling

If report generation fails, the frontend MUST display an error message and MUST NOT attempt to download.

#### Scenario: Report generation fails

- GIVEN the report status endpoint returns "failed"
- WHEN the frontend receives the response
- THEN the frontend MUST display an error message
- AND MUST NOT trigger a download

### Requirement: Preserve Existing Report

The existing table-based PDF report MUST remain available and unchanged.

#### Scenario: Existing table report still works

- GIVEN a client requests the existing table report type
- WHEN the request is processed
- THEN the system MUST generate the original table-based PDF
