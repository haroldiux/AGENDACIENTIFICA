# Technical Design: Excel User Template Data Validation

## Technical Approach
The Excel template generator (`GET /api/v1/users/excel-template`) will be upgraded to populate native Excel `DataValidation` dropdown comboboxes for user roles and active academic careers. Dynamic database active careers will be queried using an injected SQLAlchemy `Session`. A secondary catalog worksheet named `"Catalogos"` will store reference lists for valid user roles (using user-friendly Spanish names) and active careers in `"ID - Nombre"` format (with a fallback if no careers exist). `DataValidation` list formulas referencing this catalog sheet will be assigned to rows 2-500 of the primary `"Usuarios"` sheet. To allow selecting multiple careers separated by commas, the career dropdown validation will have `showErrorMessage=False`.

On the import side (`POST /api/v1/users/import-excel`), the parser will be enhanced with flexible role lookups (mapping Spanish descriptions like `"Docente"` or `"Coordinador"` as well as raw enum keys to `RoleEnum` members) and regex pattern matching (`r'^\s*(\d+)'`) to extract integer career IDs from single or multi-selected dropdown strings (e.g. `"67 - Ingeniería de Sistemas, 68 - Medicina"` -> `[67, 68]`).

## Architecture Decisions

### Decision: Integrated Reference Worksheet (`Catalogos`) for Data Validation
**Choice**: Store validation lists in a dedicated `"Catalogos"` reference worksheet within the generated `.xlsx` workbook and point `"Usuarios"` data validation rules to cell ranges on that sheet (`Catalogos!$A$2:$A$10` and `Catalogos!$B$2:$B$N`).
**Alternatives considered**: 
1. Inline hardcoded string literals inside `DataValidation(formula1='"Docente,Coordinador,..."')`: Rejected due to Excel's 255-character string limit for inline formulas and inability to handle dynamic database data cleanly.
2. Dynamic macro / VBA code injection: Rejected due to security warnings and file format requirements (`.xlsm`).
**Rationale**: Dedicated catalog worksheets are standard practice for Excel templates, providing unlimited list length and seamless support for database-driven career lists while maintaining standard `.xlsx` compatibility.

### Decision: Non-blocking Validation (`showErrorMessage=False`) for Multi-Career Entry
**Choice**: Configure `showErrorMessage=False` on the Career column `DataValidation` rule.
**Alternatives considered**: 
1. Strict blocking list validation (`showErrorMessage=True`): Rejected because Excel's native list validation restricts cell contents to a single exact dropdown item, blocking multi-career comma-separated input.
2. Separate career columns in template (e.g. Career 1, Career 2, Career 3): Rejected because it changes the existing user import schema and breaks existing client integration.
**Rationale**: Setting `showErrorMessage=False` preserves the dropdown combobox autocomplete user experience while allowing spreadsheet users to type or concatenate multiple career strings (e.g., `"67 - Ingeniería de Sistemas, 68 - Medicina"`).

### Decision: Flexible Regex & Map Parser for Import Compatibility
**Choice**: Implement a flexible `ROLE_MAP` dictionary for Spanish role titles and enum keys, paired with regex leading-digit extraction (`re.search(r'^\s*(\d+)', item)`) for career strings.
**Alternatives considered**: Strict parsing requiring exact integer IDs and exact lowercased enum keys: Rejected because users selecting entries directly from template dropdowns would fail import with validation errors.
**Rationale**: Provides full backward compatibility for raw inputs while supporting human-readable dropdown strings seamlessly.

## Data Flow
```
+-----------------------------------------------------------------------------------+
|                            Template Generation Flow                               |
+-----------------------------------------------------------------------------------+
| 1. Client -> GET /api/v1/users/excel-template                                     |
| 2. `get_user_excel_template` receives DB session (`db: Session = Depends(get_db)`) |
| 3. Query active careers: `db.query(Career).order_by(Career.id).all()`             |
| 4. Create Workbook with worksheets `"Usuarios"` and `"Catalogos"`                 |
| 5. Write Roles (Spanish labels) & Careers (`"{id} - {name}"`) to `"Catalogos"`     |
| 6. Attach `DataValidation` list formulas to `"Usuarios"` cols C & G (rows 2-500)  |
| 7. Return binary .xlsx stream (`Response`)                                       |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
|                              User Import Flow                                     |
+-----------------------------------------------------------------------------------+
| 1. Client -> POST /api/v1/users/import-excel with uploaded file                   |
| 2. `import_users_excel` opens workbook with `openpyxl.load_workbook`              |
| 3. For each data row:                                                             |
|    a. Parse Role: normalize string & match against `ROLE_MAP` -> `RoleEnum`       |
|    b. Parse Careers: split string by `,`, extract IDs via regex `r'^\s*(\d+)'`    |
|    c. DB query: `db.query(Career).filter(Career.id.in_(cids)).all()`              |
|    d. Create `User` record with associated careers                                |
| 4. Return `UserImportReport` JSON summary                                         |
+-----------------------------------------------------------------------------------+
```

## File Changes
| File | Action | Description |
| --- | --- | --- |
| `backend/app/api/v1/users.py` | Modify | 1. Inject `db: Session = Depends(get_db)` into `get_user_excel_template`.<br>2. Build `"Catalogos"` worksheet with Spanish roles and active DB careers (`"{id} - {name}"` or fallback `"1 - Carrera General"`).<br>3. Add openpyxl `DataValidation` lists for Role (Col C) and Career (Col G, `showErrorMessage=False`) on rows 2-500.<br>4. Update `import_users_excel` with flexible Spanish role lookup map and regex numeric career ID extractor. |
| `backend/tests/test_user_management.py` | Modify | Add comprehensive tests for `"Catalogos"` catalog sheet generation, `DataValidation` properties, zero-careers fallback scenario, and flexible user import using Spanish role labels and formatted career dropdown strings. |

## Interfaces / Contracts

### Role Lookup Mapping (`ROLE_MAP`)
```python
ROLE_MAP = {
    # Spanish labels
    "docente": RoleEnum.teacher,
    "coordinador": RoleEnum.coordinator,
    "investigador": RoleEnum.research,
    "administrador": RoleEnum.admin,
    "super admin": RoleEnum.super_admin,
    "lectura": RoleEnum.read_only,
    "vicerrectorado": RoleEnum.vicerrectorado,
    "director de investigación": RoleEnum.director_investigacion,
    "director de investigacion": RoleEnum.director_investigacion,
    "jefe de investigación": RoleEnum.jefe_investigacion,
    "jefe de investigacion": RoleEnum.jefe_investigacion,
    # Direct enum value fallbacks
    **{r.value.lower(): r for r in RoleEnum}
}
```

### Career Regex Extractor
```python
import re

def extract_career_ids(careers_val: str) -> List[int]:
    cids = []
    for token in careers_val.split(","):
        token = token.strip()
        match = re.search(r'^\s*(\d+)', token)
        if match:
            cids.append(int(match.group(1)))
    return cids
```

### Worksheet Specifications
- **Worksheet 1 (`"Usuarios"`)**:
  - Columns: `Email *` (A), `Nombre Completo` (B), `Rol` (C), `Teléfono` (D), `Telegram Chat ID` (E), `Contraseña` (F), `IDs Carreras (separadas por coma)` (G).
  - Validation C2:C500 -> `=Catalogos!$A$2:$A$10`
  - Validation G2:G500 -> `=Catalogos!$B$2:$B${N}`, `showErrorMessage=False`
- **Worksheet 2 (`"Catalogos"`)**:
  - Column A (Roles): Header `Roles`, Rows 2-10 (Spanish titles).
  - Column B (Carreras): Header `Carreras`, Rows 2-N (`"{id} - {name}"` or `"1 - Carrera General"`).

## Testing Strategy
| Layer | What to Test | Approach |
| --- | --- | --- |
| API / Integration | Template generation with Data Validation | Request `GET /api/v1/users/excel-template`, inspect openpyxl workbook for `"Catalogos"` sheet, verify data validation ranges and `showErrorMessage=False` on Career column. |
| API / Integration | Template fallback with zero DB careers | Mock/clear DB careers, request template, verify `"Catalogos"` row 2 contains `"1 - Carrera General"`. |
| API / Integration | User import with Spanish roles & dropdown career strings | Post `.xlsx` to `/import-excel` with role `"Docente"` and career `"67 - Ingeniería de Sistemas, 68 - Medicina"`, assert `User` created with `RoleEnum.teacher` and linked careers `[67, 68]`. |

## Migration / Rollout
- No database schema or table migrations needed.
- Fully backward compatible with legacy integer-only career IDs and enum-only role strings.

## Open Questions
- None.
