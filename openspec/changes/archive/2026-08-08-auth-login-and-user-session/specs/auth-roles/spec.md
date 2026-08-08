# Auth & Roles Specification Delta

## ADDED Requirements

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
