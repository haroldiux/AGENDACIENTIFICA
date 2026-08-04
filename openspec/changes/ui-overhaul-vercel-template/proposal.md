<Proposal: ui-overhaul-vercel-template>
## Intent
To completely overhaul the UI/UX of the AGENDA CIENTIFICA system to achieve the Vercel minimal aesthetic. This involves adopting a modern design system foundation using `shadcn/ui`, `geist` fonts, and `next-themes` for robust Light/Dark mode support, while maintaining brand identity by injecting UNITEPC Purple and Cyan.

## Scope
### In Scope
- Installation and configuration of `shadcn/ui` (new-york style), `framer-motion`, `next-themes`, and the `geist` font package.
- Rewriting `globals.css` to adopt shadcn/ui CSS variables.
- Updating `tailwind.config.js` to integrate the UNITEPC colors (Purple and Cyan) as primary and accent theme tokens.
- Replacing raw HTML elements and custom CSS classes in `page.tsx`, `/actividades`, and `/calendario` with `shadcn` components.
- Redesigning `Sidebar.tsx` and layout elements to match the sleek, collapsible premium look.
- Heavily restyling `react-big-calendar` to blend seamlessly with the new aesthetic and theme colors.

### Out of Scope
- Backend API modifications.
- Database schema changes.
- Creation of new pages or routing structures not currently existing.

## Approach
1. **Foundation Setup**: Install `shadcn/ui`, `next-themes`, `framer-motion`, and `geist` fonts. Configure Next.js providers in `app/layout.tsx`.
2. **Theming**: Clear old custom utilities from `globals.css` and inject the UNITEPC brand colors into the shadcn theme variables. Set up `tailwind.config.js` appropriately.
3. **Component Migration**: Iteratively replace native DOM elements (cards, inputs, tables, buttons) across views with their corresponding `shadcn/ui` components.
4. **Calendar Overhaul**: Apply targeted CSS overrides to `react-big-calendar` so its structure, borders, and colors align with the minimal, premium look of the rest of the application.

## Affected Areas
| Area | Impact | Description |
|---|---|---|
| `app/layout.tsx` | High | Needs `ThemeProvider` and font integration. |
| `app/globals.css` | High | Replaced with semantic CSS variables. |
| `tailwind.config.js` | High | Extended for animations, colors, and border radii. |
| Views (e.g., `/actividades`) | High | Migration to component-based UI. |
| `Sidebar.tsx` | High | Visual and structural redesign. |
| `react-big-calendar` | High | Extensive CSS customization required. |

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| `react-big-calendar` styling complexity | High | Use deeply nested, specific CSS overrides to re-theme the calendar without breaking its logic. Test in both Light and Dark modes. |
| Form and layout regressions | Medium | Migrate incrementally. Pair form elements with `react-hook-form` if necessary to ensure stability. |

## Rollback Plan
Revert changes via version control (git) to the commit immediately preceding the UI overhaul. No backend or database changes are involved, ensuring a safe rollback.

## Dependencies
- `shadcn/ui` ecosystem
- `next-themes`
- `framer-motion`
- `geist` font package
- `react-big-calendar`

## Success Criteria
- [ ] `shadcn/ui`, `next-themes`, and `geist` fonts are successfully installed and active.
- [ ] Light and Dark modes can be toggled seamlessly.
- [ ] UNITEPC colors (Purple and Cyan) are correctly applied as the primary and accent tokens.
- [ ] `react-big-calendar` matches the Vercel minimal aesthetic perfectly.
- [ ] Old custom utility classes (e.g., `glass-panel`) are entirely removed from the codebase.
