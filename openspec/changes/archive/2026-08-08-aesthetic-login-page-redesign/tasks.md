# Tasks: Split Layout Login Page Redesign (Wave/Gradient Brand Banner + Pill Form Card)

## Phase 1: Desktop Split Layout & Responsive Mobile Container Structure
- [x] `frontend/app/login/page.tsx`: Implement full-viewport grid container (`min-h-screen grid grid-cols-1 md:grid-cols-2`) supporting side-by-side desktop view and stacked mobile view.

## Phase 2: Brand Panel Visuals & SVG Wave Graphic
- [x] `frontend/app/login/page.tsx`: Render UNITEPC purple-to-cyan gradient panel (`from-[#6B3392] to-[#009E96]`), inline SVG wave graphic, UNITEPC logo icon (`GraduationCap`), and academic headline/tagline.

## Phase 3: Scoped Pill Form Controls & Interactive Elements
- [x] `frontend/app/login/page.tsx`: Re-style credential input fields (`email`, `password`) with pill containers (`rounded-full`), embedded left icons (`Mail`, `Lock`), and focus rings (`focus:ring-[#009E96]`).
- [x] `frontend/app/login/page.tsx`: Re-style submission trigger into a full-width pill button (`rounded-full`) with loading spinner state (`Loader2`).

## Phase 4: Auth Flow Integration & Inline Error Presentation
- [x] `frontend/app/login/page.tsx`: Preserve `handleSubmit` integration with `api.auth.login()` and `AuthContext`, and render accessible inline alert banner for authentication error messages.

