# Tasks: Read-Only Contact Info in Profile and Centralized Destination Editing

## Phase 1: Profile Page Refactoring (`/perfil`)
- [x] `frontend/app/perfil/page.tsx`: Refactor form state and submission logic so that `full_name` is the sole editable identity field calling `api.users.updateMe`.
- [x] `frontend/app/perfil/page.tsx`: Replace contact inputs (`email`, `phone_number`, `telegram_chat_id`) with read-only UI cards, info rows, and badges.
- [x] `frontend/app/perfil/page.tsx`: Add defensive fallback labels ("Sin carrera asignada", "No configurado") for unassigned user metadata and contact fields.
- [x] `frontend/app/perfil/page.tsx`: Update the Telegram onboarding guide card and navigation banner to redirect users to `/configuracion/notificaciones`.

## Phase 2: Notification Preferences Page Enhancements (`/configuracion/notificaciones`)
- [x] `frontend/app/configuracion/notificaciones/page.tsx`: Add/integrate the step-by-step Telegram onboarding guide card and verification action on `/configuracion/notificaciones` alongside Telegram Chat ID configuration.

## Phase 3: Integration & End-to-End Verification
- [x] `frontend/app/perfil/page.tsx`: Verify profile updates, read-only field rendering, and navigation links to `/configuracion/notificaciones`.
