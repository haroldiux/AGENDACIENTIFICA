# Delta for Auth & Roles

## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements
None.
