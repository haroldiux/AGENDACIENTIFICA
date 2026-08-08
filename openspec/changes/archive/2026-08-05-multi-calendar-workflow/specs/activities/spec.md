# Delta for Activities

## ADDED Requirements

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

#### Scenario: Deleting activity evidence
- GIVEN an authorized user and an existing activity evidence attachment
- WHEN sending a deletion request for the attachment ID
- THEN the system MUST remove the physical file from storage and delete the database metadata record

## MODIFIED Requirements

### Requirement: Nullable Career Scope for Activities
The system MUST permit `career_id` to be null on `AcademicActivity` and `ScientificActivity` models to represent global institutional events.

#### Scenario: Creating a global activity
- GIVEN an authorized institutional user
- WHEN submitting an activity creation request with `career_id` omitted or set to null
- THEN the system MUST persist the activity with `career_id = NULL` as a global event

## REMOVED Requirements
None.
