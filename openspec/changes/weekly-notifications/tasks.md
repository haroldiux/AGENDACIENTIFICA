## Phase 1: Models & Database Migration
- [x] `backend/app/models/models.py`: Add `phone_number = Column(String, nullable=True)` to the `User` model.
- [x] `backend/alembic/versions/`: Run `alembic revision --autogenerate -m "add phone_number to user"` to generate the migration file for the `phone_number` addition to the `User` model, and apply it with `alembic upgrade head`.
- [x] `backend/app/schemas/schemas.py`: Add `phone_number: Optional[str] = None` to the `UserBase` schema.

## Phase 2: Configuration & Settings
- [x] `backend/app/core/config.py`: Add settings for `NOTIFICATION_DAYS_AHEAD` (default 7), `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_ID`, and `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`.

## Phase 3: Workers & Scheduling Logic
- [x] `backend/app/workers/notification_worker.py`: Create file and implement `dispatch_weekly_notifications` task to query activities within `NOTIFICATION_DAYS_AHEAD`, iterate over active users, send WhatsApp messages using `httpx`, and fallback to SMTP emails.
- [x] `backend/app/core/celery_app.py`: Import `notification_worker` and configure `beat_schedule` using `crontab(hour=20, minute=0, day_of_week="sun")`.

## Phase 4: Container Orchestration
- [x] `docker-compose.yml`: Add `celery-beat` service alongside `worker`, running the `celery -A app.core.celery_app.celery_app beat` command.
- [x] `docker-compose.prod.yml`: Add `celery-beat` service with production configurations and restart policies.
