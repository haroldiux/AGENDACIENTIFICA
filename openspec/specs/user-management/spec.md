# User Management Specification

## Purpose
Provides complete user administration functionality, including paginated searching/filtering, administrative CRUD, role assignment safeguards, standardized Excel template generation, and bulk user import with row-level validation reporting.

## Requirements

### Requirement: Paginated User Listing and Filtering
The system MUST provide a `GET /api/v1/users/` endpoint allowing authorized administrators to list users with pagination, full-text search across name and email, and filtering by role or career.

#### Scenario: Admin searches and filters user list
- GIVEN an authenticated user with `super_admin` or `admin` role
- WHEN querying `GET /api/v1/users/` with search query "Pérez" and role filter "coordinador"
- THEN the system MUST return HTTP 200 with paginated user records matching the search query and role filter

#### Scenario: Unauthorized user attempts to list users
- GIVEN an authenticated user with `read_only` or `coordinador` role
- WHEN requesting `GET /api/v1/users/`
- THEN the system MUST deny access and return HTTP 403 Forbidden

### Requirement: User Creation and Role Management
The system MUST provide endpoints to create users (`POST /api/v1/users/`) and update user details (`PUT /api/v1/users/{id}`), preventing non-super_admin users from assigning elevated roles higher than their own scope.

#### Scenario: Admin updates user role and career assignment
- GIVEN an authenticated `super_admin` user
- WHEN submitting a `PUT /api/v1/users/{id}` request with updated `role` and `career_id` list
- THEN the system MUST update the user record and return the updated user profile

#### Scenario: Non-super_admin attempts privilege escalation
- GIVEN an authenticated user with `admin` role
- WHEN submitting a `PUT /api/v1/users/{id}` request attempting to promote a user to `super_admin`
- THEN the system MUST reject the request with HTTP 403 Forbidden

### Requirement: User Import Excel Template Download
The system MUST provide a `GET /api/v1/users/excel-template` endpoint that queries active careers from the database, builds a secondary reference worksheet named `"Catalogos"` populated with role choices and active careers (`ID - Nombre`), and attaches Excel `DataValidation` dropdown list rules to rows 2-500 of the `"Usuarios"` worksheet for Role and Career columns.

#### Scenario: Admin downloads template with dynamic catalog reference sheet and data validations
- GIVEN an authenticated admin user and active careers in the database
- WHEN requesting `GET /api/v1/users/excel-template`
- THEN the system MUST return a 200 OK `.xlsx` file containing a `"Catalogos"` worksheet and native `DataValidation` dropdown lists for Role and Career columns on rows 2-500.

#### Scenario: Admin downloads template when no active careers exist in database
- GIVEN an authenticated admin user and zero active careers in the database
- WHEN requesting `GET /api/v1/users/excel-template`
- THEN the system MUST populate `"Catalogos"` with a fallback career entry ("1 - Carrera General") and generate the `.xlsx` file successfully.

#### Scenario: Non-blocking data validation for multi-career entry
- GIVEN a generated Excel template workbook
- WHEN inspecting the Career column `DataValidation` configuration
- THEN the system MUST set `showErrorMessage=False` on the validation rule to permit manual entry of comma-separated career options.

### Requirement: Bulk User Excel Import with Row Error Reporting
The system MUST process uploaded `.xlsx` files via `POST /api/v1/users/import-excel`, validating each row and returning a structured import summary (`success_count`, `error_count`, `row_errors`) without discarding valid rows, flexibly resolving friendly Spanish role names or enum codes to internal `RoleEnum` members, and using regex parsing to extract numeric career IDs from single or comma-separated formatted dropdown strings (`ID - Nombre`).

#### Scenario: Bulk user import with mixed valid and invalid rows
- GIVEN an Excel file containing 10 user rows where 8 are valid and 2 have invalid email formats
- WHEN an admin uploads the file to `POST /api/v1/users/import-excel`
- THEN the system MUST create the 8 valid users, skip the 2 invalid rows, and return a report detailing line numbers and validation failure reasons for the 2 failed rows

#### Scenario: Import users with friendly Spanish role descriptions and formatted career dropdown values
- GIVEN an `.xlsx` import file with role "Docente" and career "67 - Ingeniería de Sistemas"
- WHEN an admin uploads the file to `POST /api/v1/users/import-excel`
- THEN the system MUST resolve the role to `RoleEnum.TEACHER` and career ID to `67`, creating the user successfully.

#### Scenario: Import users with multiple formatted career dropdown selections
- GIVEN an `.xlsx` import file with career string "67 - Ingeniería de Sistemas, 68 - Medicina"
- WHEN an admin uploads the file to `POST /api/v1/users/import-excel`
- THEN the system MUST extract numeric career IDs `[67, 68]` and associate the user with both active careers.

### Requirement: Administrative User Management UI and Navigation
The frontend MUST provide a user administration page at `/configuracion/usuarios` featuring search, filter controls, pagination, user edit modal, and bulk import modal, and MUST show the sidebar link only for authorized roles.

#### Scenario: Authorized admin accesses user management UI
- GIVEN an authenticated user with administrative privileges (`super_admin`, `vicerrectorado`, `admin`)
- WHEN navigating to `/configuracion/usuarios`
- THEN the system MUST render the User Management table and display "Usuarios" in the sidebar navigation
