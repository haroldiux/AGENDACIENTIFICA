<Proposal: Frontend Login Page, Route Protection & User Session Management>

## Intent
Provide a dedicated client-side authentication flow, including a dark-themed login page matching the Vercel/UNITEPC aesthetic, client-side route protection (`AuthGuard`), expanded user context metadata, and session logout functionality in the application sidebar.

## Scope
### In Scope
- Create `/login` page with email/password form, branding header, error messaging, and auth API integration.
- Implement `AuthGuard` client component for route redirection (unauthenticated users to `/login`, authenticated users away from `/login`).
- Extend `User` interface in `AuthContext` to include `full_name` and `phone_number`.
- Update `layout.tsx` to wrap content in `AuthGuard` and conditionally hide `Sidebar` on `/login`.
- Enhance `Sidebar.tsx` footer to display user details and add a functional "Cerrar Sesión" logout button.

### Out of Scope
- Server-side Next.js middleware cookie session migration.
- Backend API authentication changes or new auth endpoints.
- Password reset, sign-up, or multi-factor authentication flows.

## Approach
Implement `AuthGuard` as a React Client Component consuming `AuthContext`. Check `pathname` against a public route whitelist (`['/login']`). Display a dark full-page loading state while `isLoading` is true. Redirect unauthenticated users to `/login` and authenticated users attempting `/login` to `/`. In `layout.tsx`, render `Sidebar` conditionally based on whether the route is `/login`. Integrate `logout()` into `Sidebar.tsx`.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `frontend/app/login/page.tsx` | High | New login page component with form handling and error states. |
| `frontend/components/auth/AuthGuard.tsx` | High | New client route guard managing authentication state and redirects. |
| `frontend/app/layout.tsx` | Medium | Wrap app in `AuthGuard` and conditionally omit `Sidebar` for `/login`. |
| `frontend/context/AuthContext.tsx` | Low | Add `full_name` and `phone_number` to `User` interface. |
| `frontend/components/layout/Sidebar.tsx` | Low | Display user profile details and add functional logout button. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Flash of unauthenticated content (FOUC) | Medium | Render full-page loading spinner in `AuthGuard` while `isLoading` is true. |
| Sidebar layout shift on login page | Low | Conditionally omit `Sidebar` when `pathname === '/login'`. |
| Unhandled 401 session expiration | Low | Rely on existing `auth-logout` event handler in `AuthContext` to trigger redirect. |

## Rollback Plan
Revert changes in `frontend/app/layout.tsx`, `Sidebar.tsx`, and `AuthContext.tsx`, and remove `frontend/app/login/page.tsx` and `frontend/components/auth/AuthGuard.tsx`.

## Dependencies
- Backend endpoints `POST /api/v1/auth/login` and `GET /api/v1/users/me`.
- Existing `apiClient` and `AuthContext` in frontend.

## Success Criteria
- [ ] Unauthenticated access to protected routes redirects to `/login`.
- [ ] Authenticated users visiting `/login` are redirected to `/`.
- [ ] Users can log in using valid credentials and be redirected to `/`.
- [ ] Sidebar displays user's full name, email, and role, with a working logout button.
- [ ] Login page adheres to dark Vercel/UNITEPC design system without rendering the sidebar.
