# Exploration: User-configurable Notification Preferences Matrix for Email, WhatsApp, and Telegram

## Current State

Currently, the notification subsystem in Agenda Científica UNITEPC has the following state:

- **Data Models (`backend/app/models/models.py`)**:
  - The `User` table stores basic communication parameters: `email`, `phone_number`, and `telegram_chat_id`.
  - There is no dedicated preference entity for users to customize notification channels, frequency, lookahead days, or specific event triggers.

- **API Endpoints (`backend/app/api/v1/`)**:
  - `notifications.py` provides `/api/v1/notifications/test-email` (SMTP testing) and `/api/v1/notifications/send-digest` (triggering digest emails).
  - `users.py` provides `/api/v1/users/me/test-telegram` for testing Telegram messages.
  - There are no endpoints for querying or updating granular notification preferences, nor a unified multi-channel testing endpoint.

- **Worker & Services (`backend/app/workers/notification_worker.py`, `backend/app/services/email_service.py`)**:
  - `notification_worker.py` runs a hardcoded weekly dispatch task (`dispatch_weekly_notifications`) using a fixed priority chain (Telegram -> WhatsApp -> Email) and a single global lookahead window (`NOTIFICATION_DAYS_AHEAD`).
  - It does not check if the user has opted out of specific channels, changed their digest frequency, or disabled event notifications.

- **Frontend Navigation & UI (`frontend/`)**:
  - `frontend/app/perfil/page.tsx` allows users to edit their `phone_number` and `telegram_chat_id`, with basic buttons to test Telegram and generate a WhatsApp summary link.
  - There is no dedicated Notification Preference Center page (`frontend/app/configuracion/notificaciones/page.tsx`), and the sidebar menu does not include a notification settings link.

---

## Affected Areas

- `backend/app/models/models.py` — Define `UserNotificationPreference` model (1:1 with `User`) with channel toggles, custom contact destinations, event toggles, frequency, and lookahead days.
- `backend/alembic/versions/` — New migration script to create `user_notification_preferences` table.
- `backend/app/schemas/schemas.py` — Add Pydantic schemas for `UserNotificationPreferenceResponse`, `UserNotificationPreferenceUpdate`, `TestChannelRequest`, and `TestChannelResponse`.
- `backend/app/api/v1/user_preferences.py` — Create new API router with `GET /api/v1/users/me/notification-preferences` and `PUT /api/v1/users/me/notification-preferences`.
- `backend/app/api/v1/notifications.py` — Add unified `POST /api/v1/notifications/test-channel` endpoint for dynamic testing across Email, WhatsApp, and Telegram.
- `backend/app/api/v1/api.py` — Include `user_preferences` router into main `api_router`.
- `backend/app/workers/notification_worker.py` — Refactor weekly notification worker to query `UserNotificationPreference`, respect active channels, filter events, and process custom contact destinations.
- `backend/app/services/email_service.py` — Update email rendering and recipient targeting to support preference custom email overrides.
- `frontend/lib/api.ts` — Add TypeScript types and API client functions for fetching/updating notification preferences and testing channels.
- `frontend/app/configuracion/notificaciones/page.tsx` — Build Preference Center page with channel matrix, event switches, frequency selectors, custom inputs, and interactive test buttons.
- `frontend/components/layout/Sidebar.tsx` — Add navigation entry for Notification Settings (`/configuracion/notificaciones`).

---

## Approaches

1. **1-to-1 `UserNotificationPreference` Entity with Default Auto-Initialization (Recommended)**
   - Create a separate model `UserNotificationPreference` linked via `user_id` (foreign key with `unique=True`). On `GET /api/v1/users/me/notification-preferences`, if no preference record exists, auto-initialize default settings (Email enabled, WhatsApp/Telegram disabled, 7 days ahead notice, weekly digest).
   - Pros: Clean separation of concerns; avoids bloating the core `User` model; highly extensible for future channels or event types; easy fallback to primary `User` contact fields when `custom_*` fields are null.
   - Cons: Requires one extra table and join query (optimized via SQLAlchemy `joinedload`).
   - Effort: Medium

2. **Direct Flattened Columns in `users` Table**
   - Add 10+ columns directly into the `users` table (`email_enabled`, `whatsapp_enabled`, `telegram_enabled`, `custom_email`, `whatsapp_number`, `digest_frequency`, etc.).
   - Pros: Eliminates foreign key join.
   - Cons: Clutters core auth/user model; makes schema updates more disruptive.
   - Effort: Low to Medium

---

## Recommendation

**Approach 1 (1-to-1 Entity)** is recommended. It maintains clean domain separation, prevents schema pollution in the core user entity, and integrates smoothly into the FastAPI + SQLAlchemy + Next.js architecture.

---

## Risks

- **Existing Users Without Preference Records**: Worker or API might fail when reading preferences for existing users who do not have a `user_notification_preferences` row. *Mitigation*: Implement safe fallbacks in worker and auto-creation logic in API.
- **Channel Destination Overrides vs Primary Profile Data**: Potential confusion between user profile phone/email and notification custom overrides. *Mitigation*: Use coalesce logic (`pref.custom_email or user.email`) in backend and clear tooltips in UI.
- **WhatsApp / Telegram API Configuration Availability**: Third-party credentials might not be configured in local/staging environments. *Mitigation*: Test endpoint `POST /api/v1/notifications/test-channel` catches client configuration errors gracefully.

---

## Ready for Proposal
Yes — The requirements, architecture, schemas, and UI layout are fully analyzed and ready for formal proposal generation.
