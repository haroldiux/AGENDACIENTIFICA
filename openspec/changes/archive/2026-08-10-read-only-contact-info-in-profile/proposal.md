# Proposal: Read-Only Contact Info display in Profile and Centralized Destination Editing

## Intent
Eliminate duplicate editing of notification contact details and clarify user system properties by refactoring the Profile page (`/perfil`) so that `full_name` is the only editable identity field, displaying `email`, `role`, `careers`, `phone_number`, and `telegram_chat_id` as read-only, and centralizing destination management in `/configuracion/notificaciones`.

## Scope
### In Scope
- Refactor `/perfil` form to keep `full_name` as the sole editable field.
- Render read-only info fields and badges for `email`, `role`, `careers`, `phone_number`, and `telegram_chat_id`.
- Add prominent link/button redirecting users to `/configuracion/notificaciones` for destination edits.
- Update Telegram setup guide card on `/perfil` to point to `/configuracion/notificaciones`.

### Out of Scope
- Modifications to backend endpoints or database schemas.
- UI redesign of `/configuracion/notificaciones`.

## Approach
Simplify form state on `/perfil` to only manage `full_name` updates via `PATCH /users/me`. Display system metadata (`role`, `careers`) and contact info (`email`, `phone_number`, `telegram_chat_id`) using read-only UI cards and badges with defensive fallbacks for unassigned values. Include a clear navigation CTA to `/configuracion/notificaciones` and adjust Telegram guide links.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `frontend/app/perfil/page.tsx` | High | Remove contact inputs, render read-only badges, update CTAs & guide. |
| `frontend/app/configuracion/notificaciones/page.tsx` | Low | Target route for destination editing CTA; no code changes required. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| User confusion regarding location of contact info edits | Medium | Add clear helper text and a direct CTA link to `/configuracion/notificaciones`. |
| Null/missing user fields (e.g. unassigned careers) | Low | Provide clear fallback labels ("Sin carrera asignada", "No configurado"). |

## Rollback Plan
Revert changes to `frontend/app/perfil/page.tsx` via git commit rollback to restore previous profile form state and inputs.

## Dependencies
None

## Success Criteria
- [ ] Profile page (`/perfil`) displays `full_name` as the only editable field.
- [ ] `email`, `role`, `careers`, `phone_number`, and `telegram_chat_id` are rendered as read-only information/badges on `/perfil`.
- [ ] Navigation button/link leads users directly from `/perfil` to `/configuracion/notificaciones`.
- [ ] Telegram guide card directs users to `/configuracion/notificaciones` without inline edit controls.
