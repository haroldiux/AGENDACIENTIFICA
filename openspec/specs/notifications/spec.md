# Notifications Specification

## Purpose
The notifications domain handles the dispatch of automated alerts, reminders, and updates to users regarding upcoming academic and scientific activities. It ensures timely delivery through primary and fallback communication channels.

## Requirements

### Requirement: Weekly Scheduled Dispatch
The system MUST execute a scheduled task every Sunday at 20:00 to dispatch notifications for upcoming activities.
#### Scenario: Weekly execution triggers successfully
- GIVEN the current time is Sunday 20:00
- WHEN the notification worker is triggered by the scheduling service
- THEN the system queries for activities occurring within the lookahead window and prepares dispatches.

### Requirement: Configurable Lookahead Range
The system MUST determine the range of upcoming activities using a configurable lookahead parameter, defaulting to 7 days.
#### Scenario: Default lookahead range is applied
- GIVEN the lookahead parameter is not explicitly provided in the environment
- WHEN the notification worker queries upcoming activities
- THEN the system retrieves activities occurring within the next 7 days.
#### Scenario: Custom lookahead range is configured
- GIVEN the environment variable `NOTIFICATION_DAYS_AHEAD` is set to 14
- WHEN the notification worker queries upcoming activities
- THEN the system retrieves activities occurring within the next 14 days.

### Requirement: Primary Notification Delivery (WhatsApp)
The system SHOULD attempt to send notifications via WhatsApp as the primary delivery channel for users with a configured phone number.
#### Scenario: User has a phone number and delivery succeeds
- GIVEN a user with a registered `phone_number` is scheduled to receive an activity alert
- WHEN the system attempts to send the notification
- THEN a summarized message is successfully dispatched via the WhatsApp API.

### Requirement: Fallback Notification Delivery (Email)
The system MUST fall back to sending an HTML Email notification rendered via `email_service.py` with UNITEPC branding if the user lacks a phone number or if WhatsApp delivery fails.
#### Scenario: User lacks a phone number receives HTML email
- GIVEN a user without a registered `phone_number` is scheduled to receive an alert
- WHEN the notification worker processes their notification
- THEN a Jinja2-rendered HTML email with UNITEPC branding is dispatched via SMTP instead of a plain-text email.
#### Scenario: WhatsApp delivery fails and falls back to HTML email
- GIVEN a user with a registered `phone_number` whose WhatsApp message delivery fails
- WHEN the notification worker detects the delivery failure
- THEN the system renders and dispatches an HTML email with UNITEPC branding via `email_service.py`.

### Requirement: User Phone Number Registration
The system MUST support storing a string-based phone number for each user.
#### Scenario: Storing user phone number
- GIVEN a valid phone number string
- WHEN a user profile is updated or created
- THEN the system saves the phone number to the user's database record.

### Requirement: Gmail SMTP Configuration Defaults
The system MUST set default SMTP parameters to Gmail SMTP settings (`smtp.gmail.com`, port 587, TLS enabled) when SMTP configuration variables are not explicitly overridden.
#### Scenario: Default Gmail SMTP configuration loaded
- GIVEN no custom SMTP parameters are set in the environment
- WHEN the core application configuration initializes
- THEN the system configures SMTP host to `smtp.gmail.com`, port to `587`, and enables TLS encryption.
#### Scenario: Custom SMTP server overrides defaults
- GIVEN `SMTP_HOST` is explicitly set to `smtp.custom.org` and `SMTP_PORT` to `465`
- WHEN the core application configuration initializes
- THEN the system uses `smtp.custom.org` and port `465` instead of default Gmail settings.

### Requirement: Jinja2 HTML Email Rendering with UNITEPC Branding
The system MUST render outgoing email notifications using Jinja2 HTML templates styled with UNITEPC institutional brand colors (`#6B3392` primary, `#009E96` secondary).
#### Scenario: Activity digest template rendered with UNITEPC branding
- GIVEN an activity digest dataset prepared for dispatch
- WHEN `email_service.py` renders the `email_digest.html` template
- THEN the resulting email body contains HTML elements formatted with `#6B3392` headers and `#009E96` accent styles.
#### Scenario: Test email template rendered successfully
- GIVEN a request to generate a diagnostic test email
- WHEN `email_service.py` renders the `email_test.html` template
- THEN the email contains system diagnostic status information styled with UNITEPC branding.

### Requirement: SMTP Diagnostic Endpoint
The system MUST expose a REST endpoint `POST /api/v1/notifications/test-email` that sends a test HTML email and returns diagnostic status details.
#### Scenario: Test email sent successfully via diagnostic endpoint
- GIVEN valid SMTP credentials configured in the system
- WHEN an authenticated administrator submits `POST /api/v1/notifications/test-email` with a recipient address
- THEN the system dispatches a test HTML email and returns a HTTP 200 success response with diagnostic details.
#### Scenario: Diagnostic endpoint handles SMTP authentication failure
- GIVEN invalid SMTP credentials configured in the system
- WHEN a request is submitted to `POST /api/v1/notifications/test-email`
- THEN the system catches the SMTP exception and returns an appropriate error response.

### Requirement: Manual Activity Digest Dispatch Endpoint
The system MUST expose a REST endpoint `POST /api/v1/notifications/send-digest` to manually trigger activity digest generation and email delivery.
#### Scenario: Activity digest manually triggered via endpoint
- GIVEN active scientific activities scheduled in the database
- WHEN an administrator submits a request to `POST /api/v1/notifications/send-digest`
- THEN the system triggers the digest generation task and dispatches branded HTML emails to designated recipients.

