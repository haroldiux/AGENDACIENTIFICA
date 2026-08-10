<Proposal: Excel User Template Data Validation>

## Intent
Enhance Excel user import template generation in `backend/app/api/v1/users.py` with native Excel Data Validation dropdown comboboxes for Roles and Careers, while updating `import_users_excel` to parse friendly Spanish role labels and formatted career dropdown strings.

## Scope
### In Scope
- Inject `db: Session` into `get_user_excel_template` to fetch active careers from the database.
- Add a hidden/secondary `"Catalogos"` worksheet containing valid user roles (with friendly Spanish descriptions) and active career entries (`ID - Nombre`).
- Configure `openpyxl.worksheet.datavalidation.DataValidation` dropdown list ranges on rows 2-500 of the `"Usuarios"` worksheet for Role and Career columns.
- Update `import_users_excel` to resolve Spanish role names (e.g. "Docente", "Coordinador") or raw codes to `RoleEnum` members.
- Update career parser with regex extraction to extract numeric career IDs from formatted dropdown options (e.g. `"67 - Ingeniería de Sistemas"` -> `67`).
- Add unit tests in `backend/tests/test_user_management.py` covering template data validation and user import with formatted role and career inputs.

### Out of Scope
- Frontend UI modifications for user import/export triggers.
- Database schema or model changes for `User` or `Career`.

## Approach
Implement Integrated openpyxl Reference Sheet Catalog (`"Catalogos"`) + Flexible Parser Mapping. The reference sheet holds lists for Roles and active DB Careers. `DataValidation` list formulas link to these ranges. Career validation uses `showErrorMessage=False` to permit comma-separated multi-career input. The backend importer uses flexible lookup dicts and regex to resolve human-readable dropdown strings back to internal IDs/enums.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `backend/app/api/v1/users.py` | High | Template generator queries DB & adds `DataValidation`; importer parses friendly labels & regex career IDs. |
| `backend/tests/test_user_management.py` | Medium | Test cases for template catalog sheet, data validation rules, and flexible import parsing. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Empty DB active careers list during template generation | Low | Insert a default fallback row (e.g., `"1 - Carrera General"`) if zero careers exist in DB. |
| Strict Excel validation blocking multi-career manual entry | Low | Set `showErrorMessage=False` on the Career `DataValidation` object. |

## Rollback Plan
Revert changes in `backend/app/api/v1/users.py` and `backend/tests/test_user_management.py` to restore standard static header Excel generation and basic integer parsing.

## Dependencies
- `openpyxl` library (already installed and used).
- Database access during `get_user_excel_template` endpoint invocation.

## Success Criteria
- [ ] Generated `.xlsx` template contains `"Catalogos"` reference sheet with valid roles and careers.
- [ ] Excel cells in rows 2-500 display interactive dropdown comboboxes for Role and Career fields.
- [ ] Importer successfully imports users selecting friendly Spanish roles ("Docente") and formatted career options ("67 - Ingeniería de Sistemas").
- [ ] All unit tests in `test_user_management.py` pass.
