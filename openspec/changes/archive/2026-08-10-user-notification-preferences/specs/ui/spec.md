# UI Specification Delta

## ADDED Requirements

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

## MODIFIED Requirements
None.

## REMOVED Requirements
None.
