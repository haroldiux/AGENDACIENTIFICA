# Proposal: Gmail SMTP Configuration & HTML Email Dispatch System

## Intent
Enable Gmail SMTP integration with smart defaults and HTML email dispatch for institutional digests and SMTP diagnostics in AGENDA CIENTIFICA.

## Scope
### In Scope
- Add Gmail SMTP default settings in `backend/app/core/config.py`.
- Implement `backend/app/services/email_service.py` with Jinja2 HTML rendering and UNITEPC branding.
- Create email templates `email_digest.html` and `email_test.html`.
- Refactor `backend/app/workers/notification_worker.py` to use `email_service.py`.
- Create `/api/v1/notifications/` router with test email and digest endpoints.
- Add unit tests in `backend/tests/test_notifications.py`.

### Out of Scope
- OAuth2 Google Authentication for SMTP (using Gmail App Passwords / TLS instead).
- Frontend UI components for notification management (handled separately).

## Approach
Implement a dedicated `email_service.py` encapsulating SMTP connections (`smtp.gmail.com:587` with TLS) and Jinja2 HTML email assembly using UNITEPC branding (`#6B3392`, `#009E96`). Mount endpoints `POST /api/v1/notifications/test-email` and `POST /api/v1/notifications/send-digest` in FastAPI, and update `notification_worker.py` to delegate email rendering to `email_service.py`.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `backend/app/core/config.py` | Low | Adds Gmail SMTP defaults (`smtp.gmail.com`, 587, TLS). |
| `backend/app/services/email_service.py` | High | New email dispatch service with Jinja2 rendering. |
| `backend/app/templates/` | Medium | New Jinja2 email templates (`email_digest.html`, `email_test.html`). |
| `backend/app/workers/notification_worker.py` | Medium | Refactors email notification tasks to use `email_service.py`. |
| `backend/app/api/v1/notifications.py` | Medium | New REST endpoints for testing SMTP and triggering digests. |
| `backend/app/api/v1/api.py` | Low | Mounts notifications router into API v1. |
| `backend/tests/test_notifications.py` | Low | Adds test coverage for email service and endpoints. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Gmail SMTP rate limits / auth blocks | Medium | Support App Passwords, TLS config, and async batching via Celery tasks. |
| Inconsistent rendering in email clients | Low | Use inline CSS and standard responsive HTML structures in Jinja2 templates. |

## Rollback Plan
Revert changes in `config.py`, remove `email_service.py` and new templates, unmount `/api/v1/notifications` from `api.py`, and restore plain-text email handling in `notification_worker.py`.

## Dependencies
- Python `jinja2` rendering package.
- Valid Gmail SMTP credentials (`SMTP_USER`, `SMTP_PASSWORD`) for live email delivery.

## Success Criteria
- [ ] SMTP settings in `config.py` default to Gmail SMTP parameters (`smtp.gmail.com:587`).
- [ ] `email_service.py` successfully renders Jinja2 HTML email templates with UNITEPC branding.
- [ ] `POST /api/v1/notifications/test-email` sends test email and returns diagnostic status.
- [ ] `POST /api/v1/notifications/send-digest` triggers activity digest generation and dispatch.
- [ ] All notification unit tests pass cleanly.
