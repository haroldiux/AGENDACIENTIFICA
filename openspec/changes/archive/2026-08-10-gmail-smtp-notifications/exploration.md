# Exploration: Gmail SMTP Configuration & HTML Email Dispatch System

## Current State
- The notification system (`backend/app/workers/notification_worker.py`) currently handles automated alerts and weekly summaries via Telegram, WhatsApp, and basic plain-text emails.
- SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`) exist in `backend/app/core/config.py` as optional `None` values without intelligent defaults for Gmail.
- `send_email_message` in `notification_worker.py` sends plain text messages only (`EmailMessage().set_content(...)`), lacking HTML formatting, institutional branding, activity tables, or action buttons.
- No dedicated REST API endpoints exist under `/api/v1/notifications/` to trigger manual email digests or test SMTP configuration directly.

## Affected Areas
- `backend/app/core/config.py` — Add default values (`smtp.gmail.com`, 587) and fallback env var configuration for Gmail SMTP (`EMAILS_FROM_NAME`, `EMAILS_FROM_EMAIL`, TLS defaults).
- `backend/app/services/email_service.py` — Create new email dispatch engine with Jinja2 HTML rendering, MIME multipart support, UNITEPC branding (`#6B3392`, `#009E96`), and single/batch digest builders.
- `backend/app/templates/email_digest.html` & `backend/app/templates/email_test.html` — Create Jinja2 HTML email templates styled with UNITEPC branding, structured activity tables, and call-to-action buttons.
- `backend/app/workers/notification_worker.py` — Refactor to use `email_service.py` for rich HTML email delivery, and expose standalone Celery tasks for on-demand dispatch.
- `backend/app/api/v1/notifications.py` — Create new API router with `POST /api/v1/notifications/test-email` and `POST /api/v1/notifications/send-digest`.
- `backend/app/api/v1/api.py` — Mount the new `notifications` router.
- `backend/tests/test_notifications.py` — Add and update unit tests for HTML email dispatch, SMTP test endpoint, and digest triggers.

## Approaches

1. **Integrated `email_service.py` + Dedicated Templates + FastAPI Router (Recommended)**
   - Create `backend/app/services/email_service.py` encapsulating SMTP connections (`smtp.gmail.com`, 587 TLS), template loading, and HTML email assembly.
   - Use Jinja2 templates in `backend/app/templates/` (`email_digest.html` & `email_test.html`) with inline CSS using UNITEPC brand palette (`#6B3392`, `#009E96`), styled tables, and responsive email design.
   - Create `backend/app/api/v1/notifications.py` exposing `POST /api/v1/notifications/test-email` and `POST /api/v1/notifications/send-digest` endpoints.
   - Update `notification_worker.py` to leverage `email_service` for sending HTML digests.
   - **Pros**: Clean separation of concerns, reusable email engine, rich HTML notifications, easily testable with mock SMTP.
   - **Cons**: Requires creating new templates and service module.
   - **Effort**: Low-Medium

2. **Inline HTML in `notification_worker.py` without separate service**
   - Hardcode HTML string formatting directly inside `notification_worker.py` and add endpoints directly inside `users.py` or `actividades.py`.
   - **Pros**: Quick to implement.
   - **Cons**: High code duplication, hard to maintain/test HTML strings, breaks Hexagonal/Clean architecture.
   - **Effort**: Low

## Recommendation
Adopt **Approach 1**: Create `email_service.py` alongside Jinja2 templates (`email_digest.html`, `email_test.html`) and mount a new `/api/v1/notifications` router. This maintains clean architecture, aligns with existing `reports_worker.py` template rendering patterns, and provides institutional-grade UNITEPC branding.

## Risks
- **Gmail Rate Limits / App Password Authentication**: Gmail limits SMTP dispatches (e.g. 500 emails/day for free accounts). For large user volumes, async batching via Celery tasks is necessary.
- **Email Client HTML Compatibility**: Inline CSS must be used in templates to ensure consistent rendering across Outlook, Gmail, and mobile clients.

## Ready for Proposal
Yes — ready to move to `sdd-propose` for `gmail-smtp-notifications`.
