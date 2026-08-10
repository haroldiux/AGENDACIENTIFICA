## Exploration: Remove Telegram Guide from Profile Page and Retain Exclusively in Notifications

### Current State
Currently, `frontend/app/perfil/page.tsx` renders a two-column grid (`grid grid-cols-1 lg:grid-cols-3 gap-6`). The main area (`lg:col-span-2`) contains the editable profile name form and read-only account badges (`email`, `role`, `careers`, `phone_number`, `telegram_chat_id`). The right column contains a standalone "Guía de Vinculación de Telegram" card with step-by-step instructions for `@userinfobot`, a copy button, and navigation links.

Meanwhile, `frontend/app/configuracion/notificaciones/page.tsx` already contains an embedded, full Telegram onboarding guide ("¿Cómo obtener tu Telegram Chat ID?") directly within the Telegram channel settings block, including the 3-step guide, `@userinfobot` link (`https://t.me/userinfobot`), and a "Copiar instrucciones" button. Duplicate instructions on `/perfil` are unnecessary and clutter the profile layout.

### Affected Areas
- `frontend/app/perfil/page.tsx` — Refactor to remove the "Guía de Vinculación de Telegram" card, remove `copyTelegramInstructions` function, clean up unused `lucide-react` imports (`Send`, `Info`, `Copy`, `ExternalLink`), and restructure page layout into a clean, centered container (`max-w-4xl mx-auto space-y-6`).
- `frontend/app/configuracion/notificaciones/page.tsx` — Verified existing implementation; no changes required as it already retains the guide exclusively.

### Approaches
1. **Single Centered Card Container (`max-w-4xl mx-auto`)** — Remove the 3-column grid structure and sidebar from `frontend/app/perfil/page.tsx`. Wrap the page content in a centered container (`max-w-4xl mx-auto space-y-6`). Keep the top Notification Center banner, the profile information card with editable `full_name` and read-only account badges (`email`, `role`, `careers`, `phone_number`, `telegram_chat_id`), and the bottom notification link.
   - Pros: Clean, modern, visually balanced layout on all screen sizes; consistent with `/configuracion/notificaciones` container styling.
   - Cons: None.
   - Effort: Low.

2. **Unconstrained Full-Width Card (`w-full`)** — Simply remove the right sidebar column and stretch the main card to 100% width of the page.
   - Pros: Minimal layout code change.
   - Cons: Form inputs and badges stretch excessively wide on large/ultrawide displays, deteriorating visual readability.
   - Effort: Low.

### Recommendation
Adopt **Approach 1**. Refactor `frontend/app/perfil/page.tsx` to use a centered `max-w-4xl mx-auto` layout container, completely remove the "Guía de Vinculación de Telegram" Card and its unused helper functions and icon imports (`Send`, `Info`, `Copy`, `ExternalLink`), and keep `/configuracion/notificaciones/page.tsx` as the single authoritative place for Telegram onboarding instructions.

### Risks
- None. This is a frontend layout refactoring that preserves all profile editing functionality and API interactions without altering backend contracts.

### Ready for Proposal
Yes — The requirements and implementation path are clear. The orchestrator can proceed directly to `sdd-propose`.
