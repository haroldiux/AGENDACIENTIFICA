## Exploration: calendar-status-change
### Current State
Currently, the frontend calendar UI (`CalendarView.tsx`) displays the details of scientific activities in a modal, showing the current `status` using a static badge, but there is no mechanism to change it directly from the UI. 
Additionally, the backend generic update endpoint `PUT /api/v1/scientific/{id}` is intended to update scientific activities. However, it fails to update the `status` field because the Pydantic schema `ScientificActivityUpdate` in `app/schemas/schemas.py` omits the `status` field, causing any provided status to be silently dropped during validation.

### Affected Areas
- `backend/app/schemas/schemas.py` — Needs to include the `status` field in the `ScientificActivityUpdate` schema.
- `frontend/components/calendar/CalendarView.tsx` — Needs a new interactive dropdown select in the event detail modal for scientific activities to choose and update the status.
- `frontend/app/calendario/page.tsx` — Needs to implement the handler for the status change using the existing `api.scientific.updateStatus` method and pass it to `CalendarView`.

### Approaches
1. **Fix Schema and Add UI Control** — Update `ScientificActivityUpdate` schema to include `status: Optional[ScientificActivityStatus] = None`. In the frontend, pass a new `onStatusChange` callback to `CalendarView`. Render a `<select>` dropdown inside the modal instead of the static badge for scientific activities. Trigger the `updateStatus` API when changed.
   - Pros: Directly fixes the backend bug at its root. Reuses the existing `updateStatus` dedicated API call from the frontend, ensuring good separation of concerns. Simple to implement on the UI.
   - Cons: Minimal visual change, but requires handling asynchronous UI updates inside the modal.
   - Effort: Low

### Recommendation
Proceed with **Approach 1**. It solves both the backend bug (by fixing the validation schema) and the frontend requirement (by introducing a minimal status selector inside the existing modal, tied to the already available API client method).

### Risks
- If the API call fails during a status change on the frontend, we must gracefully handle reverting the optimistic update or showing an error toast to avoid desync between the UI and backend.

### Ready for Proposal
Yes — The root cause of the backend bug is identified, and a straightforward frontend solution using the existing API client has been found.
