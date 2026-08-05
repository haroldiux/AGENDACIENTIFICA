## Exploration: Weekly Notification Reminders
### Current State
1. **Async Infrastructure**: There is a Celery worker running in `docker-compose.yml` (`worker` service) for processing async tasks. However, there is no `celery-beat` scheduler configured to dispatch periodic tasks.
2. **Messaging Integrations**: There are currently no email libraries (like `fastapi-mail`) or WhatsApp APIs (Twilio, Meta Graph API) specified in `pyproject.toml`. The `User` model currently holds an `email` field but lacks a phone number field for WhatsApp.
3. **Domain Models**: Activities (`AcademicActivity` and `ScientificActivity`) are tied to `Career`s. Users are also linked to `Career`s via the `user_career_association` table.

### Affected Areas
- `docker-compose.yml` and `docker-compose.prod.yml` — Needs a `celery-beat` service to trigger periodic tasks.
- `backend/pyproject.toml` — Needs dependencies for email (`fastapi-mail` or standard `smtplib`) and optionally WhatsApp (e.g., `twilio` or `httpx` for Meta API).
- `backend/app/core/celery_app.py` — Needs configuration for celery beat schedule.
- `backend/app/models/models.py` — The `User` model will need a `phone_number` field if WhatsApp notifications are implemented.
- `backend/app/workers/` — Needs a new worker module (e.g., `notification_worker.py`) for querying the DB and dispatching notifications.

### Approaches
1. **Native SMTP Email with Celery Beat** — Add a `celery-beat` service to trigger a weekly task. The task queries the DB for upcoming activities grouped by user, and sends emails via `fastapi-mail` or standard `smtplib`.
   - Pros: Minimal external dependencies, free (with internal SMTP or basic email provider).
   - Cons: Only supports email, no WhatsApp.
   - Effort: Low

2. **Omnichannel via Twilio (Email + WhatsApp)** — Add `celery-beat`. Add a phone number to the `User` model. Integrate Twilio SDK to dispatch both WhatsApp messages and emails (SendGrid).
   - Pros: Reaches users on preferred channels (WhatsApp is highly effective for corporate reminders). Unified API.
   - Cons: Requires Twilio/SendGrid subscription. Requires updating user profiles with phone numbers.
   - Effort: Medium

3. **Meta Graph API (WhatsApp) + SMTP (Email)** — Add `celery-beat`. Use standard Python `httpx` to send WhatsApp messages through the official Meta Graph API, and use `smtplib`/`fastapi-mail` for emails.
   - Pros: Cost-effective for WhatsApp (first 1,000 conversations free per month on Meta).
   - Cons: More complex integration as we have to manage two different providers and Meta's API template requirements.
   - Effort: High

### Recommendation
**Native SMTP Email with Celery Beat** (Approach 1) as a first step to establish the celery-beat infrastructure and email notifications, which requires zero external paid services immediately. We can incrementally add the phone number to the User model and integrate Meta Graph API (Approach 3) or Twilio for WhatsApp once the email baseline works.

### Risks
- Users without associated careers might not receive any notifications or might receive empty emails.
- Timezone issues if the server's time differs from the users' local time for "upcoming week".
- SMTP rate limits if sending out mass emails simultaneously; the Celery task might need to fan-out (one task per user email) rather than sending all in one loop.

### Ready for Proposal
Yes. The orchestrator should tell the user that we are missing `celery-beat` and messaging libraries, and propose starting with Email via Celery Beat, or ask if they have a preferred WhatsApp provider (Twilio vs Meta).
