## Phase 1: Database & Schemas
- [x] `backend/app/models/models.py`: Update `RoleEnum` to include `super_admin`. Create `user_career_association` association table. Add bidirectional `relationship` between `User` and `Career`.
- [x] `backend/app/schemas/schemas.py`: Add `UserBase`, `UserCreate`, and `UserResponse` schemas (including `careers: List[CareerResponse]`). Add token schemas.

## Phase 2: Backend Core Auth & Routing
- [x] `backend/app/api/deps.py`: Implement `get_current_user` and `get_current_active_user` dependencies using `OAuth2PasswordBearer` and JWT decoding via `jose`.
- [x] `backend/app/api/v1/users.py`: Create router with `/me` endpoint to return current user. Add user creation logic restricted to `super_admin` for `admin` creation.
- [x] `backend/app/api/v1/public.py`: Create separate, isolated router for public endpoints (e.g. read-only calendar views) to ensure unauthenticated logic is not mixed with authenticated endpoints.
- [x] `backend/app/main.py`: Include the new `users` and `public` routers in the FastAPI application setup.

## Phase 3: Backend Scripts
- [x] `backend/scripts/create_super_admin.py`: Create a standalone script to generate the initial super admin user, reading credentials securely from the `.env` file.

## Phase 4: Frontend State & Integration
- [x] `frontend/context/AuthContext.tsx`: Create `AuthContext`, `AuthProvider`, and `useUser` hook. Implement token storage in `localStorage`, `login`, and strict `logout` upon expiration.
- [x] `frontend/app/layout.tsx`: Wrap the application root layout with `AuthProvider` to expose auth state globally.
- [x] `frontend/lib/api.ts`: Add an axios interceptor to automatically attach the `Authorization` header from `localStorage`. Handle 401 Unauthorized responses to trigger a strict context logout.
