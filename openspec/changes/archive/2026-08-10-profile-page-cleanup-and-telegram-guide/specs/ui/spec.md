# UI Specification

## ADDED Requirements

### Requirement: Telegram Setup Guide and Notification Preference Banner on Profile Page
The `/perfil` page MUST feature a step-by-step guidance card for Telegram onboarding (including instructions for `@userinfobot`, Chat ID copy guidance, and a functional "Probar bot de Telegram" button) and MUST display a prominent banner directing users to `/configuracion/notificaciones`.

#### Scenario: User views interactive Telegram onboarding guide
- GIVEN an authenticated user viewing `/perfil`
- WHEN inspecting the "Configurar Telegram" section
- THEN the system MUST render numbered instructions for `@userinfobot`, Chat ID entry fields, and a "Probar bot de Telegram" trigger button invoking `api.users.testTelegram`.

#### Scenario: User navigates to Notification Preference Center from banner
- GIVEN an authenticated user viewing `/perfil`
- WHEN clicking the Call-to-Action button on the notification settings banner
- THEN the system MUST navigate the user directly to `/configuracion/notificaciones`.

## MODIFIED Requirements

### Requirement: User Profile Contact Management
The `/perfil` page MUST focus exclusively on personal contact profile management (`full_name`, `email`, `phone_number`, `telegram_chat_id`) using `api.users.updateMe`, omitting any automatic background activity list requests on page load.

#### Scenario: Profile page renders without activity list network calls
- GIVEN an authenticated user navigating to `/perfil`
- WHEN the profile view initializes
- THEN the system MUST fetch profile details via `api.users.getMe` and MUST NOT trigger `api.academic.list()` or `api.scientific.list()`.

#### Scenario: Updating personal contact information
- GIVEN an authenticated user modifying contact details on `/perfil`
- WHEN submitting the updated form
- THEN the system MUST submit changes to `api.users.updateMe` and render visual confirmation feedback.

## REMOVED Requirements

### Requirement: Legacy Ad-Hoc WhatsApp Summary Dispatch Card
(Reason: Notification schedules, multi-channel automated dispatches, and activity digests are now centrally managed in the Notification Preference Center (`/configuracion/notificaciones`), making ad-hoc WhatsApp summary builders on `/perfil` obsolete.)
