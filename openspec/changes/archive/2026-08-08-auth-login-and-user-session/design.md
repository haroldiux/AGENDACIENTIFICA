# Technical Design: Frontend Login Page, Route Protection & User Session Management

## Technical Approach
Implement client-side authentication, route protection, and session management in the Next.js frontend without requiring backend alterations. Route protection is handled by a dedicated `AuthGuard` client component wrapped around main layout contents. `AuthGuard` monitors `AuthContext` loading and authentication state alongside `usePathname()`, performing redirects to `/login` for unauthenticated users and away from `/login` for authenticated users. The `/login` view adheres to the dark Vercel/UNITEPC design system, hiding the application sidebar. `Sidebar` is upgraded to render active user details and a functional "Cerrar Sesión" logout button.

## Architecture Decisions

### Decision: Client-Side AuthGuard Component vs Server Middleware
**Choice**: Client-side `AuthGuard` component wrapping app routes in `layout.tsx`.
**Alternatives considered**: Next.js Server Middleware (`middleware.ts`).
**Rationale**: Access tokens are stored in client `localStorage` and managed via Axios request/response interceptors with custom `auth-logout` event listeners. Next.js server middleware cannot inspect `localStorage`. Migrating to HTTP-only cookies would require significant refactoring of backend CORS and frontend API handlers. `AuthGuard` prevents Flash of Unauthenticated Content (FOUC) by rendering a full-page dark spinner while `AuthContext.isLoading` is true.

### Decision: Pathname-Based Conditional Layout vs App Router Route Groups
**Choice**: Use `usePathname()` inside `Sidebar` and `layout.tsx` wrapper to hide navigation elements on `/login`.
**Alternatives considered**: Restructuring the app router into `(auth)` and `(dashboard)` route groups.
**Rationale**: Using `usePathname()` inside client components avoids modifying directory structures and routes across the existing application (`/`, `/calendario`, `/actividades`, `/importar`, `/reportes`, `/configuracion/...`).

## Data Flow

1. **Session Hydration**: On app load, `AuthProvider` checks `localStorage` for `access_token`. If present, calls `api.users.me()`, sets `user` state (including `full_name` & `phone_number`), and sets `isLoading = false`.
2. **Route Guard Check**: `AuthGuard` reads `user`, `isLoading`, and `pathname`:
   - If `isLoading`: Displays full-page dark loading view.
   - If `!user` & `pathname !== '/login'`: Redirects to `/login`.
   - If `user` & `pathname === '/login'`: Redirects to `/`.
   - Otherwise: Renders page content.
3. **Login Submission**: On `/login`, user enters credentials and submits form. Form invokes `api.auth.login(email, password)` sending `application/x-www-form-urlencoded`. On success, receives `access_token`, invokes `login(token)`, fetches user details via `api.users.me()`, and `AuthGuard` redirects to `/`. On error, displays inline alert banner without clearing input fields.
4. **Logout Execution**: User clicks "Cerrar Sesión" in `Sidebar` or a 401 API response triggers `auth-logout`. `logout()` purges `access_token` from `localStorage`, clears `user` & `token` state, and `AuthGuard` redirects to `/login`.

## File Changes

| File | Action | Description |
| --- | --- | --- |
| `frontend/context/AuthContext.tsx` | Modify | Update `User` interface to include optional `full_name` and `phone_number` fields. |
| `frontend/components/auth/AuthGuard.tsx` | Create | Client component managing route protection, loading spinners, and redirects. |
| `frontend/app/login/page.tsx` | Create | Dedicated dark Vercel/UNITEPC themed login page with form validation and error handling. |
| `frontend/components/layout/Sidebar.tsx` | Modify | Return `null` on `/login`, display user profile info in footer, and add "Cerrar Sesión" logout button. |
| `frontend/app/layout.tsx` | Modify | Wrap children in `AuthGuard` and adjust main container padding conditionally for `/login`. |

## Interfaces / Contracts

```typescript
// frontend/context/AuthContext.tsx
export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  phone_number?: string | null;
  is_active: boolean;
  role: string;
  careers: { id: number; name: string }[];
}

// frontend/components/auth/AuthGuard.tsx
export interface AuthGuardProps {
  children: React.ReactNode;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
| --- | --- | --- |
| Context | User profile & session state | Verify `User` schema contains `full_name` and `phone_number` after `api.users.me()`. |
| Route Guard | Unauthenticated & authenticated redirects | Test navigating to `/calendario` when logged out (redirects to `/login`), and `/login` when logged in (redirects to `/`). |
| UI & Form | Login page & Sidebar logout | Verify invalid credential error banner display, loading button states, and logout execution clearing token. |

## Migration / Rollout
- No database migrations or schema updates required.
- Fully compatible with existing FastAPI authentication routes (`/api/v1/auth/login` and `/api/v1/users/me`).

## Open Questions
- None.
