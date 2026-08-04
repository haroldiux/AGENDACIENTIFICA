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
The system MUST fall back to sending an Email notification via SMTP if the user lacks a phone number or if WhatsApp delivery fails.
#### Scenario: User lacks a phone number
- GIVEN a user without a registered `phone_number` is scheduled to receive an alert
- WHEN the system processes their notification
- THEN an email is dispatched via SMTP instead of a WhatsApp message.
#### Scenario: WhatsApp delivery fails
- GIVEN a user with a registered `phone_number`
- WHEN the WhatsApp API rejects the message or times out
- THEN an email is dispatched via SMTP as a fallback.

### Requirement: User Phone Number Registration
The system MUST support storing a string-based phone number for each user.
#### Scenario: Storing user phone number
- GIVEN a valid phone number string
- WHEN a user profile is updated or created
- THEN the system saves the phone number to the user's database record.
