# Notifications Specification Delta

## ADDED Requirements

### Requirement: User Notification Preference Data Model and Auto-Initialization
The system MUST maintain a 1-to-1 `UserNotificationPreference` record linked to each `User` containing channel activation states (Email, WhatsApp, Telegram), custom contact destinations, digest frequency, lookahead window days, and event toggles.
#### Scenario: Auto-initialization on first access
- GIVEN an authenticated user without an existing preference record
- WHEN the system queries notification preferences for the user
- THEN the system MUST auto-initialize and persist default preferences with Email enabled, 7-day lookahead, and weekly digest.
#### Scenario: Custom contact destination coalescing
- GIVEN a user with custom contact fields (`custom_email`, `custom_whatsapp`, or `custom_telegram_chat_id`) defined
- WHEN the notification worker or test endpoint resolves delivery targets
- THEN the system MUST prioritize custom contact fields over primary User profile attributes.

### Requirement: User Notification Preferences REST API
The system MUST expose REST endpoints `GET /api/v1/users/me/notification-preferences` and `PUT /api/v1/users/me/notification-preferences` to retrieve and update user notification settings.
#### Scenario: Fetching user notification preferences
- GIVEN an authenticated user
- WHEN submitting a `GET /api/v1/users/me/notification-preferences` request
- THEN the system MUST return HTTP 200 with the active user preference matrix.
#### Scenario: Updating user notification preferences
- GIVEN an authenticated user providing updated channel or lookahead values
- WHEN submitting a `PUT /api/v1/users/me/notification-preferences` request with valid payload
- THEN the system MUST save modifications to the database and return HTTP 200 with updated preferences.

### Requirement: Unified Multi-Channel Diagnostic Test Endpoint
The system MUST expose a REST endpoint `POST /api/v1/notifications/test-channel` allowing users to trigger immediate test notifications to Email, WhatsApp, or Telegram.
#### Scenario: Successful channel test message dispatch
- GIVEN an authenticated user requesting a test dispatch for an active channel
- WHEN submitting `POST /api/v1/notifications/test-channel` with channel parameter and target destination
- THEN the system MUST send a test message via specified provider and return HTTP 200 with success diagnostic response.
#### Scenario: Diagnostic endpoint handles client credential errors
- GIVEN unconfigured or invalid provider credentials for selected test channel
- WHEN submitting a test request to `POST /api/v1/notifications/test-channel`
- THEN the system MUST catch provider exception and return HTTP 400 with diagnostic failure message.

## MODIFIED Requirements

### Requirement: Preference-Aware Worker Dispatch
The system MUST evaluate user active channels, custom destinations, digest frequency, and lookahead window before dispatching scheduled notifications in `notification_worker.py`.
#### Scenario: Worker filters disabled channels
- GIVEN a user with Email enabled and WhatsApp/Telegram disabled in notification preferences
- WHEN the notification worker processes scheduled dispatches
- THEN the system MUST send notifications only via Email and ignore disabled channels.
#### Scenario: Worker respects user-configured lookahead window
- GIVEN a user with custom lookahead window set to 14 days
- WHEN the notification worker evaluates upcoming activities for the user
- THEN the system MUST query activities occurring within the next 14 days instead of defaulting globally.

## REMOVED Requirements
None.
