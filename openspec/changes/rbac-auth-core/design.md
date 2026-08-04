## Technical Approach
Implement the Custom React Context + FastAPI JWT approach. The backend will enforce strict JWT authentication by fully implementing the `get_current_active_user` dependency. A new `/me` endpoint will expose the current user's profile, role, and assigned careers. The frontend will use an `AuthContext` to manage the JWT lifecycle, with strict logout upon expiration, and attach the token via an axios interceptor in `api.ts`. Unauthenticated users can view general calendars grouped by career.

## Architecture Decisions
### Decision: Custom React Context + FastAPI JWT vs NextAuth.js
**Choice**: Custom React Context + FastAPI JWT.
**Alternatives considered**: NextAuth.js (Auth.js) Integration.
**Rationale**: Perfectly aligns with the existing `/login` endpoint in FastAPI. Easy to implement role-based visibility using a simple `useUser` hook with full control over the token lifecycle and strict expiration logic. Avoids the heavy abstraction and complexities of configuring NextAuth with a custom backend provider.

### Decision: User-Career Many-to-Many Implementation
**Choice**: Create a `user_career_association` association table in SQLAlchemy.
**Alternatives considered**: JSON column array of career IDs on the `User` table.
**Rationale**: An association table enforces referential integrity through foreign keys, makes bidirectional queries easy, and supports complex queries for filtering items based on the user's assigned careers.

### Decision: `super_admin` Role Logic
**Choice**: Add `super_admin` to `RoleEnum` and check it in the user creation endpoint.
**Alternatives considered**: A separate boolean flag `is_super_admin` on the `User` model.
**Rationale**: Extending the existing `RoleEnum` keeps role management unified, avoiding conflicting states like `role=teacher` and `is_super_admin=True`.

## Data Flow
1. **Authentication**: User logs in via the `/auth/login` endpoint. Backend validates credentials and returns a JWT access token.
2. **Token Storage & Profile Fetch**: Frontend `AuthContext` stores the JWT in `localStorage` (or memory/cookies depending on security policy). The frontend then calls `/users/me` with the `Authorization: Bearer <token>` header to fetch the user profile, role, and assigned careers.
3. **Protected Requests**: The `axios` instance in `frontend/lib/api.ts` intercepts all API requests and injects the `Authorization` header. If a 401 is received, it triggers a logout in the context.
4. **Backend Authorization**: `backend/app/api/deps.py` intercepts incoming protected requests, decodes the JWT using `jose`, verifies the token, looks up the user, and attaches the active user to the request context.
5. **Public Access**: Calendar viewing endpoints (`/fusion/`, `/academic/`, `/scientific/` when read-only) remain accessible without a token (or handle optional authentication) so unauthenticated users can view career-grouped calendars.

## File Changes
| File | Action | Description |
|---|---|---|
| `backend/app/models/models.py` | Modify | Add `super_admin` to `RoleEnum`. Add `user_career_association` table. Add bidirectional `relationship` between `User` and `Career`. |
| `backend/app/schemas/schemas.py` | Modify | Add `UserBase`, `UserCreate`, and `UserResponse` (including `careers: List[CareerResponse]`) schemas. Add token schemas. |
| `backend/app/api/deps.py` | Modify | Implement `get_current_user` and `get_current_active_user` using `OAuth2PasswordBearer` and JWT decoding via `jose`. |
| `backend/app/api/v1/users.py` | Create/Modify | Add router with `/me` endpoint to return current user. Add user creation logic restricted to `super_admin` for `admin` creation. |
| `backend/app/main.py` | Modify | Include the new `users.py` router. |
| `frontend/lib/api.ts` | Modify | Add axios interceptor to attach `Authorization` header from `localStorage`. Handle 401 Unauthorized for strict logout. |
| `frontend/context/AuthContext.tsx` | Create | Create `AuthContext`, `AuthProvider`, and `useUser` hook. Manage `login`, `logout`, and token storage. |
| `frontend/app/layout.tsx` | Modify | Wrap the application tree with `AuthProvider`. |

## Interfaces / Contracts
- **`GET /users/me`**: Returns `UserResponse` with user ID, email, full name, role, and a list of `CareerResponse` objects.
- **`POST /users/`**: Accepts `UserCreate` (email, password, full name, role, career_ids). Enforces that only `super_admin` can create `admin`.

## Testing Strategy
| Layer | What to Test | Approach |
|---|---|---|
| Database / Models | User-Career many-to-many | Create user, add careers, verify relations in DB session. |
| API / `deps.py` | JWT validation & active user | Unit test `get_current_active_user` with valid, expired, and invalid tokens. |
| API / Users | `super_admin` role restriction | Attempt to create `admin` role with a regular `admin` user (should fail) and `super_admin` user (should pass). |
| Frontend / Interceptor | Authorization Header | Mock API response. Verify that `apiClient` adds `Authorization` header. Verify that 401 triggers context logout. |
| Frontend / Context | Login / Logout state | Mount `AuthProvider`, call `login` and `logout`, assert token presence in storage and user state changes. |

## Migration / Rollout
1. Run Alembic migration to add `user_career_association` table and update `RoleEnum` with `super_admin`.
2. Deploy backend updates (`deps.py`, `users.py`, `models.py`). Ensure default `super_admin` exists.
3. Deploy frontend updates (`AuthContext`, `api.ts` interceptor).

## Open Questions
- Should the `super_admin` user be created automatically via an initial database seed, or manually through a DB script?
- For public calendar views, do we need separate public endpoints, or should we make `Depends(get_current_active_user)` optional on existing read endpoints? (Assuming optional or separate public routes as needed).
