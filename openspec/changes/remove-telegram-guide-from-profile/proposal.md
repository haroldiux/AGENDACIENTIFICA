# Proposal: Remove Telegram Guide from Profile

## Intent
Remove the duplicate Telegram setup guide card from the user profile page (`/perfil`) and consolidate layout into a clean centered container, keeping Telegram guide instructions exclusively on the Notifications configuration page (`/configuracion/notificaciones`).

## Scope
### In Scope
- Refactor `frontend/app/perfil/page.tsx` layout from a multi-column grid to a centered `max-w-4xl mx-auto` container.
- Remove the right-column "Guía de Vinculación de Telegram" card from `frontend/app/perfil/page.tsx`.
- Remove unused helper functions (`copyTelegramInstructions`) and unused Lucide icon imports (`Send`, `Info`, `Copy`, `ExternalLink`).
- Preserve all existing user profile features (editable profile name form, read-only account detail badges including `telegram_chat_id`, notification center banner).

### Out of Scope
- Any changes to `/configuracion/notificaciones/page.tsx` (which already has complete Telegram setup guide).
- Any changes to backend endpoints, profile APIs, or database schemas.

## Approach
Refactor `frontend/app/perfil/page.tsx` by removing the `grid grid-cols-1 lg:grid-cols-3` grid structure and right sidebar column containing the Telegram guide card. Re-align the remaining main profile card inside a `max-w-4xl mx-auto space-y-6` container for consistent visual presentation across all device viewports. Clean up unused helper functions and unused icon imports.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `frontend/app/perfil/page.tsx` | High | Remove Telegram guide card, remove `copyTelegramInstructions`, clean up unused icon imports, and convert layout to centered container (`max-w-4xl`). |
| `frontend/app/configuracion/notificaciones/page.tsx` | None | Verified existing implementation; retains Telegram onboarding guide exclusively. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| None | Low | Frontend layout refactor only; no API or state management changes. |

## Rollback Plan
Revert commit on `frontend/app/perfil/page.tsx` to restore previous multi-column grid and sidebar card layout.

## Dependencies
None.

## Success Criteria
- [ ] Profile page (`/perfil`) no longer displays the right-side Telegram guide sidebar card.
- [ ] Profile page layout uses a centered `max-w-4xl mx-auto` container structure.
- [ ] User profile form editing and `telegram_chat_id` read-only badge remain functional.
- [ ] Telegram setup guide remains accessible on `/configuracion/notificaciones`.
