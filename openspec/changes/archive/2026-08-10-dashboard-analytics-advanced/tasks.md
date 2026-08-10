# Tasks: Dashboard Analytics Advanced

## Phase 1: Backend Data Models & Schemas
- [x] `backend/app/schemas/schemas.py`: Define Pydantic response models for `DashboardAdvancedStats`, `MonthlyTimelineItem`, `CareerFacultyBreakdownItem`, and `AuditFeedItem`.

## Phase 2: Backend API & Service Logic
- [x] `backend/app/api/v1/dashboard.py`: Update `GET /api/v1/dashboard/stats` to accept `gestion_id` and `career_id` query parameters, enforce role-based career scoping (HTTP 403), and aggregate 7/30-day metrics, execution rate, monthly distribution timeline, career breakdowns, and audit activity feed.
- [x] `backend/tests/test_dashboard.py`: Implement automated integration tests for dashboard stats including role authorization, career filtering restrictions, date calculations, and zero division safety.

## Phase 3: Frontend API & Types Integration
- [x] `frontend/lib/api.ts`: Add TypeScript types matching backend response schemas and update `api.dashboard.stats` client method to accept filter parameters.

## Phase 4: Frontend Visualization Components
- [x] `frontend/components/dashboard/DashboardFilters.tsx`: Create interactive filter toolbar component for selecting Gestion and Career.
- [x] `frontend/components/dashboard/ExecutionGauge.tsx`: Create SVG circular gauge component for visual completion rate metric.
- [x] `frontend/components/dashboard/MonthlyTimelineChart.tsx`: Create native CSS/SVG bar chart component for 12-month activity distribution.
- [x] `frontend/components/dashboard/CareerFacultyChart.tsx`: Create horizontal bar chart component for career and faculty breakdown.
- [x] `frontend/components/dashboard/AuditFeedWidget.tsx`: Create real-time activity feed component displaying recent audit log entries.

## Phase 5: Dashboard Page Integration & UI Refactoring
- [x] `frontend/app/page.tsx`: Refactor main dashboard page to manage filter state, fetch updated stats, and render full layout with new visualization widgets.

