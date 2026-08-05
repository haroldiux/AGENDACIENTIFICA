# SDD Spec: Conflict Report

---

# Domain: Conflict Detection

## Purpose
Detect scheduling overlaps between academic and scientific activities that share the same career and gestión.

## Requirements

### Requirement: Same career and gestión scope
The conflict service MUST only compare `AcademicActivity` and `ScientificActivity` records whose `career_id` and `gestion_id` match the requested values.

#### Scenario: Filter by career and gestión
- GIVEN activities exist for career A gestión 1 and career B gestión 1
- WHEN conflicts are requested for career A gestión 1
- THEN the result MUST only include pairs from career A gestión 1

### Requirement: Exclude cancelled scientific activities
The service MUST NOT include `ScientificActivity` records whose `status` equals `"cancelled"` in overlap detection.

#### Scenario: Cancelled scientific activity ignored
- GIVEN a cancelled scientific activity overlaps an academic activity
- WHEN conflicts are detected
- THEN the pair MUST NOT appear in the result

### Requirement: Date overlap predicate
The service MUST consider two activities overlapping when their date ranges intersect, inclusive of start and end dates.

#### Scenario: Same-day activities overlap
- GIVEN an academic activity runs 2026-03-01 to 2026-03-03
- AND a scientific activity runs 2026-03-03 to 2026-03-05
- WHEN conflicts are detected
- THEN the pair MUST be returned because the ranges share 2026-03-03

#### Scenario: Contained range overlaps
- GIVEN a scientific activity runs entirely within an academic activity's date range
- WHEN conflicts are detected
- THEN the pair MUST be returned

#### Scenario: Touching dates do not overlap
- GIVEN an academic activity ends 2026-03-03 and a scientific activity starts 2026-03-04
- WHEN conflicts are detected
- THEN the pair MUST NOT be returned

#### Scenario: Disjoint ranges do not overlap
- GIVEN an academic activity and a scientific activity have non-intersecting date ranges
- WHEN conflicts are detected
- THEN the pair MUST NOT be returned

### Requirement: Pair-shaped output
The endpoint MUST return a list where each item contains the academic activity `id` and `title`, and the scientific activity `id`, `title`, `type`, start date, and end date.

#### Scenario: Response shape
- GIVEN one overlapping pair exists
- WHEN `GET /api/v1/conflicts` is called
- THEN the response MUST contain exactly one `ConflictItem` with both activity identifiers and titles

### Requirement: Required query parameters
`GET /api/v1/conflicts` MUST require both `career_id` and `gestion_id` query parameters and reject requests missing either.

#### Scenario: Missing parameter rejected
- GIVEN a request without `gestion_id`
- WHEN it is submitted
- THEN the system MUST return HTTP 422 with a validation error

### Requirement: Conflict response schemas
The system MUST define `ConflictItem` and `ConflictListResponse` Pydantic schemas.

#### Scenario: Schema validation
- GIVEN a valid conflict pair
- WHEN it is serialized through `ConflictListResponse`
- THEN the output MUST match the expected JSON structure

### Requirement: Frontend conflict card
The frontend MUST enable the existing "Reporte de Conflictos" card and link it to conflict list and report export flows.

#### Scenario: Card triggers export
- GIVEN the user is on the reportes page
- WHEN the conflict card is clicked
- THEN the system MUST initiate a `report_type="conflict"` export using the existing polling flow

### Requirement: Service testability
Overlap predicate edge cases MUST be covered by unit tests.

#### Scenario: Unit test coverage
- GIVEN the conflict service
- WHEN tests run for same-day, contained, touching, disjoint, and cancelled cases
- THEN all tests MUST pass

---

# Domain: Tracking & Reports (Delta)

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
