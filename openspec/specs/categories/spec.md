# categories Specification

## Purpose
Provide dynamic management and administration of activity categories and types by Vicerrectorado and Authorized roles, allowing CRUD operations, status toggling, and scope definitions.

## ADDED Requirements
### Requirement: Activity Category Management Endpoints
The system MUST expose REST endpoints at `/api/v1/categories/` allowing authorized users to create, read, update, and soft-delete activity categories with attributes `name`, `code`, `scope` ('academic', 'scientific', 'both'), `color`, `description`, and `is_active`.
#### Scenario: Authorized user creates activity category
- GIVEN a user authenticated as `vicerrectorado`, `admin`, `super_admin`, or `director_investigacion`
- WHEN submitting a valid category creation payload with unique code and valid scope
- THEN the system MUST save the category and return HTTP 201 Created with the saved record

#### Scenario: Unauthorized user attempts category modification
- GIVEN a user authenticated without administrative category management roles
- WHEN submitting a category creation or update request to `/api/v1/categories/`
- THEN the system MUST reject the request with HTTP 403 Forbidden

### Requirement: Soft Deletion and Activation Toggling
The system MUST support toggling category status via `is_active` boolean flag to deactivate categories without removing existing historical activity references.
#### Scenario: Deactivating an active category
- GIVEN an active `ActivityCategory` record in the database
- WHEN an authorized user submits an update setting `is_active` to `false`
- THEN the system MUST mark the category as inactive and preserve existing linked activities

#### Scenario: Listing active categories for selection
- GIVEN active and inactive activity categories in the database
- WHEN a user requests available categories for activity creation
- THEN the system MUST return only categories where `is_active` is `true`

### Requirement: Category Scope Filtering
The system MUST filter active categories by target `scope` ('academic', 'scientific', or 'both') based on the activity creation context.
#### Scenario: Fetching categories for scientific activities
- GIVEN a request to list categories for a scientific activity modal
- WHEN querying categories with scope filtering for 'scientific'
- THEN the system MUST return categories having `scope` set to 'scientific' or 'both'

#### Scenario: Unique category code enforcement
- GIVEN an existing category with code `CONGRESO`
- WHEN a user attempts to create a new category with code `CONGRESO`
- THEN the system MUST reject the request with HTTP 400 Bad Request indicating a duplicate code error

### Requirement: Seeding Legacy Category Enums
The system MUST automatically seed initial `ActivityCategory` records from existing legacy `ScientificActivityType` enums and category strings during Alembic database migration.
#### Scenario: Migration execution populates initial categories
- GIVEN an environment running the dynamic activity categories migration
- WHEN the migration completes execution
- THEN the system MUST populate `ActivityCategory` with legacy category values marked as active with default scopes
