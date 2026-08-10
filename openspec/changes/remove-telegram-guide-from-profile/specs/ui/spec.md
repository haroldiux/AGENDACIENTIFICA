# Delta for UI

## MODIFIED Requirements

### Requirement: Telegram Setup Guide and Notification Preference Banner on Profile Page
The `/perfil` page MUST display a notification preference banner directing users to `/configuracion/notificaciones` for channel configuration and Telegram linking, and MUST NOT render a duplicate Telegram onboarding guide card or sidebar on `/perfil`.

#### Scenario: Profile page renders banner without Telegram guide card
- GIVEN an authenticated user navigating to `/perfil`
- WHEN the profile page loads
- THEN the system MUST render the notification preference banner and MUST NOT render the Telegram setup guide card or sidebar.

#### Scenario: User navigates to Notification Preference Center from profile banner
- GIVEN an authenticated user viewing the notification preference banner on `/perfil`
- WHEN the user clicks the Call-to-Action button
- THEN the system MUST navigate the user directly to `/configuracion/notificaciones`.

### Requirement: User Profile Contact Management
The `/perfil` page MUST wrap user profile information inside a centered container (`max-w-4xl mx-auto`), presenting `full_name` as the sole editable identity field, displaying `email`, `role`, `careers`, `phone_number`, and `telegram_chat_id` as read-only information badges, and providing a navigation CTA to `/configuracion/notificaciones`.

#### Scenario: Centered profile layout container rendering
- GIVEN an authenticated user on `/perfil`
- WHEN the profile page is rendered
- THEN the system MUST display the profile card and account detail badges within a single centered `max-w-4xl mx-auto` layout container.

#### Scenario: Updating full_name in centered layout
- GIVEN an authenticated user modifying their `full_name` on `/perfil`
- WHEN the user submits the profile form
- THEN the system MUST send a request to `api.users.updateMe` with `full_name` and display success notification feedback.
