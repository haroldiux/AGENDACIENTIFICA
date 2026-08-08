# Delta for Fusion Engine

## ADDED Requirements

### Requirement: Global and Career Calendar Event Fusion
The Fusion Engine MUST merge global events (`career_id IS NULL`) and career-scoped events (`career_id == X`) when querying a specific career calendar feed.

#### Scenario: Querying calendar feed for a specific career
- GIVEN global events and career-scoped events exist in the system
- WHEN a user requests the calendar feed for career ID "MED-01"
- THEN the system MUST return all events belonging to "MED-01" AND all global events where `career_id` is null

#### Scenario: Querying global-only calendar feed
- GIVEN global events exist alongside multiple career-scoped events
- WHEN a user requests the calendar feed without a career filter (`career_id` is null or all)
- THEN the system MUST return all global events across the institution

## MODIFIED Requirements

### Requirement: Multi-Calendar Scope Distinction in UI
The frontend calendar view MUST display scope badges ("Global" vs "Carrera") for each rendered activity card to visually distinguish global institutional events from career-specific events.

#### Scenario: Rendering activity cards with scope indicators
- GIVEN a merged list of global and career-scoped activities
- WHEN the frontend renders the calendar view
- THEN global activities MUST display a prominent "Global" scope badge
- AND career-scoped activities MUST display a badge indicating the specific career name

## REMOVED Requirements
None.
