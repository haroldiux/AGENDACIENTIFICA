# Delta for UI

## ADDED Requirements

### Requirement: Activity Form Field Renaming and Ordering
The activity creation/edit modal MUST rename "Tipo de Actividad" to "Tipo de Evento" and "Categoria Dinamica" to "Categoria", display hint text for each, and render "Categoria" above "Tipo de Evento" in the field layout.

#### Scenario: Activity modal renders correct labels
- GIVEN a user opens `ActivityModal.tsx` to create or edit a scientific activity
- WHEN the form renders
- THEN the label "Tipo de Evento" MUST appear (not "Tipo de Actividad") and "Categoria" MUST appear (not "Categoria Dinamica")

#### Scenario: Categoria field is above Tipo de Evento
- GIVEN a user opens `ActivityModal.tsx`
- WHEN the form layout renders
- THEN the "Categoria" dropdown MUST appear before (above) the "Tipo de Evento" dropdown in DOM order

#### Scenario: Hint text displayed for both fields
- GIVEN a user opens `ActivityModal.tsx`
- WHEN the form renders
- THEN a hint/description text MUST be visible beneath each of the "Categoria" and "Tipo de Evento" fields

### Requirement: Collaboration Careers Multi-Select in Activity Form
The activity creation/edit modal MUST include a "Carreras en Colaboracion" multi-select component that allows selecting one or more additional careers, excluding the primary selected career, bound to `collaboration_career_ids`.

#### Scenario: Multi-select excludes primary career
- GIVEN a user has selected "Ingenieria en Sistemas" as the primary career
- WHEN the "Carreras en Colaboracion" multi-select renders
- THEN "Ingenieria en Sistemas" MUST NOT appear as a selectable option in that multi-select

#### Scenario: Editing an activity pre-fills collaboration careers
- GIVEN an existing activity has stored collaboration career IDs
- WHEN the user opens `ActivityModal.tsx` in edit mode for that activity
- THEN the "Carreras en Colaboracion" multi-select MUST be pre-populated with those stored career IDs

### Requirement: Sortable Columns on Activities Table
The activities table on `/actividades` MUST support client-side sorting by column: Nombre, Fecha, Tipo, Carrera, and Estado. The default sort MUST be Fecha ASC. Column headers MUST show an up/down direction indicator reflecting the active sort state.

#### Scenario: Default sort on page load
- GIVEN a user navigates to the `/actividades` page
- WHEN the activities table renders
- THEN rows MUST be sorted by Fecha in ascending order and the Fecha header MUST display the ascending indicator

#### Scenario: Clicking a sortable column header
- GIVEN the activities table is displayed with Fecha ASC sort active
- WHEN the user clicks the "Nombre" column header
- THEN the table rows MUST re-sort by Nombre ASC and the Nombre header MUST display the ascending indicator

#### Scenario: Toggling sort direction
- GIVEN the activities table is sorted by Nombre ASC
- WHEN the user clicks the "Nombre" column header again
- THEN the table MUST re-sort by Nombre DESC and the Nombre header indicator MUST switch to descending

## MODIFIED Requirements

*(none)*

## REMOVED Requirements

*(none)*
