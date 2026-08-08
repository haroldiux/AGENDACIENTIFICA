# activities Specification

## ADDED Requirements
### Requirement: Dynamic Category Linking for Activities
The system MUST support an optional foreign key `category_id` referencing `ActivityCategory` on `AcademicActivity` and `ScientificActivity` models.
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

## MODIFIED Requirements
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
