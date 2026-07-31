# Requirements: core-models

## 1. Requirements (ADDED)

- **REQ-CM-01:** The system MUST define a new `Sede` model in the PostgreSQL database using SQLAlchemy.
- **REQ-CM-02:** The `Sede` model MUST store information about campus locations (e.g., Cochabamba, La Paz).
- **REQ-CM-03:** The system MUST establish a many-to-many (M:N) relationship between the new `Sede` model and the existing `Career` model.
- **REQ-CM-04:** The relationship MUST be implemented using an associative table `SedeCareer`.
- **REQ-CM-05:** The changes MUST be additively applied via Alembic migrations, ensuring existing `Career` queries do not break.
- **REQ-CM-06:** The system MUST provide backend CRUD operations for the `Sede` model.

## 2. Scenarios (ADDED)

### Scenario: Linking a Career to multiple Sedes
- **Given** the `Sede` and `SedeCareer` models are applied
- **When** a user (or administrator) assigns a `Career` (e.g., "Medicine") to multiple `Sede` entries (e.g., "Cochabamba" and "La Paz")
- **Then** the system saves the M:N relationships in the `SedeCareer` table
- **And** retrieving the `Career` correctly lists all associated `Sede` locations.

### Scenario: Legacy queries on Career remain functional
- **Given** the database schema has been updated with `Sede` and `SedeCareer`
- **When** the system executes an existing query retrieving a `Career`
- **Then** the query succeeds without errors
- **And** the introduction of the M:N relationship does not disrupt existing business logic.
