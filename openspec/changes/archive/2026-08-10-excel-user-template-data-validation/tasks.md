# Tasks: Excel User Template Data Validation

## Phase 1: Backend Excel Template Data Validation
- [x] `backend/app/api/v1/users.py`: Inject `db: Session = Depends(get_db)` into `get_user_excel_template` endpoint signature and query active careers ordered by ID.
- [x] `backend/app/api/v1/users.py`: Add `"Catalogos"` secondary reference worksheet with Spanish role names in Column A and active careers formatted as `"ID - Nombre"` (or fallback `"1 - Carrera General"`) in Column B.
- [x] `backend/app/api/v1/users.py`: Create and attach openpyxl `DataValidation` list rules targeting rows 2-500 of the `"Usuarios"` worksheet (Column C for Roles referencing `=Catalogos!$A$2:$A$10`, and Column G for Careers referencing `=Catalogos!$B$2:$B$N` with `showErrorMessage=False`).

## Phase 2: Flexible Excel Import Parser
- [x] `backend/app/api/v1/users.py`: Implement `ROLE_MAP` dictionary supporting Spanish role descriptions (e.g. `"Docente"`, `"Coordinador"`) and raw enum values for `RoleEnum` resolution.
- [x] `backend/app/api/v1/users.py`: Implement `extract_career_ids` regex helper (`r'^\s*(\d+)'`) to extract integer career IDs from single or comma-separated dropdown selection strings.
- [x] `backend/app/api/v1/users.py`: Integrate `ROLE_MAP` and `extract_career_ids` into `import_users_excel` row processing loop.

## Phase 3: Unit Testing & Verification
- [x] `backend/tests/test_user_management.py`: Update `test_get_user_excel_template` to verify `"Catalogos"` worksheet creation, role/career values, and `DataValidation` properties (`showErrorMessage=False`).
- [x] `backend/tests/test_user_management.py`: Add test case for zero-careers fallback scenario ensuring `"1 - Carrera General"` is populated in template `"Catalogos"`.
- [x] `backend/tests/test_user_management.py`: Update `test_import_users_excel` to test import of users using Spanish role labels and formatted career dropdown strings.
