# Tasks: User Notification Preferences

## Phase 1: Database & Models
- [x] `backend/app/models/models.py`: Define `UserNotificationPreference` model with 1-to-1 relationship to `User`, foreign key `user_id`, channel toggles (`email_enabled`, `whatsapp_enabled`, `telegram_enabled`), custom contact destinations (`custom_email`, `custom_whatsapp`, `custom_telegram_chat_id`), event category flags (`notify_academic`, `notify_scientific`), `digest_frequency`, and `lookahead_days`.
- [x] `backend/alembic/versions/create_user_notification_preferences_table.py`: Create Alembic migration script for `user_notification_preferences` table with unique constraint on `user_id`.

## Phase 2: Schemas & REST API Endpoints
- [x] `backend/app/schemas/schemas.py`: Add Pydantic schemas for `UserNotificationPreferenceBase`, `UserNotificationPreferenceCreate`, `UserNotificationPreferenceUpdate`, `UserNotificationPreferenceResponse`, and `TestChannelRequest`.
- [x] `backend/app/api/v1/user_preferences.py`: Create endpoints `GET /api/v1/users/me/notification-preferences` (with auto-initialization for missing records) and `PUT /api/v1/users/me/notification-preferences` to save preference matrix updates.
- [x] `backend/app/api/v1/notifications.py`: Add `POST /api/v1/notifications/test-channel` endpoint supporting single-channel diagnostic test dispatches with coalesced contact target resolution (`custom_* or user.*`) and provider error handling.
- [x] `backend/app/api/v1/api.py`: Register `user_preferences` router into the v1 API router.

## Phase 3: Background Worker Integration
- [x] `backend/app/workers/notification_worker.py`: Refactor scheduled dispatch logic to fetch user preference matrix, respect user-specific lookahead days, filter academic and scientific event types, check enabled channel flags, and route messages to coalesced contact destinations.

## Phase 4: Frontend Client & Navigation UI
- [x] `frontend/lib/api.ts`: Add `UserNotificationPreference` interface definitions and API methods (`getNotificationPreferences`, `updateNotificationPreferences`, `testNotificationChannel`).
- [x] `frontend/app/configuracion/notificaciones/page.tsx`: Implement Notification Preference Center UI with matrix toggles for Email/WhatsApp/Telegram, custom contact inputs, frequency/lookahead options, event category switches, and channel test action buttons.
- [x] `frontend/components/layout/Sidebar.tsx`: Add "Notificaciones" link to sidebar navigation menu pointing to `/configuracion/notificaciones`.

## Phase 5: Verification & Integration Testing
- [x] `backend/tests/test_user_preferences.py`: Implement tests covering GET auto-initialization, preference payload validation, and PUT update operations.
- [x] `backend/tests/test_notifications.py`: Add test cases for `/api/v1/notifications/test-channel` endpoint and worker dispatch logic with preference matrix, custom destinations, and lookahead filtering.
