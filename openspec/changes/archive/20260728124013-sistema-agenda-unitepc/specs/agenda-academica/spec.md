# Domain: Agenda Académica

## Requirements
- The system MUST allow authorized users to manually create, update, and delete academic activities.
- The system SHOULD provide an interface to import academic calendars (e.g., via Excel/CSV templates).
- Academic activities MUST be structured with at least a title, start date, end date, and description.
- Academic activities MUST be assigned to specific careers or applied globally to the university.

## Scenarios

### Scenario: Manual creation of an academic activity
- **Given** an authorized admin user is logged in
- **When** they submit the form with valid academic activity details
- **Then** the activity MUST be saved in the database
- **And** the user MUST receive a success notification

### Scenario: Import academic calendar from template
- **Given** an authorized user has an Excel template with academic events
- **When** they upload the file in the import interface
- **Then** the system MUST validate the data format
- **And** successfully save the events into the system
- **And** return a summary of imported activities

### Scenario: Invalid data during manual creation
- **Given** an authorized user is logged in
- **When** they submit the form with a start date that is after the end date
- **Then** the system MUST reject the creation
- **And** display a validation error message
