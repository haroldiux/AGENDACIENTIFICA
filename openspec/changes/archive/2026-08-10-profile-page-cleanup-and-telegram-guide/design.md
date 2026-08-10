# Design: Profile Page Cleanup & Telegram Guide Optimization

## Technical Approach
Refactor `frontend/app/perfil/page.tsx` to streamline the `/perfil` page into a focused personal contact management view and Telegram integration guide.
1. **Remove Legacy Summary Logic**: Delete background activity fetching (`api.academic.list()`, `api.scientific.list()`), ad-hoc WhatsApp summary builder, and unused helper functions (`addDays`, `formatDate`, `normalizePhone`, `buildSummaryMessage`).
2. **Add Preference Banner**: Integrate a prominent callout banner directing users to the Notification Preference Center (`/configuracion/notificaciones`) via Next.js `Link`.
3. **Enhance Telegram Guide Card**: Upgrade the Telegram setup guide into a structured 4-step walkthrough with visual indicators, copy instructions trigger, and direct "Probar bot de Telegram" action button.
4. **Maintain Contact Form**: Keep `full_name`, `email`, `phone_number`, and `telegram_chat_id` form fields with submit handling via `api.users.updateMe`.

## Architecture Decisions

### Decision: Centralized Routing to Notification Preference Center
**Choice**: Redirect users seeking notification dispatches and frequency configuration to `/configuracion/notificaciones` via a top-level banner instead of embedding preference controls in `/perfil`.  
**Alternatives considered**: Embedding channel delivery settings inline within `/perfil`.  
**Rationale**: Preserves strict separation of concerns. `/perfil` manages user identity and contact channels; `/configuracion/notificaciones` manages delivery schedules, frequencies, and event triggers.

### Decision: Full Removal of Client-side Activity Fetching
**Choice**: Eliminate `useEffect` activity list preloading hooks and state variables (`academic`, `scientific`, `activitiesLoading`).  
**Alternatives considered**: Keeping background data load for potential future inline summaries.  
**Rationale**: Eliminates unnecessary network overhead on page load, reduces client JS bundle complexity, and prevents redundant backend API consumption.

## Data Flow
1. **Page Load**: `AuthContext` supplies current `user`. `useEffect` populates contact form state (`full_name`, `email`, `phone_number`, `telegram_chat_id`). No activity list API requests are made.
2. **Contact Info Update**: User edits contact fields -> Submits form -> Executes `api.users.updateMe` -> Updates `AuthContext` user state and renders feedback toast.
3. **Telegram Testing**: User inputs Telegram Chat ID -> Saves -> Clicks "Probar bot de Telegram" -> Executes `api.users.testTelegram()` -> Displays confirmation toast.
4. **Navigation to Notification Center**: User clicks banner CTA -> Navigates to `/configuracion/notificaciones`.

## File Changes
| File | Action | Description |
| --- | --- | --- |
| `frontend/app/perfil/page.tsx` | Modify | Remove activity list fetching, WhatsApp summary builder, and unused helpers (~150 lines removed). Enhance Telegram guide card and add navigation banner to `/configuracion/notificaciones`. |

## Interfaces / Contracts
- `api.users.updateMe(data: UserUpdateSchema): Promise<User>`: Used to update contact information fields.
- `api.users.testTelegram(): Promise<{ message: string }>`: Used to send test message via Telegram bot.
- Route link: `/configuracion/notificaciones`.

## Testing Strategy
| Layer | What to Test | Approach |
| --- | --- | --- |
| Frontend UI | Network request audit on load | Verify `/perfil` loads without making calls to `/academic-activities` or `/scientific-activities`. |
| Frontend UI | Profile Form Submission | Edit contact details and verify `api.users.updateMe` payload and success toast. |
| Frontend UI | Telegram Bot Testing | Test "Probar bot de Telegram" button with active Chat ID and verify response handling. |
| Navigation | Banner CTA Routing | Click notification banner CTA and verify redirection to `/configuracion/notificaciones`. |

## Migration / Rollout
- Zero backend schema or database changes required.
- Single frontend file update; verified through client build (`npm run build`).

## Open Questions
- None.
