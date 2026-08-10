# Tasks: Profile Page Cleanup and Telegram Guide

## Phase 1: Clean Up Legacy Activity Fetching and WhatsApp Summary
- [x] `frontend/app/perfil/page.tsx`: Remove redundant client-side activity preloading (`api.academic.list()`, `api.scientific.list()`), activity state variables (`academic`, `scientific`, `activitiesLoading`), helper functions (`addDays`, `formatDate`, `normalizePhone`, `buildSummaryMessage`, `handleSendWhatsApp`), and the ad-hoc WhatsApp summary card.

## Phase 2: Notification Preference Banner & Telegram Onboarding Guide
- [x] `frontend/app/perfil/page.tsx`: Add a prominent notification settings callout banner directing users to the Notification Preference Center (`/configuracion/notificaciones`) via Next.js `Link`.
- [x] `frontend/app/perfil/page.tsx`: Refactor the Telegram setup card into a structured 4-step onboarding walkthrough with step indicators, copy instructions action, and functional "Probar bot de Telegram" button.

## Phase 3: Verification & Build Validation
- [x] `frontend/app/perfil/page.tsx`: Verify contact information updates (`full_name`, `email`, `phone_number`, `telegram_chat_id`) via `api.users.updateMe` without residual activity list side effects.
- [x] `frontend/package.json`: Run Next.js production build (`npm run build` in `frontend/`) to confirm type safety and error-free compilation.

