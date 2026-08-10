# Tasks: Gmail SMTP Configuration & HTML Email Dispatch System

## Phase 1: Core Configuration & Pydantic Schemas
- [x] `backend/app/core/config.py`: Update `Settings` class to set default `SMTP_HOST="smtp.gmail.com"`, `SMTP_PORT=587`, and `SMTP_TLS=True`.
- [x] `backend/app/schemas/schemas.py`: Add `TestEmailRequest`, `TestEmailResponse`, `SendDigestRequest`, and `SendDigestResponse` Pydantic schemas.

## Phase 2: Jinja2 Email Templates & Service
- [x] `backend/app/templates/email_digest.html`: Create Jinja2 HTML email template for weekly activity digests styled with UNITEPC brand colors (`#6B3392`, `#009E96`).
- [x] `backend/app/templates/email_test.html`: Create Jinja2 HTML email template for diagnostic SMTP test emails with UNITEPC branding.
- [x] `backend/app/services/email_service.py`: Implement `EmailService` class to handle Jinja2 template loading, HTML rendering, and SMTP delivery via TLS (`smtp.gmail.com:587`).

## Phase 3: Worker Fallback & API Router Integration
- [x] `backend/app/workers/notification_worker.py`: Refactor notification worker tasks to use `EmailService` for HTML email delivery as fallback when WhatsApp delivery fails or user lacks a phone number.
- [x] `backend/app/api/v1/notifications.py`: Create notifications router with `POST /test-email` (SMTP diagnostic) and `POST /send-digest` (manual activity digest dispatch).
- [x] `backend/app/api/v1/api.py`: Register `notifications.py` router into API v1 router under `/notifications`.

## Phase 4: Automated Testing & Verification
- [x] `backend/tests/test_notifications.py`: Add unit and integration tests for Gmail SMTP settings defaults, HTML template rendering, `EmailService` mock transport, worker HTML fallback, and diagnostic REST endpoints.

