<Proposal: Advanced Dashboard Analytics & KPI Visualizations>
## Intent
Enhance the main dashboard with advanced KPI analytics, dynamic Gestion and Career filters, completion execution metrics, monthly activity distribution charts, and real-time audit logging feed.

## Scope
### In Scope
- Single-pass backend aggregated stats endpoint supporting `gestion_id` and `career_id` query parameters with role-aware scoping.
- Pydantic response schemas for KPI counts (7/30-day upcoming, execution rate), monthly timeline distribution, career/faculty breakdowns, and audit feed items.
- Dynamic frontend filter toolbar (Gestion and Career selectors).
- Lightweight Tailwind/Framer Motion visual components (Execution Circular Gauge, Career/Faculty Bar Breakdown, Monthly Timeline Chart, Audit Activity Feed).

### Out of Scope
- External chart library dependencies (e.g. Recharts).
- Data export features (PDF/Excel generation).
- Modifications to core event creation/editing workflows.

## Approach
Extend `GET /api/v1/dashboard/stats` in `backend/app/api/v1/dashboard.py` to aggregate statistics via optimized SQLAlchemy queries based on role-aware permissions. On the frontend, replace the static grid in `frontend/app/page.tsx` with modular React components (`DashboardFilters`, `KpiStatCards`, `ExecutionGauge`, `CareerFacultyChart`, `MonthlyTimelineChart`, `AuditFeedWidget`).

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `backend/app/api/v1/dashboard.py` | High | Add query params, role-based filtering, and aggregated analytics calculations. |
| `backend/app/schemas/schemas.py` | Medium | Add Pydantic response models for dashboard metrics, breakdowns, and audit items. |
| `frontend/lib/api.ts` | Medium | Update TypeScript types and API client method to accept filter parameters. |
| `frontend/app/page.tsx` | High | Redesign dashboard layout to render dynamic filters and new KPI widgets. |
| `frontend/components/dashboard/` | High | Create modular visual widget components using Tailwind CSS and Framer Motion. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Timeline aggregation query latency | Low | Filter by indexed `gestion_id` and `start_date` attributes. |
| Division by zero in execution rate | Medium | Add explicit zero-checks before calculating execution percentages. |

## Rollback Plan
Revert changes to `dashboard.py`, `schemas.py`, `api.ts`, and `page.tsx` via git revert. No database schema migrations are introduced, so database rollback is unnecessary.

## Dependencies
Existing database tables (`AcademicActivity`, `ScientificActivity`, `Gestion`, `Career`, `AuditLog`) and user authentication middleware (`get_current_active_user`).

## Success Criteria
- [ ] `GET /api/v1/dashboard/stats` accepts `gestion_id` and `career_id` and returns full KPI response schema.
- [ ] Users with coordinator or teacher roles are restricted to viewing their assigned careers.
- [ ] Dashboard UI correctly updates statistics and visual charts when changing Gestion or Career filters.
- [ ] Execution rate gauge and monthly distribution timeline render cleanly across all screen sizes.
