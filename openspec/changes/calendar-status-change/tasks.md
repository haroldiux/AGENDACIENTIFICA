## Phase 1: Backend Schemas
- [x] `backend/app/schemas/schemas.py`: Add `status: Optional[ScientificActivityStatus] = None` to the `ScientificActivityUpdate` schema.

## Phase 2: Backend API and Authorization
- [x] `backend/app/api/v1/scientific.py`: Update endpoints (`update_scientific_activity`, `update_scientific_status`, `delete_scientific_activity`) to use the `get_current_active_user` dependency.
- [x] `backend/app/api/v1/scientific.py`: Implement role-based access control using `RoleEnum`. Ensure `super_admin`, `admin`, and `research` can edit any activity, while `coordinator` can only edit activities tied to their assigned careers.

## Phase 3: Frontend Components
- [x] `frontend/components/calendar/CalendarView.tsx`: Replace the static status display with an interactive `<select>` dropdown. Add `onStatusChange` callback to the component props.

## Phase 4: Frontend State and API Integration
- [x] `frontend/app/calendario/page.tsx`: Implement `handleStatusChange` logic to call `api.scientific.updateStatus`. Add optimistic state updates to the `items` array, reverting with an error toast on failure. Pass the handler to `CalendarView`.
