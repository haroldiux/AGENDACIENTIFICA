# Implementation Task Checklist: Sistema Agenda UNITEPC

## Phase 1: Monorepo & Base Infrastructure
- [x] Initialize monorepo folder structure (`/frontend`, `/backend`, `/nginx`, `/docs`).
- [x] Setup Docker Compose v2 for local development (`docker-compose.yml`) including services for frontend, backend, worker, db, redis, and nginx.
- [x] Create Production overrides (`docker-compose.prod.yml`) and staging setup.
- [x] Configure Nginx (`nginx/nginx.conf`) for routing traffic and SSL termination.
- [x] Create declarative Jenkins pipeline (`Jenkinsfile`) with stages: Build, Test, Migrate, Push, Deploy Staging, Deploy Producción.

## Phase 2: Database & Backend Setup
- [x] Initialize FastAPI application and core configuration (Python 3.12+).
- [x] Configure PostgreSQL 16 connection and environment variables.
- [x] Define SQLAlchemy 2.0 models: `User`, `Career`, `Gestion`, `AcademicActivity`, `ScientificActivity`.
- [x] Setup Alembic for database migrations and generate initial schema.
- [x] Implement Authentication and JWT token generation (`/auth/login`).

## Phase 3: Academic & Scientific Event CRUD
- [x] Define Pydantic schemas (`ActivityBase`, `AcademicActivityCreate`, `ScientificActivityCreate`).
- [x] Implement CRUD API endpoints for careers and gestiones.
- [x] Implement CRUD API endpoints for academic activities.
- [x] Implement CRUD API endpoints for scientific activities (including status and evidence update).

## Phase 4: Fusion Engine API
- [x] Implement the `/fusion` endpoint in FastAPI.
- [x] Utilize PostgreSQL `daterange` functionality for date-range overlap queries.
- [x] Add query filtering support (`career_id`, `gestion_id`, `start_date`, `end_date`).
- [x] Format `MergedCalendarResponse` combining both academic and scientific activities with type flags.

## Phase 5: Frontend Development
- [x] Initialize Next.js 14+ (App Router) project with TypeScript.
- [x] Setup Tailwind CSS and shadcn/ui.
- [x] Build Calendar UI (monthly, list views) with visual differentiation (colors/icons) for academic vs scientific activities.
- [x] Implement Import panel for uploading and parsing the academic calendar.
- [x] Build forms and panels for managing scientific activities and tracking their status.
- [x] Integrate frontend views with the FastAPI backend (Auth, CRUD, Fusion).

## Phase 6: Tracking & Background Reports
- [x] Setup Celery worker and Redis queue for background tasks.
- [x] Implement tracking and status updates logic for scientific activities.
- [x] Create background tasks for report generation (PDF and Excel) considering `hybrid` artifact store mode.
- [x] Implement API endpoints to trigger report generation (`/reports/generate`) and download (`/reports/{task_id}/download`).

## Phase 7: Testing & CI/CD Pipeline Execution
- [x] Write unit and integration tests for backend using `pytest`.
- [x] Implement frontend testing, linting (`eslint`), and TypeScript type-checking.
- [x] Execute Jenkins pipeline to ensure Build, Test, and Push stages pass.
- [x] Perform Staging deploy via Jenkins.
- [x] Validate system functionality in staging and prepare for production approval.
