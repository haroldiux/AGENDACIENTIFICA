# User Management Delta Specification

## MODIFIED Requirements

### Requirement: User Import Excel Template Download
The system MUST provide a `GET /api/v1/users/excel-template` endpoint that queries active careers from the database, builds a secondary reference worksheet named `"Catalogos"` populated with role choices and active careers (`ID - Nombre`), and attaches Excel `DataValidation` dropdown list rules to rows 2-500 of the `"Usuarios"` worksheet for Role and Career columns.

#### Scenario: Admin downloads template with dynamic catalog reference sheet and data validations
- GIVEN an authenticated admin user and active careers in the database
- WHEN requesting `GET /api/v1/users/excel-template`
- THEN the system MUST return a 200 OK `.xlsx` file containing a `"Catalogos"` worksheet and native `DataValidation` dropdown lists for Role and Career columns on rows 2-500.

#### Scenario: Admin downloads template when no active careers exist in database
- GIVEN an authenticated admin user and zero active careers in the database
- WHEN requesting `GET /api/v1/users/excel-template`
- THEN the system MUST populate `"Catalogos"` with a fallback career entry ("1 - Carrera General") and generate the `.xlsx` file successfully.

#### Scenario: Non-blocking data validation for multi-career entry
- GIVEN a generated Excel template workbook
- WHEN inspecting the Career column `DataValidation` configuration
- THEN the system MUST set `showErrorMessage=False` on the validation rule to permit manual entry of comma-separated career options.

### Requirement: Bulk User Excel Import with Row Error Reporting
The system MUST process uploaded `.xlsx` files via `POST /api/v1/users/import-excel`, flexibly resolving friendly Spanish role names or enum codes to internal `RoleEnum` members, and using regex parsing to extract numeric career IDs from single or comma-separated formatted dropdown strings (`ID - Nombre`).

#### Scenario: Import users with friendly Spanish role descriptions and formatted career dropdown values
- GIVEN an `.xlsx` import file with role "Docente" and career "67 - Ingeniería de Sistemas"
- WHEN an admin uploads the file to `POST /api/v1/users/import-excel`
- THEN the system MUST resolve the role to `RoleEnum.TEACHER` and career ID to `67`, creating the user successfully.

#### Scenario: Import users with multiple formatted career dropdown selections
- GIVEN an `.xlsx` import file with career string "67 - Ingeniería de Sistemas, 68 - Medicina"
- WHEN an admin uploads the file to `POST /api/v1/users/import-excel`
- THEN the system MUST extract numeric career IDs `[67, 68]` and associate the user with both active careers.
