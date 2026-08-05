<Proposal: calendar-status-change>
## Intent
Enable users to change the status of scientific activities directly from the frontend calendar UI, and ensure the backend properly accepts status updates. Enforce permission rules and visibility requirements for activity statuses.

## Scope
### In Scope
- Adding an interactive status dropdown selector in the calendar event detail modal for scientific activities.
- Calling the backend API to update the activity status when changed.
- Fixing the backend `ScientificActivityUpdate` schema to accept the `status` field.
- Enforcing role-based permissions: Directors can edit activities for their careers; Investigators can edit/delete research activities across any career.
- Ensuring that cancelled activities remain visible on the calendar.
- Supporting free lifecycle status changes without strict restrictions.

### Out of Scope
- Sending email or WhatsApp notifications upon status changes (the architecture should eventually support triggering these via Celery/emails, but it is out of scope for this slice).

## Approach
Update the `ScientificActivityUpdate` Pydantic schema in the backend to include `status: Optional[ScientificActivityStatus]`. On the frontend, replace the static status badge in `CalendarView.tsx` with a `<select>` dropdown. Pass an `onStatusChange` callback to trigger the existing `api.scientific.updateStatus` API method, and handle authorization logic based on user roles before permitting edits.

## Affected Areas
| Area | Impact | Description |
|---|---|---|
| `backend/app/schemas/schemas.py` | Low | Include `status` in the `ScientificActivityUpdate` schema. |
| `frontend/components/calendar/CalendarView.tsx` | Medium | Replace static badge with an interactive select dropdown for status. |
| `frontend/app/calendario/page.tsx` | Medium | Implement the `onStatusChange` handler and role-based permissions check. |

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| State desynchronization | Medium | Handle API failures gracefully by reverting optimistic updates and showing an error toast. |
| Permission bypass | Low | Ensure the backend properly validates role permissions (Director vs Investigator). |

## Rollback Plan
Revert changes to the `ScientificActivityUpdate` schema and frontend components (`CalendarView.tsx`, `page.tsx`). Redeploy the backend and frontend containers.

## Dependencies
- Existing `api.scientific.updateStatus` client method on the frontend.
- Backend FastAPI authentication and role context.

## Success Criteria
- [ ] Users can change the status of a scientific activity from the calendar modal.
- [ ] The backend accepts and persists the updated status.
- [ ] Directors can edit activities within their careers.
- [ ] Investigators can edit/delete research activities across all careers.
- [ ] Cancelled activities still appear on the calendar.
