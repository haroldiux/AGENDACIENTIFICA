# Domain: Auth & Roles

## Requirements
- The system MUST secure API endpoints using JWT (JSON Web Tokens) based authentication.
- The system MUST implement role-based access control with at least the following roles: Admin, Research Dept, Coordinator, Read-only.
- Admin and Research Dept roles MUST have full access to manage all activities.
- Coordinator roles MUST be restricted to managing activities within their assigned career/department.
- Read-only users MUST only be able to view the calendar and reports.

## Scenarios

### Scenario: Authentication via JWT
- **Given** a registered user with valid credentials
- **When** they submit a login request
- **Then** the system MUST return a valid JWT token
- **And** subsequent requests with this token MUST be authenticated

### Scenario: Coordinator restricted access
- **Given** a user with the Coordinator role for the "Architecture" career
- **When** they attempt to create a scientific activity for "Medicine"
- **Then** the system MUST deny the request with an unauthorized or forbidden error

### Scenario: Read-only access attempt
- **Given** a user with the Read-only role
- **When** they attempt to update an activity's status
- **Then** the system MUST deny the request
- **And** the UI SHOULD hide or disable editing controls for this user
