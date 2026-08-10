# UI Specification

## Purpose
To establish a modern, minimal, premium UI/UX aesthetic for the AGENDA CIENTIFICA system using `shadcn/ui`, `geist` fonts, and `next-themes`, while retaining the UNITEPC brand colors (Purple and Cyan).

## ADDED Requirements
### Requirement: Typography and Theming
The system MUST use `geist` fonts for typography and support toggling between Light and Dark modes seamlessly via `next-themes`.
#### Scenario: Toggling application theme
- GIVEN the application is in Light mode
- WHEN the user clicks the theme toggle button
- THEN the application MUST switch to Dark mode and persist this preference

### Requirement: Brand Identity Integration
The system MUST incorporate UNITEPC Purple and Cyan as primary and accent theme tokens within `shadcn/ui` CSS variables.
#### Scenario: Rendering primary components
- GIVEN a `shadcn/ui` Button component with a primary variant
- WHEN the component is rendered on the screen
- THEN the background MUST display the UNITEPC Purple color

### Requirement: Component Architecture
The system MUST utilize `shadcn/ui` components to replace raw HTML elements and custom CSS classes (e.g., `glass-panel`).
#### Scenario: Displaying data views
- GIVEN the user navigates to the Activities view (`/actividades`)
- WHEN the view renders the content
- THEN the items MUST be wrapped in `shadcn/ui` Card components instead of raw HTML

### Requirement: Premium Layout Design
The system MUST implement a sleek, minimal, and collapsible Sidebar matching a premium aesthetic.
#### Scenario: Interacting with the Sidebar
- GIVEN the user is on the main application layout
- WHEN the user toggles the Sidebar
- THEN the Sidebar MUST collapse smoothly using `framer-motion`, maximizing main content space

### Requirement: Calendar Theming Overhaul
The `react-big-calendar` component MUST be heavily restyled with targeted CSS overrides to integrate with the minimal aesthetic.
#### Scenario: Viewing the calendar in Dark mode
- GIVEN the user navigates to the Calendar view in Dark mode
- WHEN the `react-big-calendar` renders
- THEN the structural borders and events MUST display appropriate Dark mode colors and UNITEPC accents

### Requirement: Dedicated Dark-Themed Login View
The system MUST provide a responsive login page at `/login` featuring a UNITEPC brand banner with purple-to-cyan gradient (`#6B3392` to `#009E96`), SVG wave graphic, UNITEPC logo, tagline, and pill-shaped form controls without rendering the application sidebar.

#### Scenario: Desktop split-screen layout rendering
- GIVEN an unauthenticated user on a desktop screen accessing `/login`
- WHEN the login page loads
- THEN the system MUST render a two-column split layout with the UNITEPC brand banner on the left and the pill-styled login form on the right without the `Sidebar`

#### Scenario: Mobile viewport header rendering
- GIVEN an unauthenticated user on a mobile viewport accessing `/login`
- WHEN the login page loads
- THEN the system MUST render the brand banner at the top scaled so the form card remains immediately visible without vertical clipping

#### Scenario: Pill input field interaction and focus
- GIVEN an unauthenticated user on `/login`
- WHEN entering data into credential input fields
- THEN the fields MUST render rounded pill containers (`rounded-full`) with embedded left icons (`Mail`, `Lock`) and focus ring highlights (`focus:ring-[#009E96]`)

#### Scenario: Authentication submission and navigation
- GIVEN an unauthenticated user on `/login`
- WHEN submitting valid credentials
- THEN the system MUST show a loading spinner, invoke `api.auth.login()`, update `AuthContext`, and navigate to `/` upon success

#### Scenario: Authentication error presentation
- GIVEN an unauthenticated user on `/login`
- WHEN submitting invalid credentials
- THEN the system MUST display an inline error banner explaining the failure without clearing valid input fields

### Requirement: Sidebar User Session Footer
The system MUST enhance the `Sidebar` footer to display the active user's details and a functional "Cerrar Sesión" button.

#### Scenario: Displaying active user info in sidebar
- GIVEN an authenticated user viewing the main application layout
- WHEN the `Sidebar` renders
- THEN the sidebar footer MUST display the user's name or email and role alongside a logout trigger button

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

### Requirement: Notification Preference Center UI
The system MUST render a dedicated Notification Preference Center page at `/configuracion/notificaciones` allowing users to configure channel matrices (Email, WhatsApp, Telegram), event switches, frequency/lookahead options, custom destinations, and test buttons.
#### Scenario: Preference Center initial load
- GIVEN an authenticated user navigating to `/configuracion/notificaciones`
- WHEN the page loads
- THEN the system MUST fetch current user preferences via API and populate matrix toggles, inputs, and selectors.
#### Scenario: Interactive channel testing from UI
- GIVEN a user on `/configuracion/notificaciones` with active contact details
- WHEN the user clicks "Probar Canal" for Email, WhatsApp, or Telegram
- THEN the system MUST invoke `POST /api/v1/notifications/test-channel` and display interactive feedback notification.

### Requirement: Sidebar Notification Settings Link
The system MUST include a navigation item "Notificaciones" within the `Sidebar` layout component linking to `/configuracion/notificaciones`.
#### Scenario: Navigating to Notification Settings from Sidebar
- GIVEN an authenticated user viewing the main application sidebar
- WHEN the user clicks the "Notificaciones" sidebar link
- THEN the system MUST navigate to `/configuracion/notificaciones`.

## REMOVED Requirements


### Requirement: Custom CSS Utility Classes
(Reason: The system is deprecating raw CSS classes like `glass-panel` in favor of standard `shadcn/ui` semantic variables and components.)

