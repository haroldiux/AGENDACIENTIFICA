## Exploration: Architectural overhaul for RBAC and Authentication.

### Current State
- **Database/Models**: `backend/app/models/models.py` has a `User` model and a `RoleEnum` (`admin`, `research`, `coordinator`, `teacher`). The `admin` role exists, but `super_admin` does not. There is no relationship between `User` and `Career` (users cannot be assigned multiple careers).
- **Backend Auth**: `backend/app/api/v1/auth.py` has a basic `/login` endpoint that issues JWT tokens. However, the authentication dependency in `backend/app/api/deps.py` (`get_current_active_user`) is a stub that always raises a 401 Unauthorized error. 
- **Backend Schemas**: `backend/app/schemas/schemas.py` does not currently define any User or Auth related schemas.
- **Frontend Auth**: There are no global authentication utilities (`AuthContext`, `useUser`, etc.) in the `frontend` folder, and routes/components do not currently restrict visibility based on session state or roles.

### Affected Areas
- `backend/app/models/models.py` — Needs a new `user_career_association` table to enable the many-to-many relationship. `RoleEnum` must be updated to include `super_admin`.
- `backend/app/schemas/schemas.py` — Needs new Pydantic schemas for `UserResponse`, `UserCreate`, and token structures to support role and career arrays.
- `backend/app/api/deps.py` — The `get_current_active_user` stub must be implemented to actually decode the JWT and fetch the user.
- `backend/app/api/v1/users.py` (New) — Need a `/me` endpoint for the frontend to fetch the current user's role and assigned careers.
- `frontend/src/context/AuthContext.tsx` (New) — Needs to be created to manage the JWT token, fetch `/me`, and provide a `useUser` hook.
- `frontend/src/lib/api.ts` (or similar) — Needs an interceptor or wrapper to inject the `Authorization: Bearer <token>` header into all requests.

### Approaches
1. **Custom React Context + FastAPI JWT (Recommended)**
   - **Pros**: Perfectly aligns with the existing `/login` endpoint in FastAPI. Easy to implement role-based visibility using a simple `useUser` hook. Full control over the token lifecycle.
   - **Cons**: Requires manually building route protection (e.g., Next.js middleware or HOCs) and managing token storage.
   - **Effort**: Medium

2. **NextAuth.js (Auth.js) Integration**
   - **Pros**: Robust, handles cookies, session management, and CSRF protection out of the box.
   - **Cons**: Heavy abstraction. Integrating NextAuth with a custom backend JWT provider can be tricky and might require redundant session logic.
   - **Effort**: High

### Recommendation
**Approach 1 (Custom React Context + FastAPI JWT)**. The backend already issues JWTs. We should build out `deps.py` to enforce authentication, expose a `/users/me` endpoint to return the user profile (including their role and `careers`), and build a standard `AuthContext` in Next.js to store the token and provide `useUser`. 

### Risks
- **API Breakage**: Modifying `deps.py` to actually enforce authentication will break the frontend until the frontend is updated to pass the `Authorization` header.
- **Data Migration**: Adding `super_admin` to the `RoleEnum` and the many-to-many `user_career` relationship will require an Alembic migration, which could fail if existing data constraints conflict.

### Ready for Proposal
Yes. The orchestrator can tell the user that the exploration is complete, identifying the missing pieces (M2M relation, super_admin role, missing `deps.py` implementation, and frontend context) and that we are ready to move to the `sdd-propose` phase.
