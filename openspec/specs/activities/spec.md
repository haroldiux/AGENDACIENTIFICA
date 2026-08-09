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

### Requirement: Scientific Activity Evidence Attachments
The system MUST provide dedicated endpoints (`POST`, `GET`, `DELETE`) for uploading, retrieving, and removing file evidence attachments (`ScientificActivityEvidence`) linked to a scientific activity.
#### Scenario: Uploading valid evidence document
- GIVEN an authorized user viewing a scientific activity
- WHEN uploading a valid file attachment (PDF, PNG, JPG, or DOCX under 10MB)
- THEN the system MUST save the file to secure storage and attach the evidence metadata record to the activity
#### Scenario: Rejecting invalid file attachment upload
- GIVEN a user attempting to upload an evidence file
- WHEN the file exceeds 10MB or has an unapproved MIME type (e.g. EXE)
- THEN the system MUST reject the request with HTTP status 400 Bad Request and display an error message
### Requirement: Table View Status & Evidence Quick Management
The system MUST provide a dedicated "Cambiar Estado" action button and interactive badge in the `/actividades` table view, allowing users to update status, write notes/motives, and upload/delete evidence files without opening the full Edit modal.
#### Scenario: Change status from table view
- GIVEN an authorized user viewing the scientific activities table
- WHEN clicking the "Cambiar Estado" button or status badge for a row
- THEN the system displays the Status & Evidence sub-dialog pre-populated with current values and uploaded files

### Requirement: Individual Activity Printable Report Sheet (1-Page A4)
The system MUST provide a "Ver Informe" action button for every activity row that opens an individual activity report sheet modal containing complete activity metadata, start/end time, responsible, collaborator careers, uploaded evidences, and user-attributed audit timeline, with an institutional UNITEPC header and print CSS rules enforcing exactly 1 single A4 page print output.
#### Scenario: Printing activity report sheet
- GIVEN a user viewing an individual activity report sheet modal
- WHEN clicking "Imprimir Ficha PDF"
- THEN the browser print dialog MUST render exactly 1 single A4 page without background table leaks or dark theme artifacts

### Requirement: Field-Level Audit Trail and User Attribution
The system MUST record detailed audit events (`scientific_activity_audits`) in PostgreSQL for creation, status changes, main field edits with specific value diffs (`Old Value ➔ New Value`), and evidence file uploads/deletions, capturing the timestamp and user ID/role.
#### Scenario: Recording field diff audit
- GIVEN a user editing a scientific activity
- WHEN changing fields (e.g. title, dates, times, responsible, status)
- THEN the system records an audit entry containing exact field diff strings and the user's name and role

### Requirement: Role-Tailored Interactive Onboarding Tutorials
The system MUST provide an interactive step-by-step onboarding tutorial (`OnboardingTutorialModal.tsx`) that dynamically detects the authenticated user's role (`super_admin`, `carrera_director`, `read_only`) and assigned careers, displaying a customized walkthrough track with specific tips for their permission level.
#### Scenario: Opening role-tailored tutorial
- GIVEN a user logged in with a specific role
- WHEN opening the tutorial via sidebar or floating button
- THEN the system displays the tutorial track specifically tailored to their role and assigned career count
#### Scenario: Deleting activity evidence
- GIVEN an authorized user and an existing activity evidence attachment
- WHEN sending a deletion request for the attachment ID
- THEN the system MUST remove the physical file from storage and delete the database metadata record

### Requirement: Nullable Career Scope for Activities
The system MUST permit `career_id` to be null on `AcademicActivity` and `ScientificActivity` models to represent global institutional events.
#### Scenario: Creating a global activity
- GIVEN an authorized institutional user
- WHEN submitting an activity creation request with `career_id` omitted or set to null
- THEN the system MUST persist the activity with `career_id = NULL` as a global event

### Requirement: Dynamic Category Linking for Activities
The system MUST support an optional foreign key `category_id` referencing `ActivityCategory` on `AcademicActivity` and `ScientificActivity` models, AND MUST decouple `activity_type` from category selection — changing a `category_id` MUST NOT automatically overwrite the `activity_type` / "Tipo de Evento" field.

#### Scenario: Selecting a category does not auto-fill activity type
- GIVEN a user creating or editing a scientific activity in the modal
- WHEN the user selects a value in the "Categoria" dropdown
- THEN the "Tipo de Evento" field MUST remain unchanged and require independent selection
#### Scenario: Creating activity with dynamic category link
- GIVEN an authorized user creating an activity
- WHEN selecting an active dynamic category `category_id`
- THEN the system MUST store `category_id` on the activity record and populate response payloads with category details

#### Scenario: Creating activity with non-existent category ID
- GIVEN a user creating an activity
- WHEN submitting an invalid or non-existent `category_id`
- THEN the system MUST reject the request with HTTP 422 Unprocessable Entity or HTTP 400 Bad Request

### Requirement: Dynamic Category Selection in UI Modal
The frontend `ActivityModal.tsx` MUST dynamically fetch active categories matching the activity scope ('academic' or 'scientific') and present them in the category dropdown.
#### Scenario: Rendering category dropdown in activity modal
- GIVEN a user opening `ActivityModal.tsx` to create a scientific activity
- WHEN the modal loads
- THEN the dropdown MUST display active categories retrieved from `/api/v1/categories/` matching 'scientific' or 'both' scopes

### Requirement: Backward Compatible Category Resolution
The system MUST maintain full backward compatibility by preserving legacy string/enum `category` fields alongside new dynamic `category_id` references as fallbacks.
#### Scenario: Fetching activity with fallback to legacy category
- GIVEN an existing activity record with `category_id` as `NULL` and legacy category string set
- WHEN a client requests the activity detail or list
- THEN the system MUST return the activity with the legacy category value intact without errors

#### Scenario: Updating activity category reference
- GIVEN an existing activity record with legacy category string
- WHEN an authorized user updates the activity with a valid `category_id`
- THEN the system MUST store the new `category_id` while preserving existing record integrity

### Requirement: Collaboration Careers Association
The system MUST support a `scientific_activity_collaboration_careers` join table linking a `ScientificActivity` to zero or more additional careers beyond the primary `career_id`.

#### Scenario: Create activity with collaboration careers
- GIVEN an authorized user submitting a new scientific activity
- WHEN the payload includes a non-empty `collaboration_career_ids` array
- THEN the system MUST persist one row per career ID in the join table and return the full list in the response

#### Scenario: Update activity clears old collaboration careers
- GIVEN an existing scientific activity with collaboration careers
- WHEN an authorized user submits an update with a different `collaboration_career_ids` array
- THEN the system MUST replace (delete + re-insert) all previous join rows with the new set

#### Scenario: Empty collaboration careers array
- GIVEN an authorized user submitting a new or updated scientific activity
- WHEN `collaboration_career_ids` is omitted or is an empty array
- THEN the system MUST persist no rows in the join table and return an empty list in the response

### Requirement: Collaboration Career IDs in Schemas
The system MUST expose `collaboration_career_ids: Optional[List[int]] = []` in the scientific activity create, update, and response schemas.

#### Scenario: Response includes collaboration career IDs
- GIVEN a scientific activity with collaboration careers saved in the DB
- WHEN a client requests the activity detail or list endpoint
- THEN the response payload MUST include `collaboration_career_ids` with all associated career IDs

### Requirement: Alembic Migration for Collaboration Careers
The system MUST provide an Alembic migration that creates the `scientific_activity_collaboration_careers` table with `activity_id` (FK to `scientific_activities.id`) and `career_id` (FK to `careers.id`) columns and a composite primary key.

#### Scenario: Migration applies cleanly
- GIVEN a database without the join table
- WHEN `alembic upgrade head` is run
- THEN the table is created with correct constraints and no existing data is lost

#### Scenario: Migration rolls back cleanly
- GIVEN the join table exists
- WHEN `alembic downgrade -1` is run
- THEN the table is dropped without errors



