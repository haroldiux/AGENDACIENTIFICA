# Delta for UI

## MODIFIED Requirements
### Requirement: User Profile Contact Management
The `/perfil` page MUST present `full_name` as the sole editable identity field, display `email`, `role`, `careers`, `phone_number`, and `telegram_chat_id` as read-only information and badges with fallback text for unassigned fields, and provide a clear navigation CTA directing users to `/configuracion/notificaciones` for editing contact destinations.

#### Scenario: Profile page renders full_name as sole editable field with read-only metadata
- GIVEN an authenticated user navigating to `/perfil`
- WHEN the profile page loads
- THEN the system MUST render `full_name` inside an editable input field, and MUST display `email`, `role`, `careers`, `phone_number`, and `telegram_chat_id` as read-only UI components with fallback labels ("Sin carrera asignada", "No configurado") for unassigned values.

#### Scenario: Updating user full_name from profile form
- GIVEN an authenticated user modifying their `full_name` on `/perfil`
- WHEN the user submits the profile form
- THEN the system MUST issue a request to `api.users.updateMe` containing only `full_name` and display success feedback upon resolution.

#### Scenario: Navigating to destination settings for contact updates
- GIVEN an authenticated user on `/perfil`
- WHEN the user clicks the notification destination link or button
- THEN the system MUST navigate the user directly to `/configuracion/notificaciones`.

### Requirement: Telegram Setup Guide and Notification Preference Banner on Profile Page
The `/perfil` page MUST feature a step-by-step guidance card for Telegram onboarding directing users to `/configuracion/notificaciones` to manage their Telegram Chat ID without inline edit inputs, and MUST display a banner linking to notification settings.

#### Scenario: Telegram setup guide directs user to Notification Settings
- GIVEN an authenticated user viewing the Telegram onboarding section on `/perfil`
- WHEN the guide card is rendered
- THEN the system MUST display onboarding instructions that direct the user to `/configuracion/notificaciones` for Chat ID configuration without providing inline editing inputs on `/perfil`.

#### Scenario: User navigates to Notification Preference Center from profile banner
- GIVEN an authenticated user viewing the notification preference banner on `/perfil`
- WHEN the user clicks the Call-to-Action button
- THEN the system MUST navigate the user directly to `/configuracion/notificaciones`.
