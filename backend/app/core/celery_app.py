from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "reports_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

from celery.schedules import crontab

# Register tasks defined in worker modules so Celery discovers them at startup.
from app.workers import reports_worker  # noqa: E402,F401
from app.workers import notification_worker  # noqa: E402,F401

celery_app.conf.beat_schedule = {
    "dispatch-weekly-notifications": {
        "task": "app.workers.notification_worker.dispatch_weekly_notifications",
        "schedule": crontab(hour=20, minute=0, day_of_week="sun"),
    }
}
