# Domain: Backend Test Infrastructure

## Purpose

Define the acceptance criteria for repairing the backend test infrastructure so the test suite can run reliably without import errors.

## Requirements

### Requirement: Pytest Dependency Declared

The system MUST declare `pytest` as a backend dependency in `backend/pyproject.toml`.

#### Scenario: Inspect backend dependencies

- GIVEN the backend `pyproject.toml` file
- WHEN the dependencies are reviewed
- THEN `pytest` MUST be listed in the appropriate dependency section

### Requirement: Test Suite Runs Without Import Errors

The command `docker compose exec backend pytest` MUST complete without import errors.

#### Scenario: Run the backend test suite

- GIVEN the backend container is running
- WHEN the command `docker compose exec backend pytest` is executed
- THEN the test runner MUST start without import errors

### Requirement: Stale Tests Fixed or Quarantined

Tests that reference missing modules or broken endpoints MUST be either fixed to match the current codebase or quarantined.

#### Scenario: Stale test references missing module

- GIVEN a test imports `app.models.auth` which no longer exists
- WHEN the test suite is reviewed
- THEN the test MUST be updated to use the correct module
- OR the test MUST be quarantined with a clear marker

### Requirement: Quarantined Tests Do Not Fail the Suite

Quarantined tests MUST NOT cause the overall test suite to fail.

#### Scenario: Quarantined test is skipped

- GIVEN a test is marked as quarantined
- WHEN the test suite runs
- THEN the quarantined test MUST be skipped or reported separately
- AND the remaining suite MUST determine the pass/fail outcome

### Requirement: Existing Valid Tests Remain Passing

Tests that verify existing behavior SHOULD remain passing after the repair.

#### Scenario: Existing valid test runs

- GIVEN a test verifies existing API behavior
- WHEN the test suite runs
- THEN the test SHOULD pass

### Requirement: No New Business Logic Tests Required

This change MUST NOT require new tests for business logic; the scope is limited to restoring a runnable test infrastructure.

#### Scenario: Scope of test repair

- GIVEN the test repair work is complete
- WHEN the changes are reviewed
- THEN the changes MUST be limited to dependency declarations, import fixes, quarantine markers, or minimal test updates
