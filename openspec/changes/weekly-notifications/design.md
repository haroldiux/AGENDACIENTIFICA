<Design: weekly-notifications>
## Technical Approach
We will introduce a periodic scheduling mechanism using `celery-beat` to dispatch weekly notifications about upcoming academic and scientific activities. Every Sunday at 20:00 (UTC), a Celery beat schedule will trigger a worker task. This task will query the database for activities scheduled within the configurable lookahead window (defaulting to 7 days). For all active users, the worker will send out summary messages through the primary delivery channel, WhatsApp, utilizing the Meta Graph API via the `httpx` library. If a user does not have a registered phone number or the WhatsApp delivery fails, the system will fall back to sending an email notification via SMTP. To accommodate the primary channel, the database schema and models will be updated to store an optional `phone_number` for users.

## Architecture Decisions

### Decision: Using `celery-beat` for Scheduling
**Choice**: We are incorporating `celery-beat` as a separate container/service within our docker-compose orchestration.
**Alternatives considered**: Cron jobs executing a script, native Python scheduling libraries (like `schedule`), or leveraging an external scheduler like EventBridge.
**Rationale**: We already use Celery for background workers (`reports_worker`). Extending this ecosystem with `celery-beat` is the most seamless and idiomatic approach to scheduling periodic tasks without introducing entirely new paradigms or relying on OS-level cron.

### Decision: Direct HTTP Calls for WhatsApp
**Choice**: Use `httpx` to make standard HTTP calls directly to the Meta Graph API.
**Alternatives considered**: Using a heavy SDK or third-party abstractions like Twilio.
**Rationale**: `httpx` is standard, lightweight, and supports both synchronous and asynchronous operations. Interacting directly with the Meta API allows for maximum control without adding heavy external dependencies, especially since we only need to dispatch outbound messages.

## Data Flow
1. **Trigger**: `celery-beat` container fires the `dispatch_weekly_notifications` task at Sunday 20:00 UTC.
2. **Query**: The Celery worker (`notification_worker.py`) calculates the date range using `datetime.now()` and `settings.NOTIFICATION_DAYS_AHEAD`, then queries the database for both `AcademicActivity` and `ScientificActivity` within this range.
3. **Dispatch**: The worker iterates over active users in the `users` table.
4. **Primary Delivery**: If a user has a `phone_number`, the worker uses `httpx` to POST a message payload to the Meta Graph API.
5. **Fallback Delivery**: If the user lacks a phone number, or the HTTP response from Meta is unsuccessful, the worker prepares and sends an email via SMTP.

## File Changes
| File | Action | Description |
|---|---|---|
| `docker-compose.yml` | Update | Add `celery-beat` service alongside `worker`, running the `celery -A app.core.celery_app.celery_app beat` command. |
| `docker-compose.prod.yml` | Update | Add `celery-beat` service with production configurations and restart policies. |
| `backend/app/models/models.py` | Update | Add `phone_number = Column(String, nullable=True)` to the `User` model. |
| `backend/app/schemas/schemas.py` | Update | Add `phone_number: Optional[str] = None` to `UserBase` schema. |
| `backend/app/core/config.py` | Update | Add settings for `NOTIFICATION_DAYS_AHEAD` (default 7), `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_ID`, and SMTP credentials. |
| `backend/app/core/celery_app.py` | Update | Import `notification_worker` and configure `beat_schedule` using `crontab(hour=20, minute=0, day_of_week="sun")`. |
| `backend/app/workers/notification_worker.py` | Create | Implements the scheduled task logic, `httpx` client calls, and database querying. |

## Interfaces / Contracts
- **WhatsApp Payload**: A standard JSON body sent to Meta Graph API `/{PHONE_ID}/messages` containing the user's `phone_number` and the summarized message text.
- **Environment Variables**:
  - `NOTIFICATION_DAYS_AHEAD` (int, default: 7)
  - `WHATSAPP_API_TOKEN` (string)
  - `WHATSAPP_PHONE_ID` (string)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`

## Testing Strategy
| Layer | What to Test | Approach |
|---|---|---|
| Unit | Fallback Logic | Mock `httpx.post` to simulate a WhatsApp API failure and assert that the email sending utility is invoked. |
| Unit | Lookahead Querying | Insert dummy activities inside and outside the `NOTIFICATION_DAYS_AHEAD` window and assert only the correct activities are retrieved by the worker function. |
| Integration | Celery Beat | Verify that the `beat_schedule` dictionary in `celery_app.py` correctly maps to the task and uses the expected crontab parameters. |

## Migration / Rollout
1. Add new environment variables to the deployment environment `.env` files.
2. Run an Alembic autogenerate migration: `alembic revision --autogenerate -m "add phone_number to user"` to add the `phone_number` column.
3. Deploy the updated backend code, run migrations (`alembic upgrade head`).
4. Restart the stack using `docker-compose up -d --build` to launch the new `celery-beat` container.

## Open Questions
- Is there a specific templating required for the WhatsApp messages, or is standard text sufficient?
- Do users belong to specific careers that should filter the activities they are notified about, or do all users receive alerts for all activities? (Assuming all activities or career-filtered depending on the existing relations).
</Design: weekly-notifications>
