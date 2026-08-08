# Delta for Activities

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Dynamic Category Linking for Activities
The system MUST decouple `activity_type` from the category selection. Changing a `category_id` MUST NOT automatically overwrite the `activity_type` / "Tipo de Evento" field.

#### Scenario: Selecting a category does not auto-fill activity type
- GIVEN a user creating or editing a scientific activity in the modal
- WHEN the user selects a value in the "Categoria" dropdown
- THEN the "Tipo de Evento" field MUST remain unchanged and require independent selection

## REMOVED Requirements

*(none)*
