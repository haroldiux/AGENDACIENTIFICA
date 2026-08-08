# Proposal: Split Layout Login Page Redesign (Wave/Gradient Brand Banner + Pill Form Card)

## Intent
Redesign the frontend login page (`frontend/app/login/page.tsx`) from a basic centered card into a modern, desktop split-screen / responsive mobile layout featuring UNITEPC brand visuals (purple-to-cyan gradient, SVG wave curves) and pill-shaped form controls while preserving existing authentication flow and state integration.

## Scope
### In Scope
- **Split Panel Layout**: Left brand panel with UNITEPC gradient (`#6B3392` purple to `#009E96` cyan), SVG wave graphic, UNITEPC logo, title, and academic tagline for desktop (`md:grid-cols-2`); responsive top banner for mobile.
- **Pill Form Controls**: Rounded pill input fields (`rounded-full`) with embedded left icons (`Mail`, `Lock`), focus ring highlights, pill action button (`rounded-full`), loading spinner, and inline error banner.
- **Auth Integration**: Preserve existing `AuthContext` integration (`login()`), `api.auth.login()` payload execution, and client-side navigation (`router.push('/')`) upon successful login.

### Out of Scope
- Backend API authentication endpoint or database schema changes.
- Complex WebGL/canvas animations or third-party graphic renderer dependencies.
- Changes to user registration, password recovery, or multi-tenant SSO auth modules.

## Approach
Implement a pure Tailwind CSS + SVG wave split layout in `frontend/app/login/page.tsx`. Use standard Lucide React icons (`Mail`, `Lock`, `Loader2`), rounded pill containers (`rounded-full`), and high-contrast text tokens. Maintain seamless integration with `AuthContext` and `api.auth.login()`.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `frontend/app/login/page.tsx` | High | Complete visual redesign with desktop split panel, mobile top banner, wave graphics, and pill input elements. |
| `frontend/app/globals.css` | Low | Optional helper styles or background gradient utilities if needed. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Contrast & Accessibility | Low | Ensure input borders, focus rings (`focus:ring-[#009E96]`), and text colors meet WCAG AA standards. |
| Mobile Viewport Overflow | Low | Scale header height on small screens so login form card remains immediately visible without vertical clipping. |

## Rollback Plan
Revert `frontend/app/login/page.tsx` and `frontend/app/globals.css` to their prior git commit state (`git checkout HEAD -- frontend/app/login/page.tsx frontend/app/globals.css`).

## Dependencies
- Tailwind CSS & Lucide React (`lucide-react`) icons.
- Next.js Router (`next/navigation`) & `AuthContext`.

## Success Criteria
- [ ] Login page displays brand panel with gradient wave graphic and pill-styled form inputs.
- [ ] Desktop layout uses responsive split-screen grid (`md:grid-cols-2`); mobile layout displays top brand header.
- [ ] Authentication via `api.auth.login()` succeeds and redirects to `/`.
- [ ] Input validation and inline error display function smoothly.
