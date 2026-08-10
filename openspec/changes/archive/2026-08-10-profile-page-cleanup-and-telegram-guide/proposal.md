<Proposal: Profile Page Cleanup & Telegram Guide Optimization>
## Intent
Refactor `/perfil` (`frontend/app/perfil/page.tsx`) to focus exclusively on Personal Contact Information and Telegram integration setup. Remove legacy ad-hoc notification dispatch features (WhatsApp weekly summary) and redundant activity fetching, while adding a direct link banner to the Central Notification Preference Center (`/configuracion/notificaciones`).

## Scope
### In Scope
- Refactoring `frontend/app/perfil/page.tsx` to remove activity fetching (`api.academic.list()`, `api.scientific.list()`), state variables, date formatting helpers, and the manual WhatsApp summary card.
- Retaining and enhancing the Contact Information form (`full_name`, `email`, `phone_number`, `telegram_chat_id`).
- Improving the "Configurar Telegram" step-by-step guidance card (instructions for `@userinfobot`, copy Chat ID instructions, and "Probar bot de Telegram" button).
- Adding a prominent notification banner with a CTA directing users to `/configuracion/notificaciones`.

### Out of Scope
- Modifications to `/configuracion/notificaciones` (Notification Preference Center).
- Changes to backend notification API endpoints or user schema.
- Changes to navigation sidebar layout.

## Approach
Implement Approach 1: Streamlined Profile Page with Enhanced Telegram Guide & Preference Banner. Clean `frontend/app/perfil/page.tsx` by removing redundant activity loading hooks and WhatsApp summary generator code (~150 lines). Retain contact management and enhance the Telegram step-by-step onboarding guide. Add a prominent banner pointing users to `/configuracion/notificaciones` to establish a clear separation between contact channels (`/perfil`) and delivery preferences (`/configuracion/notificaciones`).

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `frontend/app/perfil/page.tsx` | High | Remove legacy activity calls & WhatsApp summary builder; enhance Telegram guide and add link banner to notification settings. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Users looking for legacy manual WhatsApp summary button on `/perfil` | Low | Display a clear banner explaining that notification schedules and automated dispatches are managed in the Notification Center (`/configuracion/notificaciones`). |

## Rollback Plan
Revert changes in `frontend/app/perfil/page.tsx` to restore legacy activity fetching on mount and manual WhatsApp summary dispatch card.

## Dependencies
- Existing `api.users.updateMe` and `api.users.testTelegram` API clients.
- Existing `/configuracion/notificaciones` route.

## Success Criteria
- [ ] `/perfil` loads without triggering `api.academic.list()` or `api.scientific.list()`.
- [ ] Personal contact form updates user info via `api.users.updateMe` successfully.
- [ ] Enhanced Telegram setup guide provides clear instructions and functional "Probar bot de Telegram" button.
- [ ] Notification banner correctly navigates users to `/configuracion/notificaciones`.
- [ ] Redundant WhatsApp summary dispatch code is completely removed from `frontend/app/perfil/page.tsx`.
</Proposal: Profile Page Cleanup & Telegram Guide Optimization>
