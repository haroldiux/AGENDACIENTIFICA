# Public Portal Specification

## Purpose
Provide a standalone, unauthenticated institutional public portal (`/portal`) where students, researchers, and external visitors can view, filter, and inspect UNITEPC academic and scientific calendar events, access event details, and download public evidence attachments without requiring login.

## Requirements
### Requirement: Unauthenticated Public Calendar Explorer
The system MUST provide an unauthenticated public portal page at `/portal` featuring hero branding, search bar, filter controls (Gestion, Sede, Carrera, Category, date range), and interactive calendar grid and list views for UNITEPC calendar events.

#### Scenario: Viewing public calendar explorer
- GIVEN an unauthenticated visitor navigating to `/portal`
- WHEN the page loads
- THEN the system MUST render UNITEPC public hero header, filter controls, and public event list/calendar views

#### Scenario: Filtering public calendar events
- GIVEN an unauthenticated visitor on `/portal`
- WHEN selecting specific filters for Sede, Carrera, Category, or date range
- THEN the system MUST fetch and display matching public calendar events without requiring authentication

### Requirement: Public Event Details Inspection
The system MUST display full details for a selected public event in an interactive modal, including schedule, location, career, category, and public evidence file attachments.

#### Scenario: Opening public event detail modal
- GIVEN an unauthenticated visitor viewing `/portal`
- WHEN clicking on a public event item
- THEN the system MUST open `PublicEventDetailModal` displaying event schedule, location, career, category, and evidence links

### Requirement: Unauthenticated Public API Router
The system MUST provide unauthenticated read-only REST endpoints under `/api/v1/public/` for fetching public calendar events, metadata dropdown options, event details, and evidence file downloads.

#### Scenario: Fetching public events list payload
- GIVEN an unauthenticated request to `GET /api/v1/public/calendar`
- WHEN valid query filter parameters are supplied
- THEN the system MUST return sanitized event payload omitting sensitive internal user data and audit fields

### Requirement: Safe Public Evidence Download
The system MUST stream public evidence attachments via `GET /api/v1/public/evidences/{id}/download` while strictly validating and sanitizing file paths against the root upload directory to prevent path traversal attacks.

#### Scenario: Downloading public evidence attachment
- GIVEN an unauthenticated request to `GET /api/v1/public/evidences/{id}/download` with a valid evidence ID
- WHEN the endpoint processes the request
- THEN the system MUST safely stream the evidence file content

#### Scenario: Attempting path traversal exploit
- GIVEN an unauthenticated request for an evidence file with path traversal sequences
- WHEN the system validates the resolved file path against the configured root upload directory
- THEN the system MUST reject the request with HTTP status 400 Bad Request
