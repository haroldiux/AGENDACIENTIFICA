# Technical Design: Advanced Dashboard Analytics & KPI Visualizations

## Technical Approach
The advanced dashboard analytics feature enhances the main dashboard with real-time KPI metrics, execution gauges, monthly timeline distributions, career/faculty breakdowns, and a real-time audit feed. The backend extends `GET /api/v1/dashboard/stats` to support dynamic `gestion_id` and `career_id` query parameters while enforcing role-aware security rules. On the frontend, a modular component hierarchy built with Tailwind CSS and Framer Motion handles client-side state, user filtering, and responsive charts without external charting dependencies.

## Architecture Decisions

### Decision: Role-Aware Aggregated Single-Pass Query
- **Choice**: Extend the single `GET /api/v1/dashboard/stats` endpoint to compute all KPI metrics, status breakdowns, 12-month timelines, career summaries, and audit feeds in one database session call.
- **Alternatives considered**: Multi-endpoint client fetching (e.g., separate calls for KPIs, timeline, audit feed).
- **Rationale**: Reduces network round-trips and ensures consistent transactional state across all dashboard widgets. Restricts departmental roles (`coordinator`, `jefe_investigacion`, `teacher`) to their assigned `user.careers`, enforcing 403 Forbidden on unauthorized `career_id` overrides while allowing global administrative roles unhindered institutional view.

### Decision: Native Lightweight CSS/SVG Visualizations
- **Choice**: Build visual charts (Execution Circular Gauge, Monthly Timeline Bar Chart, Career Breakdown Bars) using native SVG paths, Tailwind CSS, and Framer Motion transitions.
- **Alternatives considered**: Integrating external chart packages such as Recharts or Chart.js.
- **Rationale**: Avoids unnecessary bundle bloat, ensures seamless integration with dark mode/Tailwind design tokens, and simplifies responsive rendering across desktop and mobile screens.

## Data Flow
1. **User Request**: User selects `gestion_id` and/or `career_id` in `DashboardFilters`.
2. **API Call**: `frontend/lib/api.ts` invokes `GET /api/v1/dashboard/stats?gestion_id={id}&career_id={id}`.
3. **Backend Authorization & Scope**: FastAPI validates `get_current_active_user`. If scoped, verifies `career_id` belongs to `user.careers`.
4. **SQL Aggregation**: Query filter applies `gestion_id` and `career_id`. Computes 7-day and 30-day upcoming counts, completion execution rate `(completed / total) * 100` (safely returning `0.0` when total is 0), monthly distribution (1..12), career breakdowns, and top 10 audit logs.
5. **Response Render**: UI receives unified `DashboardAdvancedStats` model and updates KPI cards, gauge, monthly bar chart, career breakdown, and audit activity feed.

## File Changes
| File | Action | Description |
| --- | --- | --- |
| `backend/app/schemas/schemas.py` | Modify | Add Pydantic schemas for `DashboardAdvancedStats`, `MonthlyTimelineItem`, `CareerFacultyBreakdownItem`, and `AuditFeedItem`. |
| `backend/app/api/v1/dashboard.py` | Modify | Implement role validation, query filters for `gestion_id`/`career_id`, 7/30-day metrics, execution rate, timeline aggregation, breakdown by career, and audit feed queries. |
| `frontend/lib/api.ts` | Modify | Add TypeScript interfaces for new dashboard models and update `api.dashboard.stats(filters)` parameters. |
| `frontend/components/dashboard/DashboardFilters.tsx` | Create | Render Gestion and Career dropdown filter toolbar. |
| `frontend/components/dashboard/ExecutionGauge.tsx` | Create | Render SVG circular gauge showing completion percentage. |
| `frontend/components/dashboard/MonthlyTimelineChart.tsx` | Create | Render 12-month bar chart for academic and scientific distribution. |
| `frontend/components/dashboard/CareerFacultyChart.tsx` | Create | Render horizontal bar chart grouped by career and faculty. |
| `frontend/components/dashboard/AuditFeedWidget.tsx` | Create | Render real-time timeline feed of recent audit log activity items. |
| `frontend/app/page.tsx` | Modify | Integrate filter state, load dynamic stats, and display modular widget layout. |

## Interfaces / Contracts
```json
// GET /api/v1/dashboard/stats?gestion_id=1&career_id=2
{
  "active_gestion": { "id": 1, "name": "Gestion 2026" },
  "counts": {
    "total_academic": 45,
    "total_scientific": 20,
    "upcoming_7_days": 3,
    "upcoming_30_days": 8,
    "completed_scientific": 12,
    "completion_rate": 60.0
  },
  "status_breakdown": { "scheduled": 5, "in_progress": 3, "completed": 12, "cancelled": 0 },
  "monthly_timeline": [ { "month": 1, "academic_count": 4, "scientific_count": 2 } ],
  "career_breakdown": [ { "career_id": 2, "career_name": "Sistemas", "faculty": "Ingenieria", "total": 10, "completion_rate": 70.0 } ],
  "recent_audits": [ { "id": 1, "title": "Congreso IA", "user_name": "Juan Perez", "role": "coordinator", "action": "CAMBIO_ESTADO", "timestamp": "2026-08-10T09:00:00" } ],
  "next_events": []
}
```

## Testing Strategy
| Layer | What to Test | Approach |
| --- | --- | --- |
| Backend Unit / Integration | Role authorization & career scoping | Assert HTTP 403 when departmental user passes unauthorized `career_id`. Verify global admin receives cross-career metrics. |
| Backend Aggregation | Execution rate & zero divisional handling | Test stats query when total scientific activities equals 0 to ensure `completion_rate` is `0.0`. |
| Backend Aggregation | Date window filters | Verify `upcoming_7_days` and `upcoming_30_days` include correct activities. |
| Frontend Integration | Filter toolbar state updates | Trigger filter dropdown changes and verify `api.dashboard.stats` receives updated params and re-renders components. |

## Migration / Rollout
No database migrations required. Deployment involves deploying updated backend schemas/endpoints followed by frontend component updates.

## Open Questions
None.
