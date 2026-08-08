# Design: Split Layout Login Page Redesign (Wave/Gradient Brand Banner + Pill Form Card)

## Technical Approach
Redesign `frontend/app/login/page.tsx` to feature a 2-column split-screen layout on desktop (`md:grid-cols-2`) and a stacked banner configuration on mobile. The left panel showcases UNITEPC brand visuals using a vibrant purple-to-cyan gradient (`from-[#6B3392] to-[#009E96]`), brand typography, academic tagline, and dynamic SVG wave curves. The right panel houses the authentication form with rounded pill-shaped inputs (`rounded-full`), embedded Lucide icons (`Mail`, `Lock`), focused ring states (`focus:ring-[#009E96]`), and pill action buttons. All existing `AuthContext` state hooks and `api.auth.login()` logic are strictly preserved.

## Architecture Decisions

### Decision: Self-Contained Responsive Grid Layout
**Choice**: Build the split layout directly within `frontend/app/login/page.tsx` utilizing Tailwind CSS grid utilities (`min-h-screen grid grid-cols-1 md:grid-cols-2`).
**Alternatives considered**: Extracting sub-components (`BrandBanner`, `LoginForm`) or using absolute WebGL canvas backgrounds.
**Rationale**: Keeps login presentation logic cohesive in a single page file, avoids overhead and bundle bloat for single-page visual components, and ensures zero layout shift during responsive viewport resize.

### Decision: Inline SVG Wave Graphic & Brand Gradient
**Choice**: Use an inline SVG wave curve with gradient styling (`bg-gradient-to-br from-[#6B3392] to-[#009E96]`) and subtle opacity overlays.
**Alternatives considered**: Importing external static image assets (.png/.svg).
**Rationale**: Inline SVG renders crisply across high-DPI displays without network request overhead and allows immediate theme customization.

### Decision: Scoped Pill Form Controls
**Choice**: Apply pill styling classes (`rounded-full`, custom padding, icon positioning) directly on elements within `login/page.tsx`.
**Alternatives considered**: Modifying shared UI primitives in `@/components/ui/input.tsx`.
**Rationale**: Avoids global side-effects across other application pages while fully satisfying the login redesign spec.

## Data Flow
1. User enters `email` and `password` credentials in the pill-styled form fields.
2. Form submission triggers `handleSubmit`, activating loading state (`isSubmitting = true`) and clearing prior errors.
3. Invokes `api.auth.login(email, password)`.
4. **Success**: Passes `res.access_token` to `login()` from `AuthContext`, storing session token and navigating to home (`/`).
5. **Failure**: Catches backend error or fallback message ("Credenciales incorrectas..."), populates `error` state, renders accessible inline error alert banner, and resets `isSubmitting = false`.

## File Changes
| File | Action | Description |
| --- | --- | --- |
| `frontend/app/login/page.tsx` | Modify | Implement desktop split panel / mobile header layout, UNITEPC gradient background, inline SVG wave, branded headline, and pill-styled input/button form controls. |

## Interfaces / Contracts
No backend or API contract changes required. The component continues consuming:
- `api.auth.login(email: string, password: string): Promise<{ access_token: string, token_type: string }>`
- `useUser().login(token: string): void`

## Testing Strategy
| Layer | What to Test | Approach |
| --- | --- | --- |
| UI / Responsive | Split-screen desktop vs mobile banner layout | Verify desktop view splits 50/50 and mobile displays compact header with visible form card without vertical clipping. |
| User Interaction | Pill inputs focus, icons, and error banner | Confirm input focus rings (`#009E96`), inline icon alignment, and error banner display on failed login attempt. |
| Auth Flow | Authentication execution and navigation | Submit valid credentials, verify `api.auth.login()` trigger, button loading spinner, and redirect to `/`. |

## Migration / Rollout
No database or backend migrations. The change is isolated to `frontend/app/login/page.tsx`. Revertible via `git checkout HEAD -- frontend/app/login/page.tsx`.

## Open Questions
None.
