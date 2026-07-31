# Domain: Agenda Científica

## Requirements
- The system MUST allow authorized users to perform CRUD operations on scientific research activities.
- Scientific activities MUST include specific fields: title, category, responsible person, career/department, start date, and end date.
- The system MUST support categorization of scientific activities (e.g., Seminar, Workshop, Research Project).
- Each scientific activity MUST have a designated responsible user.

## Scenarios

### Scenario: Create a new scientific activity
- **Given** a coordinator or research admin is logged in
- **When** they submit a new scientific activity with a valid category and responsible person
- **Then** the system MUST save the activity
- **And** link the activity to the specified career/department and responsible user

### Scenario: Updating a scientific activity's responsible person
- **Given** an existing scientific activity
- **When** an authorized user changes the responsible person and saves the update
- **Then** the system MUST reflect the new responsible person
- **And** MAY notify the newly assigned user

### Scenario: Deleting a scientific activity
- **Given** an existing scientific activity
- **When** an authorized user requests to delete it
- **Then** the system MUST soft-delete or remove the record
- **And** it MUST no longer appear in the scientific calendar views
