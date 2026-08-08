# UI Delta Specification

## MODIFIED Requirements

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
