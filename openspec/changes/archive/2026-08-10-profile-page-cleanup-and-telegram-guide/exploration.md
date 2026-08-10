# Exploration: Profile Page Cleanup & Telegram Guide Optimization

## Current State
Currently, `frontend/app/perfil/page.tsx` (`ProfilePage`) handles personal contact information management alongside legacy ad-hoc notification dispatch features (WhatsApp weekly activity summary builder) and automatic activity list fetching (`api.academic.list()` and `api.scientific.list()`).

With the implementation of the dedicated **Centro de Preferencias de Notificaciones** (`/configuracion/notificaciones`), automated notification dispatches (Email, WhatsApp, Telegram), frequency controls (daily, weekly, biweekly), and event filtering are fully managed centrally. Having manual WhatsApp summary dispatches and activity fetching inside `/perfil` creates code duplication, unnecessary page load overhead, and UI clutter.

## Affected Areas
- `frontend/app/perfil/page.tsx` — Main target file to refactor.
  - **Remove**: Activity fetching on mount (`api.academic.list()`, `api.scientific.list()`), state for `academic` and `scientific` activities, helper functions (`addDays`, `formatDate`, `normalizePhone`, `buildSummaryMessage`, `handleSendWhatsApp`), and the "Resumen semanal" card with WhatsApp send button.
  - **Retain & Enhance**: Contact Information form (`full_name`, `email`, `phone_number`, `telegram_chat_id`) with `api.users.updateMe` submit logic.
  - **Retain & Improve**: "Configurar Telegram" instruction card with step-by-step guidance for `@userinfobot`, copy instructions button, and "Probar bot de Telegram" button (`api.users.testTelegram`).
  - **Add**: Prominent banner/card pointing users directly to the Notification Preference Center (`/configuracion/notificaciones`).
- `frontend/components/layout/Sidebar.tsx` — Existing navigation already contains links to both `/perfil` ("Mi Perfil") and `/configuracion/notificaciones` ("Notificaciones"). No breaking changes needed.

## Approaches

### Approach 1: Streamlined Profile Page with Enhanced Telegram Guide & Preference Banner (Recommended)
Refactor `frontend/app/perfil/page.tsx` to focus strictly on Personal Contact Information and Telegram integration setup.
- Remove activity loading, weekly summary calculations, and ad-hoc WhatsApp dispatch logic.
- Add a top or side CTA banner with icon, description, and button navigating to `/configuracion/notificaciones`.
- Enhance the Telegram Setup guide with clear step-by-step visual indicators (Step 1: Open `@userinfobot`, Step 2: Copy Chat ID, Step 3: Paste & Save, Step 4: Test bot), keeping copy instructions and test trigger buttons.
- Maintain contact info form (`full_name`, `email`, `phone_number`, `telegram_chat_id`).

- **Pros**:
  - Eliminates 2 redundant API calls on profile load (`academic.list`, `scientific.list`).
  - Removes ~150 lines of duplicate summary-building code.
  - Establishes clear separation of concerns: `/perfil` is for user identity & contact channels; `/configuracion/notificaciones` is for delivery preferences.
  - Provides seamless navigation between contact info entry and notification preference configuration.
- **Cons**: None.
- **Effort**: Low.

### Approach 2: Tabbed Profile Interface
Split `/perfil` into tabs: "Información Personal", "Telegram Guide", and "Preferencias".
- **Pros**: Categorizes settings into tabbed views.
- **Cons**: Over-engineers a straightforward profile page; duplicates preference controls already established in `/configuracion/notificaciones`.
- **Effort**: Medium.

## Recommendation
Implement **Approach 1**. Cleaning `/perfil` of legacy activity-fetching and summary-dispatch widgets while adding a direct link banner to `/configuracion/notificaciones` provides a clean, modern user experience and eliminates redundant client-side logic.

## Risks
- **Risk**: Users expecting the legacy manual WhatsApp summary button on `/perfil`.
  - **Mitigation**: The banner directing to `/configuracion/notificaciones` clearly explains that automated notifications and summaries across WhatsApp, Telegram, and Email are managed in the Notification Center.

## Ready for Proposal
Yes — Ready for `sdd-propose`. The requirements are precise, code impact is isolated to `frontend/app/perfil/page.tsx`, and all dependencies are verified.
