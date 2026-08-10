# Domain: Fusion Engine

## ADDED Requirements

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
