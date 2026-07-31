# Domain: Career Research Agenda View

## Purpose

Define the friendly month-grouped card agenda that replaces the `calendario` placeholder for displaying per-career scientific research activities.

## Requirements

### Requirement: Career Selector

The `calendario` page MUST provide a career selector populated from `GET /api/v1/careers`.

#### Scenario: User opens the agenda page

- GIVEN the user navigates to `/calendario`
- WHEN the page loads
- THEN the career selector MUST display the list of available careers

### Requirement: Gestión Selector

The `calendario` page MUST provide a gestión selector.

#### Scenario: User changes the gestión filter

- GIVEN the agenda is displaying activities for a gestión
- WHEN the user selects a different gestión
- THEN the agenda MUST fetch and display activities for the selected gestión

### Requirement: Month-Grouped Agenda

When a career is selected, the agenda MUST display scientific activities grouped by month using the activity start date.

#### Scenario: User selects a career and sees grouped activities

- GIVEN scientific activities exist for the selected career and gestión
- WHEN the user selects the career
- THEN the agenda MUST render one group per month
- AND each group MUST contain the activities that start in that month

### Requirement: Chronological Ordering

Months MUST be ordered chronologically, and activities within a month MUST be ordered by start date ascending.

#### Scenario: Activities span multiple months

- GIVEN activities start in March, January, and February
- WHEN the agenda renders
- THEN months MUST appear as January, February, March
- AND activities within each month MUST be ordered by start date

### Requirement: Activity Card Content

Each activity card MUST display the activity title, type, responsible name, date range, and status.

#### Scenario: User reads an activity card

- GIVEN the agenda renders an activity
- WHEN the user views the card
- THEN the card MUST show the title, type badge, responsible name, start/end dates, and status

### Requirement: Empty State

When no activities match the selected filters, the agenda MUST display an empty state message.

#### Scenario: No activities for the selected filters

- GIVEN the selected career and gestión have no scientific activities
- WHEN the agenda fetch completes
- THEN the page MUST show an empty state indicating no activities were found

### Requirement: Loading State

While activities are being fetched, the agenda MUST display a loading indicator.

#### Scenario: Agenda data is loading

- GIVEN the user changes the career filter
- WHEN the fetch is in progress
- THEN the agenda MUST show a loading state

### Requirement: Error State

If the agenda fetch fails, the page MUST display an error message.

#### Scenario: Agenda fetch fails

- GIVEN the backend returns an error for the scientific activities request
- WHEN the fetch completes with an error
- THEN the agenda MUST display an error message

### Requirement: Export Button

The agenda MUST provide an "Export agenda PDF" button that triggers the research-agenda PDF report for the selected filters.

#### Scenario: User exports the agenda

- GIVEN the user has selected a career and gestión
- WHEN the user clicks the "Export agenda PDF" button
- THEN the system MUST request the research-agenda PDF report with the selected filters
