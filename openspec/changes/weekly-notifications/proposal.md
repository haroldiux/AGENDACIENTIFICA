<Proposal: weekly-notifications>
## Intent
Implement a weekly scheduled notification system to alert users about upcoming academic and scientific activities, prioritizing WhatsApp delivery with Email as a fallback.

## Scope
### In Scope
- Setup of `celery-beat` for scheduling periodic tasks.
- Addition of a `phone_number` field to the `User` model.
- Integration of a WhatsApp API (e.g., Meta Graph API or Twilio) as the primary delivery channel.
- Fallback Email delivery integration via SMTP.
- Scheduled task running every Sunday at 20:00.
- Parameterized lookahead range (via `NOTIFICATION_DAYS_AHEAD` environment variable, defaulting to 7).

### Out of Scope
- Immediate migration or manual entry of existing users' phone numbers.
- In-app push notifications.
- Two-way messaging or chatbot features.

## Approach
Configure `celery-beat` to run alongside Celery workers, triggering a dispatch task every Sunday at 20:00. The worker will query the database for activities occurring within the next `NOTIFICATION_DAYS_AHEAD` (default 7). For each user associated with upcoming activities, the system will attempt to send a summarized message via WhatsApp. If the user lacks a phone number or WhatsApp delivery fails, it will fall back to Email. We will update the `User` schema to include a `phone_number` (string) field and add required environment variables for the WhatsApp provider.

## Affected Areas
| Area | Impact | Description |
|---|---|---|
| `docker-compose.yml` | Medium | Add `celery-beat` service to orchestration. |
| `backend/app/models/models.py` | Low | Add `phone_number` string field to `User` model. |
| `backend/app/core/celery_app.py` | Low | Configure celery beat schedule for Sunday 20:00. |
| `backend/app/workers/notification_worker.py` | High | New task for querying upcoming activities and dispatching messages. |
| `backend/app/core/config.py` | Low | Add `NOTIFICATION_DAYS_AHEAD` and API settings. |

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| API Rate Limits | Medium | Fan-out notification tasks (one sub-task per user) to avoid sending in a single blocking loop. |
| Timezone discrepancies | Low | Run cron in UTC and document the equivalent local dispatch time to ensure correct Sunday 20:00 execution. |

## Rollback Plan
- Remove the `celery-beat` service from docker configurations.
- Disable the periodic task schedule in `celery_app.py`.
- Revert schema if needed, though the `phone_number` column can safely remain unused.

## Dependencies
- WhatsApp API provider credentials (Meta or Twilio).
- SMTP credentials for fallback email.
- Alembic for database schema migration.

## Success Criteria
- [ ] `celery-beat` successfully triggers the task on Sundays at 20:00.
- [ ] Users with a configured `phone_number` receive WhatsApp notifications.
- [ ] Users without a phone number receive email notifications.
- [ ] The lookahead range uses the `NOTIFICATION_DAYS_AHEAD` environment variable.
- [ ] The `User` model successfully stores `phone_number`.
