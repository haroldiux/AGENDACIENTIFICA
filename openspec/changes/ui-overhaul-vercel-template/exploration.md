## Exploration: UI/UX Overhaul using Vercel Community Agent Template
### Current State
The system currently uses Next.js 14.2.3 and Tailwind CSS with a rudimentary dark theme (relying on `text-slate-100` and arbitrary utility classes like `glass-panel` or `stat-card`). It lacks a formal design system or component library, relying on raw HTML elements and direct Tailwind classes for styling lists, tables, and buttons. Layout is a simple Flexbox sidebar and main content area.

### Affected Areas
- `frontend/app/layout.tsx` — Needs global providers (`ThemeProvider`, `TooltipProvider`) and `geist` fonts.
- `frontend/app/globals.css` — Must be rewritten to include shadcn/ui CSS variables and clear out old custom utility classes.
- `frontend/tailwind.config.js` — Needs the full shadcn/ui theme configuration (colors, border radius, animations).
- `frontend/app/page.tsx` (and other views like `/actividades`, `/calendario`) — Custom UI elements (cards, tables, badges) must be migrated to shadcn components.
- `frontend/components/layout/Sidebar.tsx` — Requires a visual and structural redesign to match the sleek, premium aesthetic (e.g., collapsable with tooltips).

### Approaches
1. **Complete shadcn/ui Migration (Recommended)** — Initialize shadcn/ui (new-york style), replace custom CSS classes with semantic variables, and swap raw HTML elements with shadcn components.
   - Pros: Closest match to the Vercel template aesthetic; highly maintainable; huge ecosystem of pre-built components.
   - Cons: Requires touching almost every existing UI file to swap out classes and DOM structure.
   - Effort: High
2. **Partial CSS Variable Adaptation** — Update `globals.css` to use the Vercel template colors and fonts, but keep the existing raw DOM elements (just modifying their classes).
   - Pros: Faster to implement.
   - Cons: Misses out on accessible, premium component behaviors (like dropdowns, tooltips, dialogs); harder to maintain the "premium" feel over time.
   - Effort: Medium

### Recommendation
**Complete shadcn/ui Migration**. To truly achieve the premium chat/agent template aesthetic, the application needs the structural foundation of a design system. Integrating `shadcn/ui` with the "new-york" style, implementing `next-themes` for proper dark/light modes, and using `geist` typography will fundamentally elevate the application's look and feel to match the Vercel standard.

### Risks
- `react-big-calendar` relies on its own CSS. Overriding its styles to match the new shadcn theme (colors, fonts, borders) could be tedious and prone to visual bugs.
- Rapid migration of form elements (inputs, dropzones) might temporarily break validation or layout if not paired with `react-hook-form`.

### Ready for Proposal
Yes — the orchestrator should tell the user that we will implement the Vercel template aesthetic by adopting `shadcn/ui`, `geist` fonts, and `next-themes`, requiring a structural update to the global layout and existing views.
