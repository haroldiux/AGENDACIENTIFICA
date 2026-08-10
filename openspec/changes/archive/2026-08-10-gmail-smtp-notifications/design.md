# Technical Design: Gmail SMTP Configuration & HTML Email Dispatch System

## Technical Approach
We introduce a centralized `EmailService` module in `backend/app/services/email_service.py` to handle Jinja2 HTML email template rendering and SMTP transmission via `smtplib` with TLS. SMTP defaults in `backend/app/core/config.py` are updated to target Gmail SMTP (`smtp.gmail.com:587`). We add Jinja2 templates styled with UNITEPC branding (`#6B3392` primary, `#009E96` secondary), expose notification management endpoints under `/api/v1/notifications/`, refactor `notification_worker.py` to dispatch HTML emails as fallback, and add test coverage.

## Architecture Decisions

### Decision: Default Gmail SMTP Configuration in Settings
**Choice**: Set `SMTP_HOST = "smtp.gmail.com"`, `SMTP_PORT = 587`, and `SMTP_TLS = True` as default settings in `Settings` when environment variables are omitted.
**Alternatives considered**: Requiring explicit env vars without defaults, or using third-party SDKs (SendGrid/Mailgun).
**Rationale**: Gmail SMTP with App Passwords is standard for the institution. Providing smart defaults reduces configuration overhead while remaining fully customizable via environment variables.

### Decision: Service-Oriented Email Dispatch with Jinja2 Templating
**Choice**: Encapsulate HTML template rendering (loading from `backend/app/templates/`) and SMTP transmission inside a dedicated `EmailService`.
**Alternatives considered**: Constructing plain-text or HTML strings directly inside workers or API endpoint functions.
**Rationale**: Separates email design/markup from task orchestration and REST controllers, enabling clean reuse across background jobs, webhooks, and diagnostic endpoints.

### Decision: FastAPI Notification Router with Diagnostics
**Choice**: Create `/api/v1/notifications/` with `POST /test-email` and `POST /send-digest`.
**Alternatives considered**: Restricting email dispatch to background Celery tasks without direct API triggers.
**Rationale**: System administrators need immediate feedback when testing SMTP credentials and the ability to trigger manual digest notifications on demand.

## Data Flow
1. **API / Worker Trigger**: Admin calls `POST /api/v1/notifications/test-email` or `POST /api/v1/notifications/send-digest`, or Celery scheduled job runs `dispatch_weekly_notifications`.
2. **Context Assembly**: Activity data for the week is queried and partitioned by user careers.
3. **Template Rendering**: `EmailService` loads the Jinja2 HTML template (`email_digest.html` or `email_test.html`) and injects activity data styled with institutional colors (`#6B3392`, `#009E96`).
4. **SMTP Delivery**: `EmailService` connects to `smtp.gmail.com:587`, executes STARTTLS, logs in using `SMTP_USER`/`SMTP_PASSWORD`, and transmits the HTML email.

## File Changes
| File | Action | Description |
| --- | --- | --- |
| `backend/app/core/config.py` | Modify | Set default SMTP host to `smtp.gmail.com` and port to `587`. |
| `backend/app/services/email_service.py` | Create | Email dispatch service encapsulating Jinja2 rendering and SMTP TLS transport. |
| `backend/app/templates/email_digest.html` | Create | Jinja2 HTML email template for weekly digests with UNITEPC branding. |
| `backend/app/templates/email_test.html` | Create | Jinja2 HTML email template for diagnostic SMTP test emails. |
| `backend/app/schemas/schemas.py` | Modify | Add `TestEmailRequest`, `TestEmailResponse`, `SendDigestRequest`, `SendDigestResponse`. |
| `backend/app/workers/notification_worker.py` | Modify | Refactor worker to use `EmailService` HTML emails as delivery fallback. |
| `backend/app/api/v1/notifications.py` | Create | API endpoints for SMTP testing (`/test-email`) and digest dispatch (`/send-digest`). |
| `backend/app/api/v1/api.py` | Modify | Register notifications router in API v1 router. |
| `backend/tests/test_notifications.py` | Create | Unit/integration tests for SMTP config defaults, HTML rendering, service, worker fallback, and endpoints. |

## Interfaces / Contracts

### Pydantic Schemas (`backend/app/schemas/schemas.py`)
- `TestEmailRequest`: `recipient_email: str`
- `TestEmailResponse`: `success: bool`, `message: str`, `smtp_host: str`, `smtp_port: int`, `timestamp: datetime`
- `SendDigestRequest`: `recipient_email: Optional[str] = None`, `user_id: Optional[int] = None`
- `SendDigestResponse`: `success: bool`, `message: str`, `recipients_count: int`

### Endpoints (`/api/v1/notifications/`)
- `POST /api/v1/notifications/test-email`: Sends a diagnostic test HTML email.
- `POST /api/v1/notifications/send-digest`: Triggers on-demand activity digest dispatch.

## Testing Strategy
| Layer | What to Test | Approach |
| --- | --- | --- |
| Unit | Settings SMTP defaults | Instantiate `Settings()` without env vars; verify `smtp.gmail.com` and `587`. |
| Unit | Template rendering | Render `email_digest.html` and `email_test.html`; verify UNITEPC branding colors `#6B3392` & `#009E96`. |
| Unit | `EmailService` SMTP transport | Mock `smtplib.SMTP` to verify STARTTLS, login, and email payload assembly. |
| Integration | Notification endpoints | Use FastAPI `TestClient` with mocked `EmailService` to verify `/test-email` and `/send-digest` responses. |
| Integration | Notification worker fallback | Execute `dispatch_weekly_notifications` with users lacking phone numbers or failed WhatsApp; verify HTML email dispatch. |

## Migration / Rollout
- Update `.env.example` with standard Gmail SMTP configuration guidelines.
- No database schema migrations required.
- Restart backend service to load updated settings and notification endpoints.

## Open Questions
- None. Technical requirements and interface contracts are complete.
