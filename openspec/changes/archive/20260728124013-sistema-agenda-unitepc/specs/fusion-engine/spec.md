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
