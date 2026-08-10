# Exploration: Read-Only Contact Info display in Profile and Centralized Destination Editing

## Current State
Currently, `frontend/app/perfil/page.tsx` contains an editable form that allows users to modify `full_name`, `email`, `phone_number`, and `telegram_chat_id`. 
At the same time, `frontend/app/configuracion/notificaciones/page.tsx` allows users to configure custom override destinations (`custom_email`, `custom_whatsapp`, `custom_telegram_chat_id`) and notification channel preferences.

This dual-editing setup creates redundancy and ambiguity regarding where notification destinations should be managed. Furthermore, user system attributes such as `role` and `careers` (available on the `User` object in `AuthContext`) are not currently displayed in `/perfil`.

## Affected Areas
- `frontend/app/perfil/page.tsx` — Main profile page component to be refactored:
  - Remove editable inputs for `email`, `phone_number`, `telegram_chat_id`.
  - Keep `full_name` as the sole editable field in the profile form.
  - Display `email`, `role`, `careers`, `phone_number`, and `telegram_chat_id` as read-only badges/information fields.
  - Add action link/button "Administrar destinos y notificaciones" redirecting to `/configuracion/notificaciones`.
  - Update Telegram guide card to direct users to `/configuracion/notificaciones` to configure their Chat ID.
- `frontend/app/configuracion/notificaciones/page.tsx` — Destination & Notification center:
  - Serves as the single source of truth for configuring contact destinations (`custom_email`, `custom_whatsapp`, `custom_telegram_chat_id`) and channel testing.

## Approaches

### Approach 1: Focused Profile Refactor & Read-Only Badge Grid (Recommended)
- **Description**:
  - Simplify `/perfil` form state to handle only `full_name` for updating user identity.
  - Render read-only information section featuring badges and styled info cards for `email`, `role`, `careers` (as tag badges), `phone_number`, and `telegram_chat_id`.
  - Place a prominent button/link **"Administrar destinos y notificaciones"** routing to `/configuracion/notificaciones`.
  - Revise step 3 of the Telegram guide card to instruct configuring the ID in notification settings, and replace the inline test button with a button routing to `/configuracion/notificaciones`.
- **Pros**:
  - Clear separation of concerns between user identity (`full_name`) and notification channels.
  - Eliminates editing redundancy and user confusion.
  - Non-breaking backend integration (`PATCH /users/me` handles `full_name` updates smoothly).
- **Cons**:
  - Requires users to navigate to `/configuracion/notificaciones` to update phone/Telegram IDs.
- **Effort**: Low

### Approach 2: Modal-based Destination Manager on Profile Page
- **Description**:
  - Keep users on `/perfil` by triggering a dialog/modal containing notification settings when clicking "Administrar destinos".
- **Pros**:
  - Keeps user in context without changing route.
- **Cons**:
  - Duplicates UI from `/configuracion/notificaciones`, increasing maintenance overhead.
  - Conflicts with requirement to centralize destination editing in `/configuracion/notificaciones`.
- **Effort**: Medium

## Recommendation
Implement **Approach 1**: Refactor `/perfil` to display `full_name` as the sole editable field, render read-only badges/cards for `email`, `role`, `careers`, `phone_number`, `telegram_chat_id`, provide a clear action button redirecting to `/configuracion/notificaciones`, and update the Telegram guide card steps and call-to-action accordingly.

## Risks
- **User workflow change**: Users accustomed to updating phone/Telegram on `/perfil` must now use `/configuracion/notificaciones`.
  - *Mitigation*: Direct helper text and prominent "Administrar destinos y notificaciones" action links minimize friction.
- **Null or missing user fields**: Roles or careers might be unassigned or empty.
  - *Mitigation*: Use defensive fallbacks ("Sin carrera asignada", "No configurado") when rendering badges.

## Ready for Proposal
Yes — Clear requirements, bounded changes isolated to `frontend/app/perfil/page.tsx` with reference to `frontend/app/configuracion/notificaciones/page.tsx`.
