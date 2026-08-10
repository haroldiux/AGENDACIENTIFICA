# Archive: Read-Only Contact Info in Profile and Centralized Destination Editing

## Final Status
Completed successfully.

## Summary of Changes
- Refactored profile form (`/perfil`) state so that `full_name` is the single editable field submitted via `api.users.updateMe`.
- Displayed user details (`email`, `role`, `careers`, `phone_number`, `telegram_chat_id`) as read-only cards, info rows, and badges with defensive fallback labels ("Sin carrera asignada", "No configurado").
- Replaced inline contact input controls and Telegram setup form on `/perfil` with guidance text and direct navigation CTAs routing users to `/configuracion/notificaciones`.
- Integrated step-by-step Telegram setup guide card into `/configuracion/notificaciones` alongside channel destination controls.
- Synced delta specs into `openspec/specs/ui/spec.md`.

## Verification Results
- `npx tsc --noEmit` passed with 0 errors.
- `npm run build` in `frontend/` built successfully (static output for `/perfil`).
- Pytest suite `pytest tests/` passed (98 passed, 9 skipped).
- Updated E2E and UAT tests (`e2e/test_profile.py`, `scratch/uat_tests/test_profile_manual.py`) to align with read-only profile behavior.

## Artifacts Archived
- `proposal.md`
- `exploration.md`
- `design.md`
- `tasks.md`
- `verify-report.md`
- `specs/ui/spec.md`
