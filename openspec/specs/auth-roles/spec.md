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

### Requirement: Granular Research Roles
The system MUST support `vicerrectorado`, `director_investigacion`, and `jefe_investigacion` in the system role definitions.

#### Scenario: User registration and role assignment
- GIVEN an administrator is managing user profiles
- WHEN assigning roles to academic or research personnel
- THEN the system MUST accept `vicerrectorado`, `director_investigacion`, and `jefe_investigacion` as valid role values

#### Scenario: Access control evaluation for vicerrectorado role
- GIVEN a user authenticated with the `vicerrectorado` role
- WHEN making API requests to any endpoint
- THEN the system MUST grant institution-wide read and write administrative privileges

### Requirement: Scope-Aware Role Permissions
The system MUST enforce role-based access control based on user role and `career_id` scope when creating or modifying activities.

#### Scenario: Global event management by institutional leadership
- GIVEN a user with `vicerrectorado` or `director_investigacion` role
- WHEN creating or editing an activity with `career_id` set to null (Global scope)
- THEN the system MUST permit the operation

#### Scenario: Restricted career activity management by department heads
- GIVEN a user with `jefe_investigacion` or `coordinador` assigned to Career A
- WHEN attempting to create or edit an activity for Career B or with `career_id` set to null
- THEN the system MUST deny the request with HTTP status 403 Forbidden

### Requirement: Client-Side Route Guard
The system MUST implement an `AuthGuard` client component that protects routes, redirecting unauthenticated users to `/login` and authenticated users away from `/login`.

#### Scenario: Unauthenticated user accesses protected route
- GIVEN a user who is not authenticated
- WHEN they navigate to any route other than `/login`
- THEN the system MUST redirect them to `/login`

#### Scenario: Authenticated user accesses login route
- GIVEN a user who is already authenticated
- WHEN they navigate to `/login`
- THEN the system MUST redirect them to `/`

#### Scenario: Route guard loading state
- GIVEN the authentication state is being verified
- WHEN a user accesses any page
- THEN the system MUST display a full-page loading indicator without rendering partial page contents

### Requirement: Extended User Profile Context
The system MUST include `full_name` and `phone_number` within the `User` context state returned upon user session fetch.

#### Scenario: Accessing user context metadata
- GIVEN an authenticated user session from `GET /api/v1/users/me`
- WHEN the user object is loaded into `AuthContext`
- THEN `full_name` and `phone_number` MUST be accessible properties on the `user` object

### Requirement: Client Session Logout
The system MUST clear authentication tokens and user state upon user-initiated logout, redirecting the user to `/login`.

#### Scenario: User triggers logout action
- GIVEN an authenticated user on any protected route
- WHEN they execute the logout action
- THEN the system MUST remove the stored auth token, reset user context state, and redirect to `/login`

### Requirement: Role-Gated Global Activity Toggle
The system MUST hide the "Es actividad global/institucional" toggle from users with the `jefe_investigacion` or `coordinador` role by evaluating the current user role client-side via `useUser()`.

#### Scenario: jefe_investigacion opens activity form
- GIVEN a user with the `jefe_investigacion` role opens `ActivityModal.tsx`
- WHEN the form renders
- THEN the "Es actividad global/institucional" toggle MUST NOT be visible in the DOM

#### Scenario: coordinador opens activity form
- GIVEN a user with the `coordinador` role opens `ActivityModal.tsx`
- WHEN the form renders
- THEN the "Es actividad global/institucional" toggle MUST NOT be visible in the DOM

#### Scenario: vicerrectorado or director_investigacion opens activity form
- GIVEN a user with the `vicerrectorado` or `director_investigacion` role opens `ActivityModal.tsx`
- WHEN the form renders
- THEN the "Es actividad global/institucional" toggle MUST be visible and interactive

### Requirement: Career-Scoped Career Dropdown Pre-fill
The system MUST pre-fill the "Carrera" dropdown in `ActivityModal.tsx` using `user.careers` from the auth context and MUST restrict the selectable options to careers in `user.careers` for career-scoped roles.

#### Scenario: User with single career opens activity form
- GIVEN an authenticated user whose `user.careers` contains exactly one career
- WHEN `ActivityModal.tsx` renders the career dropdown
- THEN the dropdown MUST be pre-filled with that career and set to read-only/disabled state

#### Scenario: User with multiple careers opens activity form
- GIVEN an authenticated user whose `user.careers` contains more than one career
- WHEN `ActivityModal.tsx` renders the career dropdown
- THEN the dropdown MUST show only careers from `user.careers` and default to the first entry

#### Scenario: User with empty or missing careers
- GIVEN an authenticated user whose `user.careers` is empty or undefined
- WHEN `ActivityModal.tsx` renders the career dropdown
- THEN the dropdown MUST fall back to displaying the full career list without pre-selection

