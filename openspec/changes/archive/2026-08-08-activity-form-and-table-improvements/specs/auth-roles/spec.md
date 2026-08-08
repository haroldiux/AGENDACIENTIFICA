# Delta for Auth-Roles

## ADDED Requirements

### Requirement: Role-Gated Global Activity Toggle
The system MUST hide the "Es actividad global/institucional" toggle from users with the `jefe_investigacion` or `coordinador` role by evaluating the current user role client-side via `useUser()`.

#### Scenario: jefe_investigacion opens activity form
- GIVEN a user with the `jefe_investigacion` role opens `ActivityModal.tsx`
- WHEN the form renders
- THEN the "Es actividad global/institucional" toggle MUST NOT be visible in the DOM

#### Scenario: coordinador opens activity form
- GIVEN a user with the `coordinador` role opens `ActivityModal.tsx`
- WHEN the form renders
- THEN the "Es actividad global/institucional" toggle MUST NOT be visible in the DOM

#### Scenario: vicerrectorado or director_investigacion opens activity form
- GIVEN a user with the `vicerrectorado` or `director_investigacion` role opens `ActivityModal.tsx`
- WHEN the form renders
- THEN the "Es actividad global/institucional" toggle MUST be visible and interactive

### Requirement: Career-Scoped Career Dropdown Pre-fill
The system MUST pre-fill the "Carrera" dropdown in `ActivityModal.tsx` using `user.careers` from the auth context and MUST restrict the selectable options to careers in `user.careers` for career-scoped roles.

#### Scenario: User with single career opens activity form
- GIVEN an authenticated user whose `user.careers` contains exactly one career
- WHEN `ActivityModal.tsx` renders the career dropdown
- THEN the dropdown MUST be pre-filled with that career and set to read-only/disabled state

#### Scenario: User with multiple careers opens activity form
- GIVEN an authenticated user whose `user.careers` contains more than one career
- WHEN `ActivityModal.tsx` renders the career dropdown
- THEN the dropdown MUST show only careers from `user.careers` and default to the first entry

#### Scenario: User with empty or missing careers
- GIVEN an authenticated user whose `user.careers` is empty or undefined
- WHEN `ActivityModal.tsx` renders the career dropdown
- THEN the dropdown MUST fall back to displaying the full career list without pre-selection

## MODIFIED Requirements

*(none)*

## REMOVED Requirements

*(none)*
