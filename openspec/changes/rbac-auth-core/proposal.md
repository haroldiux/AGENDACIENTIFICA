<Proposal: rbac-auth-core>
## Intent
Implement an architectural overhaul for RBAC and Authentication to support a complete hierarchy (including a new `super_admin` role) and a many-to-many relationship between users and careers. Consolidate public views for unauthenticated access.

## Scope
### In Scope
- Add `super_admin` role to `RoleEnum`. `super_admin` is the only role capable of creating other `admin` roles.
- Create a many-to-many `user_career_association` relationship in the database.
- Implement strict JWT token expiration on logout (no silent refresh tokens).
- Build the `AuthContext` on the frontend for token management and `useUser` hook.
- Implement `/me` endpoint to fetch user profiles (roles, careers).
- Implement backend `deps.py` logic to decode JWT and fetch users.
- Support consolidated public calendar views grouped by career, accessible without login.

### Out of Scope
- NextAuth.js integration (using custom React Context + FastAPI JWT instead).
- Silent refresh token mechanisms.
- Complex third-party OAuth providers.

## Approach
We will adopt the Custom React Context + FastAPI JWT approach. The backend will enforce strict JWT authentication by fully implementing the `get_current_active_user` dependency. A new `/me` endpoint will expose the current user's role and assigned careers. The frontend will introduce an `AuthContext` to manage the JWT lifecycle, including a strict logout mechanism upon token expiration. Unauthenticated users will be able to access general calendars grouped by career, ensuring public visibility as requested. We will use Alembic migrations to introduce the `user_career_association` table and the `super_admin` role. If migration conflicts occur during testing, the schema/tables can be dropped and recreated to wipe test data.

## Affected Areas
| Area | Impact | Description |
|---|---|---|
| `backend/app/models/models.py` | High | Add `user_career_association` table and `super_admin` to `RoleEnum`. |
| `backend/app/schemas/schemas.py` | Medium | New Pydantic schemas for `UserResponse`, `UserCreate`, and token structures. |
| `backend/app/api/deps.py` | High | Implement `get_current_active_user` to decode JWT and enforce authentication. |
| `backend/app/api/v1/users.py` | Medium | Add `/me` endpoint for frontend profile fetching. |
| `backend/app/api/v1/calendars.py` | Medium | Ensure public endpoints for calendars grouped by career without login. |
| `frontend/src/context/AuthContext.tsx` | High | Manage JWT token, strict expiration, and provide `useUser` hook. |
| `frontend/src/lib/api.ts` | Medium | Add HTTP interceptor to inject `Authorization: Bearer <token>` header. |

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| API Breakage | High | Frontend must be updated concurrently to pass the `Authorization` header on protected routes. |
| Data Migration Conflicts | Medium | Wipe test data and drop/recreate tables if Alembic migration fails when adding `user_career_association` and `super_admin`. |
| Missing Strict Logout | Low | Ensure `AuthContext` explicitly clears tokens and state immediately on JWT expiration. |

## Rollback Plan
- Revert the backend codebase to the state before the `rbac-auth-core` merge.
- Downgrade the database using `alembic downgrade` to the previous migration state.
- Rollback the frontend deployment and clear any cached JWT tokens on client browsers.

## Dependencies
- Existing `/login` endpoint in FastAPI.
- Alembic for database migrations.

## Success Criteria
- [ ] `super_admin` role is created and exclusively allowed to create `admin` roles.
- [ ] `user_career_association` many-to-many relationship is successfully migrated.
- [ ] Strict JWT expiration logic is implemented without silent refresh tokens.
- [ ] `/me` endpoint correctly returns the user profile, role, and careers.
- [ ] `AuthContext` effectively manages session state on the frontend.
- [ ] General calendars are accessible to the public without login, grouped by career.
- [ ] Frontend protected routes correctly restrict access based on session state and roles.
</Proposal: rbac-auth-core>
