# Auth & Roles Specification (Delta)

## MODIFIED Requirements
### Requirement: Client-Side Route Guard
The system MUST implement an `AuthGuard` client component that protects routes, redirecting unauthenticated users to `/login` for protected pages, while allowing unauthenticated access to whitelisted public routes `/portal` and `/public`.

#### Scenario: Unauthenticated user accesses protected route
- GIVEN a user who is not authenticated
- WHEN they navigate to any protected route other than `/login`, `/portal`, or `/public`
- THEN the system MUST redirect them to `/login`

#### Scenario: Unauthenticated user accesses public portal route
- GIVEN a user who is not authenticated
- WHEN they navigate to `/portal` or any `/public` route
- THEN the system MUST allow access without redirecting to `/login`

#### Scenario: Authenticated user accesses login route
- GIVEN a user who is already authenticated
- WHEN they navigate to `/login`
- THEN the system MUST redirect them to `/`
