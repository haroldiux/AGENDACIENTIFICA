# Exploration: Split Layout Login Page Redesign (Wave/Gradient Brand Banner + Pill Form Card)

## Current State
The existing login page (`frontend/app/login/page.tsx`) relies on a basic centered single-card layout (`max-w-md`). It contains standard text inputs, a rectangular card wrapper, basic submit button, error alert banner, and integration with `AuthContext` (`login()`) and `api.auth.login()`.
While functional, the page lacks visual distinction, brand identity (UNITEPC gradient wave graphics), desktop split-screen layout ergonomics, and modern pill-shaped control aesthetics.

## Affected Areas
- `frontend/app/login/page.tsx` — Complete UI redesign: Desktop split panel layout, mobile top banner layout, UNITEPC gradient wave brand section, rounded pill inputs (`rounded-full`), pill action button, smooth `router.push('/')` redirect on login success, and inline error banner.
- `frontend/app/globals.css` — Support for custom gradient utilities or wave animations if needed, maintaining existing UNITEPC dark theme color variables (`#6B3392` purple, `#009E96` cyan, dark background).

## Approaches

1. **Tailwind SVG Wave & Responsive Split-Screen Layout (Recommended)**
   - **Layout**:
     - Desktop (`md:grid md:grid-cols-2` or `lg:grid-cols-12`): Left panel (5 cols or 50% width) features a fluid UNITEPC brand banner with deep purple/cyan gradients (`from-[#6B3392] via-[#4A1D6D] to-[#009E96]`), stylized SVG wave curves, UNITEPC logo, title, and academic tagline. Right panel features the clean login card.
     - Mobile: Top fluid header banner with integrated brand elements and wave curve separator, with the login form card positioned neatly underneath.
   - **Controls & Aesthetics**: Rounded pill input fields (`rounded-full`) with embedded left icons (`Mail`, `Lock`), focus ring highlights (`focus:ring-[#009E96]`), pill submit button (`rounded-full bg-gradient-to-r from-[#6B3392] to-[#009E96]`), loading spinner (`Loader2`), and styled error notification banner.
   - **Behavior**: Preserves exact auth API contract (`api.auth.login`), updates `AuthContext` state via `login()`, and triggers immediate client-side navigation (`router.push('/')`).
   - **Pros**: High visual quality, 100% responsive, fast rendering with pure Tailwind CSS & inline SVG, zero third-party dynamic canvas overhead.
   - **Cons**: Requires careful breakpoint testing to guarantee layout alignment on smaller laptop screens.
   - **Effort**: Low-Medium.

2. **WebGL / Canvas Animated Dynamic Wave Grid**
   - **Layout**: Canvas background in left panel rendering dynamic fluid particles.
   - **Pros**: Highly interactive dynamic visual effects.
   - **Cons**: Adds bundle size, higher CPU usage, potential lag on mobile devices.
   - **Effort**: High.

## Recommendation
Proceed with **Approach 1 (Tailwind SVG Wave & Responsive Split-Screen Layout)**. It satisfies all user aesthetic and functional requirements, introducing a branded UNITEPC split layout with wave visuals and pill inputs while remaining lightweight and fully performant.

## Risks
- **Contrast & Accessibility**: Ensuring `rounded-full` pill inputs maintain strong border contrast and clear focus indicators across theme tokens.
- **Mobile Viewport Height**: Ensuring top brand banner scales down gracefully on small mobile viewports so the login form card is immediately visible without awkward scrolling.

## Ready for Proposal
Yes — requirements, affected files, design specifications, and implementation details are fully identified and ready for proposal.
