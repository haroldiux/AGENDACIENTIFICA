# activities Specification

## Purpose
Manage the lifecycle, scheduling, permissions, and visibility of scientific activities within the system's calendar.

## ADDED Requirements
### Requirement: Update Activity Status from UI
The system MUST allow users to change the status of a scientific activity directly from the calendar event detail modal via an interactive selection.
#### Scenario: Change status successfully
- GIVEN a user has a scientific activity open in the calendar modal
- WHEN the user selects a new status from the dropdown
- THEN the system calls the API to update the activity and displays the new status upon success
#### Scenario: Handle update failure
- GIVEN a user attempts to change the status
- WHEN the backend API request fails
- THEN the system reverts the optimistic update and displays an error toast notification

### Requirement: Persist Status Updates without Restrictions
The system MUST accept and persist the `status` field during scientific activity updates, allowing free lifecycle status changes without strict transition restrictions.
#### Scenario: Update schema supports status
- GIVEN the backend receives an update request for a scientific activity
- WHEN the payload includes a valid `status`
- THEN the system updates the record's status in the database

### Requirement: Enforce Director Edit Permissions
The system MUST allow Directors to edit activities only if the activities belong to their assigned careers.
#### Scenario: Director edits own career activity
- GIVEN a user with the Director role
- WHEN they attempt to edit a scientific activity belonging to their career
- THEN the system permits the update
#### Scenario: Director edits other career activity
- GIVEN a user with the Director role
- WHEN they attempt to edit a scientific activity belonging to a different career
- THEN the system denies the action

### Requirement: Enforce Investigator Permissions
The system MUST allow Investigators to edit or delete research activities across any career.
#### Scenario: Investigator edits research activity
- GIVEN a user with the Investigator role
- WHEN they attempt to edit or delete a research activity in any career
- THEN the system permits the action

### Requirement: Cancelled Activity Visibility
The system MUST ensure that scientific activities with a 'cancelled' status remain visible on the calendar.
#### Scenario: Cancelled activities are shown
- GIVEN a scientific activity is marked as cancelled
- WHEN a user views the calendar
- THEN the cancelled activity remains visible in the view
