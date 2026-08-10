# Exploration: Excel User Import Template Native Data Validation Dropdown ComboBoxes

## Current State
In `backend/app/api/v1/users.py`:
- `get_user_excel_template` currently generates a simple `.xlsx` spreadsheet using `openpyxl` containing static headers (`Email *`, `Nombre Completo`, `Rol`, `Teléfono`, `Telegram Chat ID`, `Contraseña`, `IDs Carreras (separadas por coma)`).
- The generated template lacks native Excel Data Validation dropdown comboboxes. Users must manually guess or type role enum codes (`teacher`, `coordinator`, etc.) and raw numeric career IDs.
- `import_users_excel` expects exact lowercased string matches against `RoleEnum` key names and relies on basic integer check (`str.isdigit()`) for career IDs. If a user inputs friendly Spanish role names (e.g. `"Docente"`) or formatted career dropdown options (e.g. `"67 - Ingeniería de Sistemas"`), the importer fails or defaults to fallback values.

## Affected Areas
- `backend/app/api/v1/users.py`:
  - `get_user_excel_template`: Inject `db: Session = Depends(get_db)` to query active DB careers (`Career.id`, `Career.name`). Create a reference worksheet `"Catalogos"` containing all valid roles with friendly Spanish labels and all active DB careers (`ID - Nombre`). Attach openpyxl `DataValidation` objects to rows 2-500 for Roles (Column C or D) and Carreras (Column E or G).
  - `import_users_excel`: Upgrade parser logic to cleanly resolve role codes or friendly Spanish labels (e.g. `"Docente"`, `"Coordinador"`, `"teacher - Docente"`, `"Docente (teacher)"`) to their corresponding `RoleEnum` member. Upgrade career ID parser using regex/splitting to extract numeric IDs from formatted dropdown strings (e.g. `"67 - Ingeniería de Sistemas"` -> `67`, `"67 - Ingeniería de Sistemas, 68 - Medicina"` -> `[67, 68]`).
- `backend/tests/test_user_management.py`:
  - `test_get_user_excel_template`: Verify that the generated workbook contains the `"Catalogos"` reference worksheet and that data validation is attached to the primary worksheet.
  - `test_import_users_excel`: Add test cases verifying import of users with friendly Spanish role labels, formatted single dropdown career values, and multi-career formatted selections.

## Approaches
1. **Approach 1: Integrated openpyxl Reference Sheet Catalog (`"Catalogos"`) + Flexible Parser Mapping (Recommended)**
   - **Description**: Create a `"Catalogos"` worksheet with populated columns for Roles and Careers. Configure `openpyxl.worksheet.datavalidation.DataValidation` list formulas pointing to ranges in `"Catalogos"` for rows 2 through 500 on the `"Usuarios"` worksheet. Update `import_users_excel` with a `ROLE_LOOKUP` dictionary + fallback string splitter for roles, and a regex numeric extractor for career IDs.
   - **Pros**: Native, intuitive Excel dropdown combobox experience for end users; fully backwards compatible with existing numeric career IDs and plain role codes; handles single and multi-career selections seamlessly.
   - **Cons**: Requires database access during template generation (standard FastAPI pattern).
   - **Effort**: Low to Medium.

2. **Approach 2: Hardcoded In-Cell DataValidation Formula Strings without Catalog Sheet**
   - **Description**: Embed literal comma-separated strings inside `formula1` (e.g. `formula1='"teacher,coordinator,teacher"'`) without creating a reference sheet.
   - **Pros**: Avoids creating a second worksheet in the workbook.
   - **Cons**: Excel enforces a 255-character limit on inline list data validation formulas, which truncates career lists when multiple careers exist in DB; cannot display friendly Spanish labels alongside IDs cleanly.
   - **Effort**: Medium.

## Recommendation
Adopt **Approach 1**. Create the reference sheet `"Catalogos"`, configure native `DataValidation` list formulas, set `showErrorMessage=False` on the Carreras validation range to allow multi-selection text input, and implement flexible role resolution + regex career ID extraction in `import_users_excel`.

## Risks
- **Empty Careers in Database**: If the database contains no active careers when generating the template, an empty range formula in Excel could cause a validation error.
  *Mitigation*: Fall back to a default placeholder row (e.g. `"1 - Carrera General"`) if DB career count is 0.
- **Strict Excel Validation on Multi-Career Input**: If `showErrorMessage=True` is enabled on Carreras data validation, Excel will block users from typing multiple comma-separated careers.
  *Mitigation*: Set `showErrorMessage=False` for Carreras data validation so users can select a single career from the dropdown or type multiple careers separated by commas.

## Ready for Proposal
Yes — Ready for `sdd-propose` to generate formal specifications, design proposal, and task breakdown.
