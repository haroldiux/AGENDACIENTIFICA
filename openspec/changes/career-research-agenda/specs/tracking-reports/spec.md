# Delta for Tracking & Reports

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
