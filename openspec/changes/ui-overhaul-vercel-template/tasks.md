## Phase 1: Foundation & Theming
- [x] `frontend/package.json`: Install dependencies (`next-themes`, `framer-motion`, `geist`, `lucide-react`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, etc.).
- [x] `frontend/components.json`: Initialize `shadcn/ui` configuration.
- [x] `frontend/tailwind.config.js`: Update to include `tailwindcss-animate` and add `shadcn` theme extensions (colors, borderRadius, animations).
- [x] `frontend/app/globals.css`: Replace existing custom CSS (e.g., `.glass-panel`) with `shadcn/ui` color variables (using UNITEPC Purple/Cyan for primary/accent) and base layers.
- [x] `frontend/app/layout.tsx`: Wrap children in `ThemeProvider`, import and apply `GeistSans` font class.

## Phase 2: Core Layout
- [x] `frontend/components/layout/Sidebar.tsx`: Refactor to use `framer-motion` for collapsing, use semantic Tailwind classes instead of `.sidebar`, update brand layout.

## Phase 3: Calendar Overhaul
- [x] `frontend/app/calendario/page.tsx`: Replace native buttons, inputs, and wrappers with `shadcn/ui` components (`Button`, `Card`, etc.).
- [x] `frontend/components/calendar/CalendarView.tsx`: Update to use `shadcn/ui` components (e.g., `Dialog` for events) and refine `.rbc-*` CSS overrides for the calendar.

## Phase 4: Activities Migration
- [x] `frontend/app/actividades/page.tsx`: Migrate native elements to `Card`, `Table`, `Badge`, `Button` from `shadcn/ui`.
