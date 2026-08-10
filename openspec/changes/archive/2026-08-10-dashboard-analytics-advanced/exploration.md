# Exploration: Advanced Dashboard Analytics & KPI Visualizations with Role & Career Filtering

## Current State
Currently, the dashboard endpoint `GET /api/v1/dashboard/stats` (`backend/app/api/v1/dashboard.py`) returns minimal static statistics:
- Automatic detection of active gestion based on current date without parameter support.
- Total count of academic and scientific activities without career or gestion filtering support.
- Basic upcoming events count (events ending >= today) without breakdown by timeframe (7 or 30 days).
- Simple status count dictionary (`scheduled`, `in_progress`, `completed`, `cancelled`) for scientific activities.
- Next 5 upcoming scientific events without user role awareness or audit details.

On the frontend (`frontend/app/page.tsx`):
- Simple grid with 3 basic stat cards and a status list.
- Lacks dynamic filter controls for Gestion (2024, 2025, 2026) and Career (Institutional vs Career-scoped view).
- Lacks visual charts (Activities per Career/Faculty breakdown, Monthly Timeline distribution).
- Lacks progress bar / gauge card for institutional execution rate (% completadas).
- Lacks a Recent Audit & Activity Feed widget displaying real-time updates and user attributions.

## Affected Areas
- `backend/app/api/v1/dashboard.py` — Update `get_dashboard_stats` to accept `gestion_id` and `career_id` query parameters, enforce user role permissions via `get_current_active_user`, calculate 7/30-day upcoming metrics, monthly timeline distribution, career/faculty breakdowns, execution rate, and fetch recent audit logs.
- `backend/app/schemas/schemas.py` — Add Pydantic response schemas for advanced dashboard analytics (`DashboardStatsResponse`, `CareerBreakdownItem`, `FacultyBreakdownItem`, `MonthlyTimelineItem`, `DashboardAuditItem`).
- `frontend/lib/api.ts` — Update `DashboardStats` TypeScript interface and `api.dashboard.stats(params)` method to support query filters.
- `frontend/app/page.tsx` — Redesign main dashboard layout with dynamic Gestion & Career filter bars, KPI stat cards, interactive charts (Career/Faculty distribution, Monthly timeline), Execution Gauge Card, and Recent Audit Activity Feed widget.
- `frontend/components/dashboard/` — Create modular UI components for dashboard widgets (`DashboardFilters.tsx`, `KpiStatCards.tsx`, `ExecutionGauge.tsx`, `CareerFacultyChart.tsx`, `MonthlyTimelineChart.tsx`, `AuditFeedWidget.tsx`).

## Approaches

1. **Approach 1: Unified Backend Analytics Aggregation & Custom Responsive Visual Components (Recommended)**
   - **Backend**: Extend `dashboard.py` to calculate all aggregated analytics in a single optimized DB query pass (using SQLAlchemy `func.count`, date range filters, and `group_by`).
   - **Frontend**: Build responsive, lightweight SVG/HTML visual widgets (Bar distribution, Monthly timeline bar chart, and Circular Progress Gauge) using Tailwind CSS and Framer Motion without adding heavy external chart libraries.
   - **Pros**: Zero third-party JS bundle bloat, fast load times, pixel-perfect theme consistency with existing Tailwind CSS dark/light design system, total control over layout and micro-interactions.
   - **Cons**: Requires custom responsive bar and gauge UI components.
   - **Effort**: Medium.

2. **Approach 2: Multiple Fragmented Backend Endpoints & Recharts Library**
   - **Backend**: Create separate endpoints (`/dashboard/stats`, `/dashboard/charts/career`, `/dashboard/charts/timeline`, `/dashboard/audits`).
   - **Frontend**: Install `recharts` package and render standard chart components.
   - **Pros**: Standardized chart components out of the box.
   - **Cons**: Increases frontend bundle size (~400KB), adds multiple HTTP requests on dashboard load causing potential waterfall latency, extra dependency maintenance.
   - **Effort**: High.

## Recommendation
**Approach 1** is strongly recommended. Aggregating the dashboard metrics cleanly in `backend/app/api/v1/dashboard.py` with Pydantic validation guarantees fast single-roundtrip responses. Building clean, responsive UI widgets with Tailwind CSS and Framer Motion ensures native design system harmony, high performance, and seamless mobile responsiveness.

## Key Technical Specifications & Data Models

### 1. Enhanced Dashboard Stats Schema (`DashboardStatsResponse`)
```python
class DashboardAuditItem(BaseModel):
    id: int
    activity_id: int
    activity_title: str
    user_name: str
    user_role: str
    action: str
    description: str
    timestamp: datetime

class CareerBreakdownItem(BaseModel):
    career_id: int
    career_name: str
    faculty: str
    academic_count: int
    scientific_count: int
    completed_count: int
    execution_rate: float

class MonthlyTimelineItem(BaseModel):
    month_num: int
    month_name: str
    academic_count: int
    scientific_count: int

class DashboardStatsResponse(BaseModel):
    selected_gestion: Optional[GestionResponse] = None
    selected_career_id: Optional[int] = None
    total_activities: int
    total_academic: int
    total_scientific: int
    completed_scientific: int
    completion_rate: float
    upcoming_7_days: int
    upcoming_30_days: int
    status_breakdown: Dict[str, int]
    career_breakdown: List[CareerBreakdownItem]
    monthly_timeline: List[MonthlyTimelineItem]
    recent_audits: List[DashboardAuditItem]
    next_events: List[MergedCalendarItem]
```

### 2. Role-Aware Filtering Matrix
- `super_admin`, `admin`, `vicerrectorado`, `director_investigacion`:
  - Default view: All careers (Global Institutional View).
  - Selectable filters: Any specific Gestion and any specific Career.
- `coordinator`, `jefe_investigacion`, `teacher`:
  - Default view: Restricted to user's assigned careers (`user.careers`).
  - Selectable filters: Only careers assigned to the user profile.

## Risks
- **SQL Performance on Timeline Aggregation**: Grouping by month across large activity datasets can cause slow queries if indices on `start_date` / `gestion_id` / `career_id` are missing. *Mitigation: Use indexed `gestion_id` and `start_date` filters in SQLAlchemy query.*
- **Null Safety in Breakdown Calculations**: Division by zero when `total_scientific = 0` during completion rate calculation. *Mitigation: Guard with explicit `total > 0 ? (completed / total) * 100 : 0` check.*

## Ready for Proposal
Yes — Ready for `sdd-propose`. The exploration is complete with defined backend schema extensions, UI component layout, role-based filtering logic, and visualization specifications.
