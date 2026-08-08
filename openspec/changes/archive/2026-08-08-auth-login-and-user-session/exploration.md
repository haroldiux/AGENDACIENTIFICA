# Exploration: Frontend Login Page, Route Protection & User Session Management

## Current State

The system currently has foundational backend authentication endpoints and frontend API utilities, but lacks a dedicated login page, user route protection, and a logout UI widget.

### Existing Components & Codebase Inspection
- **Backend API (`backend/app/api/v1/auth.py` & `users.py`)**:
  - `POST /api/v1/auth/login`: Accepts `OAuth2PasswordRequestForm` (`username` as email, `password` via `application/x-www-form-urlencoded`) and returns `{ "access_token": "...", "token_type": "bearer" }`.
  - `GET /api/v1/users/me`: Requires Bearer JWT token header; returns user profile (`id`, `email`, `full_name`, `role`, `is_active`, `careers`).
- **Frontend API client (`frontend/lib/api.ts`)**:
  - `apiClient`: Axios instance with request interceptor attaching `Authorization: Bearer <access_token>` from `localStorage` and response interceptor broadcasting an `auth-logout` window event on HTTP 401.
  - `api.auth.login(username, password)`: Form-encodes credentials and calls `/auth/login`.
  - `api.users.me()`: Calls `/users/me`.
- **Auth Context (`frontend/context/AuthContext.tsx`)**:
  - Provides `AuthProvider`, `useUser()` hook, and states (`user`, `token`, `isLoading`).
  - `login()` saves token to `localStorage` and fetches user details via `api.users.me()`.
  - `logout()` clears token from `localStorage` and resets context state.
  - *Gap*: The `User` TypeScript interface is missing `full_name` and `phone_number` properties.
- **Frontend App Router & Layout (`frontend/app/` & `frontend/components/layout/Sidebar.tsx`)**:
  - `frontend/app/login/page.tsx` **does not exist**.
  - `Sidebar.tsx` renders a basic user avatar and name at the bottom, but lacks email display and a functional "Cerrar Sesión" (Logout) button.
  - Unauthenticated users can navigate directly to protected paths (`/`, `/calendario`, `/actividades`, `/importar`, `/reportes`, `/configuracion/...`), resulting in failed API calls or empty states without redirection to `/login`.
  - `Sidebar` is unconditionally rendered on all routes in `frontend/app/layout.tsx`.

## Affected Areas

- `frontend/app/login/page.tsx` *(NEW)* — Create modern login page matching the Vercel/UNITEPC dark aesthetic, featuring email/password form, branding header, error messages, and submission logic calling `api.auth.login`.
- `frontend/context/AuthContext.tsx` — Update `User` interface to include `full_name?: string | null` and `phone_number?: string | null`.
- `frontend/components/auth/AuthGuard.tsx` *(NEW)* — Client component for route protection, redirecting unauthenticated users to `/login` and authenticated users away from `/login`.
- `frontend/app/layout.tsx` — Wrap main content with `AuthGuard` and conditionally omit `Sidebar` when on the `/login` route.
- `frontend/components/layout/Sidebar.tsx` — Enhance user profile footer badge to display user's full name, email, and role, and add a functional "Cerrar Sesión" button with `LogOut` icon calling `logout()`.

## Approaches

### Approach 1: Client-Side `AuthGuard` Component in App Layout (Recommended)
- **Description**: Create `frontend/components/auth/AuthGuard.tsx` as a Client Component utilizing `useUser()`, `usePathname()`, and `useRouter()`.
  - Public route whitelist: `['/login']`.
  - If `isLoading` is true: display full-page dark-themed loading state.
  - If unauthenticated and visiting a non-public route: redirect to `/login`.
  - If authenticated and visiting `/login`: redirect to `/` (dashboard).
  - In `layout.tsx`, wrap page content in `AuthGuard` and conditionally render `Sidebar` only on non-login routes.
- **Pros**:
  - Native compatibility with existing `localStorage` token storage, `apiClient` interceptors, and `AuthContext`.
  - Clean separation of concerns and reusable client-side route guard.
  - Prevents flash of unauthenticated content (FOUC).
- **Cons**: Requires rendering guard on client-side within App Router layout.
- **Effort**: Low to Medium

### Approach 2: Next.js Middleware (`middleware.ts`)
- **Description**: Implement route protection in Next.js Server Middleware reading session token from cookies.
- **Pros**: Server-side redirection before page hydration.
- **Cons**: Token is currently stored in `localStorage` (client-side only), which Next.js middleware cannot access. Transitioning to HTTP cookies would require refactoring `api.ts`, auth context, and backend CORS/cookie settings.
- **Effort**: High

## Recommendation

Adopt **Approach 1** (`AuthGuard` Client Component). It directly integrates with the current `localStorage` token persistence model, `apiClient` response interceptors for 401 handling, and `AuthContext` state management.

## Risks

- **Flash of Unauthenticated Content (FOUC)**: Mitigated by returning a full-page loading spinner in `AuthGuard` while `isLoading` is true.
- **Layout Distortion on Login Page**: Mitigated by checking `pathname === '/login'` in `layout.tsx` to hide the `Sidebar` and render the login page full screen.
- **Session Expiration / 401 Handling**: Mitigated by existing `auth-logout` event listener in `AuthContext` which triggers `logout()` and automatic `AuthGuard` redirection to `/login`.

## Ready for Proposal

**Yes** — The investigation is complete, affected areas are clearly defined, and the implementation strategy aligns with the Vercel/UNITEPC dark aesthetic and project architecture.
