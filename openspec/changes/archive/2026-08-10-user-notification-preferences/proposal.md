# Proposal: User Notification Preferences Matrix

## Intent
Enable users of Agenda Científica UNITEPC to configure granular notification preferences across Email, WhatsApp, and Telegram channels, set digest frequencies, lookahead windows, and custom contact destinations.

## Scope
### In Scope
- Database schema migration for 1-to-1 `UserNotificationPreference` entity linked to `User`.
- FastAPI REST endpoints (`GET`, `PUT` `/api/v1/users/me/notification-preferences` and `POST /api/v1/notifications/test-channel`).
- Refactoring `notification_worker.py` to evaluate user preference matrix and custom destinations before dispatching.
- Next.js Notification Preference Center UI (`/configuracion/notificaciones`) with channel matrix, event switches, frequency/lookahead options, custom contact inputs, test buttons, and Sidebar navigation link.

### Out of Scope
- Direct push notifications (WebPush/FCM).
- In-app live notification feed modifications.

## Approach
Implement a dedicated 1-to-1 `UserNotificationPreference` model auto-initialized on first fetch with defaults (Email active, 7-day lookahead, weekly digest). Update background worker to filter recipients by preference settings and coalesced contact destinations (`custom_* or user.*`). Build responsive Next.js configuration UI with full channel test capabilities.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| Data Model & Migration | High | New `UserNotificationPreference` entity and Alembic migration. |
| Backend API | Medium | Preference CRUD routes and unified `/test-channel` endpoint. |
| Worker Service | High | Worker preference evaluation, channel filtering, coalesced contacts. |
| Frontend UI & Nav | Medium | New `/configuracion/notificaciones` page and Sidebar navigation. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Missing preference records for existing users | Low | Worker fallbacks and GET auto-initialization. |
| Contact override confusion | Medium | Contact coalescing logic and clear UI tooltips. |
| Unconfigured channel credentials in dev/staging | Low | Graceful API error handling on test triggers. |

## Rollback Plan
Revert frontend route and API endpoints, rollback Alembic migration (`alembic downgrade -1`), and restore background worker code.

## Dependencies
- FastAPI & SQLAlchemy DB session.
- SMTP, Twilio/WhatsApp API, Telegram Bot Token credentials.
- Next.js layout & Sidebar components.

## Success Criteria
- [ ] Users can query and save notification preferences via API and UI matrix.
- [ ] Worker dispatches notifications according to enabled channels and frequency settings.
- [ ] Test channel triggers send test messages across active channels without errors.
