# UI Specification Delta

## ADDED Requirements

### Requirement: Dedicated Dark-Themed Login View
The system MUST provide a client-side `/login` page matching the dark Vercel/UNITEPC design system, without rendering the application sidebar.

#### Scenario: Rendering the login page
- GIVEN an unauthenticated user on `/login`
- WHEN the login page loads
- THEN the system MUST render the login form and branding header without displaying the main `Sidebar`

#### Scenario: Authentication error presentation
- GIVEN an unauthenticated user on `/login`
- WHEN they submit invalid credentials
- THEN the system MUST display an inline error message explaining the failure without clearing valid input fields

### Requirement: Sidebar User Session Footer
The system MUST enhance the `Sidebar` footer to display the active user's details and a functional "Cerrar Sesión" button.

#### Scenario: Displaying active user info in sidebar
- GIVEN an authenticated user viewing the main application layout
- WHEN the `Sidebar` renders
- THEN the sidebar footer MUST display the user's name or email and role alongside a logout trigger button
