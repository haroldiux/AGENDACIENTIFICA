# Delta for Agenda Científica

## ADDED Requirements

### Requirement: Render Scientific Agenda

The `calendario` page MUST render a scientific research agenda instead of the placeholder text.

#### Scenario: User views the calendario page

- GIVEN the user navigates to `/calendario`
- WHEN the page loads
- THEN the page MUST display the scientific agenda UI
- AND the placeholder text MUST NOT be visible

### Requirement: Agenda Filters

The scientific agenda MUST be filterable by career and gestión.

#### Scenario: User filters the agenda

- GIVEN the user is on `/calendario`
- WHEN the user selects a career and a gestión
- THEN the agenda MUST fetch scientific activities for those filters
- AND the agenda MUST update to show the matching activities

### Requirement: Month-Grouped Cards

The scientific agenda MUST display activities as month-grouped cards.

#### Scenario: Activities are grouped by month

- GIVEN scientific activities exist for the selected filters
- WHEN the agenda renders
- THEN activities MUST appear inside groups labeled by month
- AND the groups MUST be ordered chronologically

### Requirement: Career Selection Required

When no career is selected, the agenda MUST show a prompt guiding the user to select a career.

#### Scenario: No career selected

- GIVEN the user opens `/calendario`
- WHEN no career is selected
- THEN the agenda MUST display a message prompting the user to select a career

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.
