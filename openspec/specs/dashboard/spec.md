# Domain: Dashboard & Advanced Analytics

## Purpose
Provide single-pass role-scoped aggregated KPI metrics, distribution timelines, career/faculty breakdowns, execution rate gauges, dynamic gestion/career filtering, and recent audit logs for the main dashboard.

## Requirements

### Requirement: Role-Scoped Single-Pass Analytics Query
The system MUST provide a single-pass endpoint `GET /api/v1/dashboard/stats` accepting optional `gestion_id` and `career_id` query parameters, with metrics automatically scoped according to the authenticated user's role and assigned career privileges.

#### Scenario: Administrative user queries global dashboard stats
- GIVEN an authenticated user with role `admin`, `vicerrectorado`, or `director_investigacion`
- WHEN they request `GET /api/v1/dashboard/stats` without `career_id`
- THEN the system MUST return aggregated metrics across all institutional careers for the active or requested gestión

#### Scenario: Departmental user queried with career restriction
- GIVEN an authenticated user with role `coordinador`, `jefe_investigacion`, or `teacher` assigned to Career A
- WHEN they request `GET /api/v1/dashboard/stats`
- THEN the system MUST restrict all aggregated metrics, breakdowns, and audit items to Career A

#### Scenario: Unauthorized career scoping attempt
- GIVEN an authenticated user with role `coordinador` assigned strictly to Career A
- WHEN they request `GET /api/v1/dashboard/stats` with `career_id` for Career B
- THEN the system MUST reject the request with HTTP status 403 Forbidden

### Requirement: Dynamic KPI Metrics and Completion Execution Rate
The backend MUST calculate and return 7-day upcoming events, 30-day upcoming events, status counts, total academic activities, total scientific activities, completed scientific activities, and completion execution rate percentage.

#### Scenario: Zero scientific activities handled safely
- GIVEN a gestion or career with 0 scientific activities
- WHEN dashboard stats are calculated
- THEN `completion_rate` MUST equal `0.0` without raising division by zero errors

#### Scenario: Upcoming activity window calculations
- GIVEN activities scheduled within 7 days, within 30 days, and past 30 days
- WHEN stats are aggregated for a gestion
- THEN `upcoming_7_days` MUST count activities starting in 0-7 days and `upcoming_30_days` MUST count activities starting in 0-30 days

### Requirement: Monthly Activity Distribution Timeline
The system MUST group academic and scientific activity counts by calendar month within the selected gestion.

#### Scenario: Monthly distribution calculation
- GIVEN activities distributed across months 1 through 12 of a gestion
- WHEN stats are calculated for the gestion
- THEN the response `monthly_timeline` MUST contain 12 items listing monthly academic and scientific activity counts

### Requirement: Career and Faculty Activity Breakdown
The system MUST calculate activity counts and execution rates grouped by career and faculty for administrative views.

#### Scenario: Breakdown calculation for administrative view
- GIVEN activities existing across multiple careers and faculties
- WHEN an administrative user fetches stats without `career_id` filter
- THEN `career_breakdown` MUST include counts and completion rate for each career

### Requirement: Real-time Audit Activity Feed
The backend MUST return a list of recent audit log entries formatted with activity title, user name, role, action, and timestamp.

#### Scenario: Fetching recent audit log feed
- GIVEN recent user actions logged in the system
- WHEN `GET /api/v1/dashboard/stats` is invoked
- THEN `recent_audits` MUST contain up to 10 most recent audit entries matching the requested role and career scope

### Requirement: Interactive Dashboard Filter Toolbar & Responsive Visualizations
The frontend MUST render dynamic filter selectors for Gestion and Career, along with visual cards for execution rate gauge, career/faculty bar distribution, monthly timeline chart, and recent audit activity feed.

#### Scenario: Changing gestion filter updates dashboard visual state
- GIVEN the dashboard page is loaded with initial gestion
- WHEN the user selects a different gestion from the filter dropdown
- THEN the dashboard MUST fetch updated stats from `GET /api/v1/dashboard/stats?gestion_id={selected_id}` and re-render all visual widgets
