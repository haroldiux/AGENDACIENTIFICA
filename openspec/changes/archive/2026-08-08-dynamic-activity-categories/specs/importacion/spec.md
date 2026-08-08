# importacion Specification

## MODIFIED Requirements
### Requirement: Dynamic Category Resolution during Excel Import
The system MUST resolve activity categories dynamically by category `name` or `code` against active `ActivityCategory` entities during bulk Excel import in `importacion.py`, falling back to legacy category string mapping if no dynamic match is found.
#### Scenario: Importing Excel row with matching dynamic category name
- GIVEN an Excel import file containing an activity row with category name "Jornada de Investigación"
- WHEN the backend processes the row
- THEN the backend MUST query `ActivityCategory` by name or code, assign the corresponding `category_id` to the activity, and bulk-insert the record

#### Scenario: Importing Excel row with unmatched category name
- GIVEN an Excel import file containing a category name that does not match any active `ActivityCategory`
- WHEN the backend processes the row
- THEN the backend MUST fall back to assigning the raw string to the legacy `category` field without failing the row import

#### Scenario: Excel import with inactive dynamic category
- GIVEN an Excel import file referencing a category code for an inactive `ActivityCategory`
- WHEN the backend processes the row
- THEN the backend MUST treat the category as unresolved, log a warning, and fall back to the legacy string mapping
