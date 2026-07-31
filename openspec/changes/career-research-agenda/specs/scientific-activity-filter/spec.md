# Specification: Scientific Activity Filter

## Purpose

Define the optional query filters for `GET /api/v1/scientific/` so the career research agenda can request only the relevant research-department activities.

## Requirements

### Requirement: Career Filter

The system MUST accept an optional `career_id` query parameter on `GET /api/v1/scientific/`. When provided, the response SHALL include only scientific activities whose `career_id` matches the supplied value.

#### Scenario: Filter scientific activities by career

- GIVEN scientific activities exist for multiple careers
- WHEN the client sends `GET /api/v1/scientific/?career_id=X`
- THEN the response MUST contain only activities linked to career `X`
- AND activities linked to other careers MUST NOT appear

### Requirement: Gestión Filter

The system MUST accept an optional `gestion_id` query parameter on `GET /api/v1/scientific/`. When provided, the response SHALL include only scientific activities whose `gestion_id` matches the supplied value.

#### Scenario: Filter scientific activities by gestión

- GIVEN scientific activities exist for multiple gestiones
- WHEN the client sends `GET /api/v1/scientific/?gestion_id=Y`
- THEN the response MUST contain only activities linked to gestión `Y`

### Requirement: Date Range Filter

The system MUST accept optional `start_date` and `end_date` query parameters on `GET /api/v1/scientific/`. When both are provided, the response SHALL include only scientific activities whose date range overlaps the requested range.

#### Scenario: Filter scientific activities by date range

- GIVEN scientific activities exist across several months
- WHEN the client sends `GET /api/v1/scientific/?start_date=2025-01-01&end_date=2025-01-31`
- THEN the response MUST contain only activities that overlap January 2025

### Requirement: Combined Filters

The system MUST support combining `career_id`, `gestion_id`, `start_date`, and `end_date` filters with AND semantics.

#### Scenario: Combine career, gestión, and date filters

- GIVEN scientific activities exist for multiple careers, gestiones, and dates
- WHEN the client sends `GET /api/v1/scientific/?career_id=X&gestion_id=Y&start_date=2025-01-01&end_date=2025-06-30`
- THEN the response MUST contain only activities that satisfy all supplied filters

### Requirement: Empty Result Set

When no scientific activities match the supplied filters, the system MUST return an empty list with HTTP 200.

#### Scenario: No activities match the filters

- GIVEN no scientific activities match the requested filters
- WHEN the client sends a filtered request
- THEN the response MUST have status 200
- AND the response body MUST contain an empty list

### Requirement: Invalid Date Parameters

The system MUST reject invalid date formats with HTTP 422 Unprocessable Entity.

#### Scenario: Request with malformed date

- GIVEN a client sends `GET /api/v1/scientific/?start_date=not-a-date`
- WHEN the request is processed
- THEN the response MUST have status 422
- AND the response MUST indicate the date format error

### Requirement: Unfiltered List Preserved

When no query parameters are provided, the system MUST return all scientific activities, preserving the existing unfiltered behavior.

#### Scenario: Request without filters

- GIVEN scientific activities exist in the system
- WHEN the client sends `GET /api/v1/scientific/` without query parameters
- THEN the response MUST contain all scientific activities
