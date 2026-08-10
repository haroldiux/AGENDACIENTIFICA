# Domain: Fusion Engine

## Requirements
- The system MUST provide an endpoint to fetch merged calendar data combining both academic and scientific activities.
- The fusion engine MUST support filtering merged activities by career, department, and academic term (gestión).
- The system MUST efficiently handle date range queries utilizing PostgreSQL `daterange` types to find overlaps.
- The UI MUST distinguish between academic and scientific activities using distinct color coding or visual markers.

## Scenarios

### Scenario: Fetching merged calendar for a specific career
- **Given** academic and scientific activities exist for "Medicine"
- **When** a user requests the calendar filtered by "Medicine"
- **Then** the system MUST return a combined list of both activity types
- **And** exclude activities that belong exclusively to other careers

### Scenario: Querying overlapping activities
- **Given** multiple activities overlap in a given week
- **When** a user views the calendar for that week
- **Then** the system MUST correctly retrieve all overlapping events
- **And** the UI MUST display them concurrently

### Scenario: Visual distinction of activity types
- **Given** a merged calendar view
- **When** the events are rendered
- **Then** academic activities MUST display in one distinct color/style
- **And** scientific activities MUST display in another distinct color/style

## Frontend Requirements: Career Filter
- The frontend MUST query the existing `/api/v1/careers` endpoint to get a list of active careers.
- The `calendario` page MUST include a `<select>` dropdown populated with the fetched careers.
- When a career is selected, the frontend MUST append `?career_id=<id>` to the `GET /api/v1/fusion/` fetch call.
- The calendar view must update dynamically when the filter changes.

### Requirement: Global and Career Calendar Event Fusion
The Fusion Engine MUST merge global events (`career_id IS NULL`) and career-scoped events (`career_id == X`) when querying a specific career calendar feed.

#### Scenario: Querying calendar feed for a specific career
- GIVEN global events and career-scoped events exist in the system
- WHEN a user requests the calendar feed for career ID "MED-01"
- THEN the system MUST return all events belonging to "MED-01" AND all global events where `career_id` is null

#### Scenario: Querying global-only calendar feed
- GIVEN global events exist alongside multiple career-scoped events
- WHEN a user requests the calendar feed without a career filter (`career_id` is null or all)
- THEN the system MUST return all global events across the institution

### Requirement: Multi-Calendar Scope Distinction in UI
The frontend calendar view MUST display scope badges ("Global" vs "Carrera") for each rendered activity card to visually distinguish global institutional events from career-specific events.

#### Scenario: Rendering activity cards with scope indicators
- GIVEN a merged list of global and career-scoped activities
- WHEN the frontend renders the calendar view
- THEN global activities MUST display a prominent "Global" scope badge
- AND career-scoped activities MUST display a badge indicating the specific career name

### Requirement: RFC 5545 iCalendar Event Stream Export
The system MUST provide an endpoint `GET /api/v1/fusion/export-ics` that generates and streams a valid RFC 5545 `.ics` file representing merged academic and scientific calendar activities.

#### Scenario: Exporting timed and all-day activities to iCalendar format
- GIVEN academic and scientific activities exist in the system with both specific time slots and all-day dates
- WHEN an authorized user requests `GET /api/v1/fusion/export-ics`
- THEN the system MUST return a `text/calendar` response containing `BEGIN:VCALENDAR` and `VEVENT` blocks
- AND timed activities MUST use UTC formatting `YYYYMMDDTHHMMSSZ` while all-day events MUST use `VALUE=DATE:YYYYMMDD`

#### Scenario: Exporting iCalendar feed with scope and date filters
- GIVEN activities across multiple careers and date ranges
- WHEN a user requests `GET /api/v1/fusion/export-ics` with `career_id` and date range parameters
- THEN the system MUST filter the exported events to only include activities matching the specified career scope and date interval

### Requirement: Frontend iCalendar Export UI Integration
The frontend MUST render an "Exportar a iCal (.ics)" action button on both `/calendario` and `/actividades` pages that triggers a file download of the `.ics` export with active calendar filters.

#### Scenario: User clicks export iCal button in calendar view
- GIVEN a user viewing the `/calendario` page with an active career filter
- WHEN the user clicks the "Exportar a iCal (.ics)" button
- THEN the browser MUST initiate a download of the `.ics` file generated with the current career filter parameters


