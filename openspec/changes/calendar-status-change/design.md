# Design: Calendar Status Change

## Technical Approach
We will update the backend `ScientificActivityUpdate` schema to include the `status` field, fulfilling the requirement for open lifecycle updates. On the frontend, `CalendarView.tsx` will replace its static status badge with an interactive `<select>` dropdown. When a user changes the status, an `onStatusChange` callback will bubble up to `page.tsx`, which handles the API request (`api.scientific.updateStatus`). To ensure a responsive UI, the frontend will use optimistic updates—immediately reflecting the status change in the calendar and reverting with an error toast if the backend rejects the request.

For permissions, backend endpoints (`PUT /{id}`, `DELETE /{id}`, `PUT /{id}/status`) will enforce role-based access control. Investigators (`RoleEnum.research`) can edit/delete any scientific activity. Directors (`RoleEnum.coordinator`) will be restricted to modifying activities tied to their assigned careers. 

## Architecture Decisions

### Decision: Optimistic UI Updates
**Choice**: Update the local state immediately upon dropdown change, and revert if the API call fails.
**Alternatives considered**: Show a loading state in the modal and wait for the API response.
**Rationale**: Status changes are common, lightweight actions. Optimistic updates improve perceived performance. Reverting on failure with an error toast ensures users are informed without blocking the UI during network latency.

### Decision: Schema Evolution vs Strict Status Endpoints
**Choice**: Allow `status` in the main `ScientificActivityUpdate` schema while continuing to support the dedicated `update_scientific_status` endpoint.
**Alternatives considered**: Force all status updates through the dedicated `update_scientific_status` endpoint only.
**Rationale**: The spec requires the main update schema to support status fields for broad integration and to allow free lifecycle changes. Updating the main schema is necessary, while keeping the specific endpoint ensures backward compatibility with the frontend's existing `api.scientific.updateStatus` client.

## Data Flow
1. User selects a new status from the dropdown in the event detail modal (`CalendarView.tsx`).
2. `CalendarView` invokes `onStatusChange(activity, newStatus)`.
3. `page.tsx` catches the event, updates the target item's status in the local `items` array optimistically, and reflects the change in the UI.
4. `page.tsx` triggers `api.scientific.updateStatus(activity.id, newStatus)`.
5. Backend (`api/v1/scientific.py`) receives the request and extracts the current user via `get_current_active_user`.
6. Backend evaluates permissions:
   - Allow if `user.role == RoleEnum.research` (Investigator).
   - Allow if `user.role == RoleEnum.coordinator` (Director) AND `user.career_id == activity.career_id`.
   - Otherwise, return `403 Forbidden`.
7. On success, backend persists the status to the database.
8. On failure (e.g., 403 or network error), `page.tsx` catches the exception, restores the previous `items` array, and displays an error toast.

## File Changes
| File | Action | Description |
|---|---|---|
| `backend/app/schemas/schemas.py` | Modify | Add `status: Optional[ScientificActivityStatus] = None` to `ScientificActivityUpdate`. |
| `backend/app/api/v1/scientific.py` | Modify | Inject `get_current_active_user` dependency. Add role validation logic in `update_scientific_activity`, `update_scientific_status`, and `delete_scientific_activity`. |
| `frontend/components/calendar/CalendarView.tsx` | Modify | Replace static status display with a `<select>` dropdown. Add `onStatusChange` to component props. |
| `frontend/app/calendario/page.tsx` | Modify | Implement `handleStatusChange` with optimistic state update, error reversion, and toast notifications. Pass it to `CalendarView`. |

## Interfaces / Contracts

**Modified Backend Schema:**
```python
class ScientificActivityUpdate(BaseModel):
    title: Optional[str] = None
    activity_type: Optional[ScientificActivityType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    responsible_name: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[ScientificActivityStatus] = None # NEW
```

**Modified Frontend Component Props:**
```typescript
interface CalendarViewProps {
  items: MergedCalendarItem[];
  isLoading?: boolean;
  onStatusChange?: (activity: MergedCalendarItem, newStatus: ScientificActivityStatus) => void;
}
```

## Testing Strategy
| Layer | What to Test | Approach |
|---|---|---|
| Backend | Schema validation | Test `ScientificActivityUpdate` successfully accepts valid `status` and rejects invalid enum values. |
| Backend | Authorization logic | Test update/delete endpoints with mocked users: verify `research` can edit anything, `coordinator` can edit only their career, and others get 403. |
| Frontend | Optimistic Update | Mount `page.tsx`, trigger `onStatusChange`, verify local state updates immediately. Mock API failure and verify state reverts. |
| Frontend | UI Interaction | Render `CalendarView`, open modal, change select dropdown, assert `onStatusChange` is called with correct arguments. |

## Migration / Rollout
- No database schema migrations are necessary as the `status` column already exists in `ScientificActivity`.
- The new frontend features depend on the backend authorization updates. Deploy backend first to ensure the API accurately handles potential frontend interactions, then deploy the frontend.
- Ensure that the mocked/stubbed authentication layer (`deps.py`) is updated to provide a valid user with a `career_id` mapping if being tested locally.

## Open Questions
- **User-Career Association**: The current `User` model in `models.py` does not contain a relation to `Career` (e.g. `career_id` or a join table). To enforce the rule "Directors can edit activities for their careers", we must either add a `career_id` column to `User` or introduce a `user_career` mapping table. How should this schema change be structured?
- **Frontend Authentication Context**: The frontend currently does not possess a unified `useUser` context hook. Should we temporarily omit frontend UI hiding for unauthorized roles and rely entirely on the backend 403 response, or implement a basic auth context as part of this slice?
