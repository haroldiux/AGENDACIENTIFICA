# Requirements: agenda-cientifica

## 1. Requirements (ADDED)

- **REQ-AC-01:** The system MUST provide a functional "Nueva Actividad" button in the `actividades` view.
- **REQ-AC-02:** When the "Nueva Actividad" button is clicked, the system MUST display a creation modal or navigate to a dedicated creation page (`/actividades/nueva`).
- **REQ-AC-03:** The frontend form MUST collect all required fields for a new activity.
- **REQ-AC-04:** The frontend MUST send the creation request to the backend API.
- **REQ-AC-05:** The system SHOULD display robust toast notifications indicating the success or failure of the activity creation.

## 2. Scenarios (ADDED)

### Scenario: User creates a new activity successfully
- **Given** a user is on the `actividades` view
- **When** the user clicks the "Nueva Actividad" button
- **Then** the system displays the activity creation modal/page
- **And** the user fills in the valid required fields
- **And** submits the form
- **Then** the system saves the activity in the database
- **And** displays a success toast notification
- **And** the new activity appears in the list of activities.

### Scenario: User submits incomplete activity form
- **Given** a user is in the activity creation modal/page
- **When** the user submits the form with missing required fields
- **Then** the system prevents submission
- **And** displays inline validation errors indicating the missing fields.

### Scenario: Backend error during activity creation
- **Given** a user submits a complete activity form
- **When** the backend encounters an error (e.g., validation failure, server error)
- **Then** the system displays a failure toast notification with the error details.
