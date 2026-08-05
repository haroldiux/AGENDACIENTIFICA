<Verification: ui-overhaul-vercel-template>
## Verification Steps Performed
- [x] Ran backend unit tests (Not applicable - UI only change)
- [x] Ran frontend typescript checks (`npx tsc --noEmit`) - Identified missing modules and TS typings mismatches.
- [x] Ran frontend linting (`npm run lint`) - Passed with 0 errors after fixes.
- [x] Verified `shadcn/ui` components imported in the pages actually exist and resolve properly.

## Issues Found & Fixed
- **Missing Dependencies**: Installed `geist`, `framer-motion`, `next-themes` as they were missing and causing resolution errors in `Sidebar.tsx`, `layout.tsx`, and `theme-provider.tsx`.
- **Corrupted Layout**: Restored `frontend/app/layout.tsx` which had a syntax error/corrupted template and was missing the `GeistSans` import from `geist/font/sans`.
- **Theme Provider Types**: Fixed `components/theme-provider.tsx` to import `ThemeProviderProps` directly from `next-themes` rather than `next-themes/dist/types` which caused resolution errors.
- **Button asChild Error**: Fixed an issue in `frontend/app/actividades/page.tsx` where `asChild` was used on a `@base-ui/react/button`. Wrapped the `Button` with the `Link` element instead.
- **Select Null Inference**: Fixed a type inference mismatch (`string | null` vs `string`) in `frontend/components/calendar/CalendarView.tsx` where `onValueChange` returned `val` that wasn't safely checked before passing it to `onStatusChange`.

## Final Status
OK

</Verification: ui-overhaul-vercel-template>
