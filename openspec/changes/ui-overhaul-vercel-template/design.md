<Design: ui-overhaul-vercel-template>
## Technical Approach
The UI overhaul will transition the AGENDA CIENTIFICA frontend to a modern, Vercel-like minimal aesthetic. This involves adopting `shadcn/ui` as the core component library, `next-themes` for robust Light/Dark mode toggling, `geist` for typography, and `framer-motion` for fluid animations. We will remove custom CSS classes like `.glass-panel` and rely entirely on Tailwind CSS utility classes and `shadcn/ui` semantic CSS variables.

## Architecture Decisions
### Decision: Component Library
**Choice**: `shadcn/ui` (new-york style)
**Alternatives considered**: Chakra UI, MUI, Radix Primitives directly.
**Rationale**: `shadcn/ui` provides unstyled, accessible Radix primitives styled with Tailwind CSS. It is highly customizable, avoiding the bloat of traditional component libraries, and perfectly aligns with the targeted minimal aesthetic.

### Decision: Theming & Typography
**Choice**: `next-themes` and `geist` font.
**Alternatives considered**: Custom React Context for themes, Inter font.
**Rationale**: `next-themes` handles system preferences and hydration mismatch seamlessly. `geist` is the font designed by Vercel for this exact minimal aesthetic.

### Decision: State & Animation
**Choice**: `framer-motion`
**Alternatives considered**: React Spring, CSS transitions.
**Rationale**: Provides simple and declarative API for complex layout animations (like collapsing the Sidebar) without polluting component logic.

## Data Flow
- **Theme Preference**: Managed by `next-themes` `ThemeProvider` injected in `app/layout.tsx`. Changes persist in `localStorage`.
- **UI State**: Sidebar toggle state and modal interactions will use local React state (`useState`), potentially combined with `framer-motion`'s `AnimatePresence`.

## File Changes
| File | Action | Description |
|---|---|---|
| `frontend/app/layout.tsx` | Modify | Wrap children in `ThemeProvider`, import and apply `GeistSans` font class. |
| `frontend/app/globals.css` | Modify | Replace existing custom CSS (e.g., `.glass-panel`) with `shadcn/ui` color variables (using UNITEPC Purple/Cyan for primary/accent) and base layers. |
| `frontend/tailwind.config.js` | Modify | Update to include `tailwindcss-animate`, add `shadcn` theme extensions (colors, borderRadius, animations). |
| `frontend/components/layout/Sidebar.tsx` | Modify | Refactor to use `framer-motion` for collapsing, use semantic Tailwind classes instead of `.sidebar`, update brand layout. |
| `frontend/app/calendario/page.tsx` | Modify | Replace native buttons, inputs, and wrappers with `shadcn/ui` components (`Button`, `Card`, etc.). |
| `frontend/components/calendar/CalendarView.tsx` | Modify | Update to use `shadcn/ui` components (e.g., `Dialog` for events) and refine `.rbc-*` CSS overrides for the calendar. |
| `frontend/app/actividades/page.tsx` | Modify | Migrate native elements to `Card`, `Table`, `Badge`, `Button` from `shadcn/ui`. |

## Interfaces / Contracts
- `shadcn/ui` will dictate the styling contract through its CSS variables (`--background`, `--foreground`, `--primary`, etc.).
- UNITEPC Brand Colors:
  - **Primary**: UNITEPC Purple (mapped to `--primary`)
  - **Accent**: UNITEPC Cyan (mapped to `--accent` or secondary elements)

## Testing Strategy
| Layer | What to Test | Approach |
|---|---|---|
| Visual/E2E | Light/Dark mode toggling | Cypress or Playwright to ensure body classes and local storage update correctly. |
| Component | Sidebar collapsing | React Testing Library or visual regression testing to ensure `framer-motion` animations trigger without layout breakage. |
| Integration | Component Migration | Ensure form elements and buttons (now `shadcn`) correctly pass `onChange` and `onClick` handlers. |

## Migration / Rollout
1. **Foundation**: Install dependencies (`shadcn-ui`, `next-themes`, `framer-motion`, `geist`). Initialize `shadcn/ui` config.
2. **Theming**: Rewrite `globals.css` and `tailwind.config.js`. Implement `ThemeProvider`.
3. **Core Layout**: Redesign `Sidebar.tsx` and standard wrappers (using `Card`, etc.).
4. **Calendar Overhaul**: Refactor `react-big-calendar` CSS classes.
5. **Progressive Rollout**: Migrate individual views (`/actividades`, `/calendario`) iteratively.

## Open Questions
- Do we need a global state (e.g., Zustand) for the Sidebar expanded/collapsed state if it affects sibling layout metrics heavily?
- What are the exact HSL values for UNITEPC Purple and Cyan for both Light and Dark modes to ensure accessible contrast?
</Design: ui-overhaul-vercel-template>
