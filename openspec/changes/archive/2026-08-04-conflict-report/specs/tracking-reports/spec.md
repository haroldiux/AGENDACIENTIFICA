# Delta for Tracking & Reports

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
