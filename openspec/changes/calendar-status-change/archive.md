# calendar-status-change Archive

## Final Status
Completed successfully.

## Summary of Changes
- Added support for updating scientific activity status directly from the calendar UI with optimistic updates.
- Ensured status updates persist properly via the backend schema without strict transition restrictions.
- Enforced role-based access control (RBAC): Directors can edit only activities in their career; Investigators can edit/delete research activities across any career.
- Made cancelled activities remain visible in the calendar.
- Integrated the new activities specification into `openspec/specs/activities`.
