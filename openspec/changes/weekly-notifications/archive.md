<Archive: weekly-notifications>
## Final Status
Completed successfully.

## Summary of Changes
- **Database & Models**: Added `phone_number` field to the `User` model (`backend/app/models/models.py`) and schema (`backend/app/schemas/schemas.py`). Created and applied Alembic migration.
- **Configuration**: Added environment variables `NOTIFICATION_DAYS_AHEAD`, `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_ID`, and SMTP settings to `backend/app/core/config.py`.
- **Workers & Logic**: Implemented `notification_worker.py` to dispatch weekly notifications on Sunday at 20:00 using `celery-beat`.
- **Delivery Channels**: Added integration with Meta Graph API via `httpx` for primary WhatsApp notifications, and fallback SMTP email dispatch for missing phone numbers or WhatsApp failures.
- **Orchestration**: Updated `docker-compose.yml` and `docker-compose.prod.yml` to include the new `celery-beat` service.
- **Specs**: Synced notification specification to `openspec/specs/notifications/spec.md`.

</Archive: weekly-notifications>
