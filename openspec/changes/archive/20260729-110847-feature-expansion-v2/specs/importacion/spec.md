# Requirements: importacion

## 1. Requirements (ADDED)

- **REQ-IMP-01:** The system MUST provide a frontend drag-and-drop zone using `react-dropzone` for uploading Excel (`.xlsx`) files containing activities.
- **REQ-IMP-02:** The system MUST expose a `POST /api/upload-excel` backend endpoint.
- **REQ-IMP-03:** The backend MUST process uploaded Excel files using `pandas` and/or `openpyxl`.
- **REQ-IMP-04:** The backend MUST strictly validate each parsed row using Pydantic schemas before insertion.
- **REQ-IMP-05:** The backend MUST bulk-insert valid rows into the PostgreSQL database via SQLAlchemy.
- **REQ-IMP-06:** The frontend MUST display upload progress indicators.
- **REQ-IMP-07:** The frontend MUST show robust toast notifications with the result of the bulk upload (success count, failure reasons).
- **REQ-IMP-08:** The system MUST gracefully handle file reading exceptions and malformed files.

## 2. Scenarios (ADDED)

### Scenario: Successful bulk upload of valid activities
- **Given** a user has a valid `.xlsx` file with activity records
- **When** the user uploads the file via the drag-and-drop zone
- **Then** the system shows an upload progress indicator
- **And** the backend validates all rows and bulk-inserts them into the database
- **And** the system displays a success toast notification with the number of inserted activities.

### Scenario: Bulk upload with malformed rows
- **Given** a user uploads an `.xlsx` file containing some invalid rows (e.g., missing mandatory data)
- **When** the backend processes the file
- **Then** the system inserts only the valid rows
- **And** returns a detailed response indicating which rows failed and why
- **And** the frontend displays a toast notification summarizing the successes and errors.

### Scenario: Uploading an invalid file format
- **Given** a user attempts to upload a non-Excel file (e.g., `.pdf`)
- **When** the user drops the file in the upload zone
- **Then** the frontend or backend MUST reject the file
- **And** the system displays an error toast notification indicating the invalid file format.
