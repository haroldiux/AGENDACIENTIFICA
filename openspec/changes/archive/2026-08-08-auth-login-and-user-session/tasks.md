# Tasks: Frontend Login Page, Route Protection & User Session Management

## Phase 1: Authentication Context & Route Guard
- [x] `frontend/context/AuthContext.tsx`: Extend `User` interface with optional `full_name` and `phone_number` fields.
- [x] `frontend/components/auth/AuthGuard.tsx`: Create client component to handle loading state, route protection, and redirects for authenticated vs unauthenticated states.

## Phase 2: Login Interface & Auth API Integration
- [x] `frontend/app/login/page.tsx`: Build dark-themed Vercel/UNITEPC login page with email/password form, validation, inline error alerts, and `api.auth.login` submission handling.

## Phase 3: Layout & Sidebar Integration
- [x] `frontend/components/layout/Sidebar.tsx`: Add conditional check to return `null` on `/login`, display active user profile details (full name, email, role), and add functional "Cerrar Sesión" logout button.
- [x] `frontend/app/layout.tsx`: Wrap application content with `AuthGuard` component and adjust layout container conditionally for `/login`.
