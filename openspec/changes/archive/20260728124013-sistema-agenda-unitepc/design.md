# Technical Design: Sistema Agenda UNITEPC

## 1. Technical Strategy
The system aims to replace static, image-based academic calendars with a dynamic, digital platform that merges the university's academic events with scientific research activities. The core strategy relies on decoupling the underlying data structure from the visual representation. This approach will allow importing of legacy calendars while simultaneously supporting robust CRUD, tracking, and reporting capabilities for research events. The architectural design centers around a headless API approach (FastAPI) and a modern frontend application (Next.js), orchestrated in a monorepo setup.

## 2. Architecture Decisions
- **Frontend**: **Next.js 14+ (App Router)** for building an interactive, responsive calendar interface and dashboards. It uses **Tailwind CSS** and **shadcn/ui** for UI components.
- **Backend API**: **FastAPI (Python 3.12+)** to handle data ingestion, fusion engine queries, tracking, and report triggering.
- **Database**: **PostgreSQL 16**. It is chosen to take advantage of native date-range (`daterange`) types to optimize overlap queries between events.
- **Background Processing**: **Celery** + **Redis** to offload report generation (PDF, Excel) and potential future OCR tasks.
- **Containerization & Orchestration**: **Docker Compose v2** for consistent development and production environments.
- **Reverse Proxy**: **Nginx** will route traffic, serve static assets, and handle SSL termination.
- **CI/CD**: **Jenkins** pipeline (`Jenkinsfile`) for automated testing, Alembic migrations, and multi-stage deployment (Staging -> Production).

## 3. Data Flow
1. **Ingestion & Creation**: 
   - Coordinators upload academic templates via Next.js UI.
   - Research Dept users create scientific activities.
   - The FastAPI backend validates payloads via Pydantic and stores them in PostgreSQL using SQLAlchemy.
2. **Fusion & Presentation**:
   - The Next.js frontend queries the FastAPI fusion endpoint (filtering by career and `gestión`).
   - The FastAPI endpoint leverages PostgreSQL `daterange` to rapidly find overlaps and merges both academic and scientific activities, resolving visual markers.
3. **Tracking & Reporting**:
   - Status updates (Planned, Completed) and evidence URLs are submitted to FastAPI.
   - When a user requests a report, FastAPI queues a task in Celery (via Redis).
   - The Celery worker processes the data, generates the PDF/Excel, and saves the artifact. The user retrieves the report once completed.

## 4. Monorepo File Layout
```text
unitepc-calendario/
├── frontend/                 # Next.js 14+ (App Router, React, TypeScript)
│   ├── app/                  # Pages: /calendario, /importar, /actividades, /reportes
│   ├── components/           # shadcn/ui and custom components
│   └── package.json
├── backend/                  # FastAPI (Python 3.12+)
│   ├── app/
│   │   ├── api/v1/           # Routers (auth, carreras, actividades, fusion, reportes)
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic (Fusion engine, Reporting)
│   │   └── workers/          # Celery tasks
│   ├── alembic/              # Database migrations
│   ├── pyproject.toml
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docs/                     # Documentation and specs
├── docker-compose.yml        # Local development setup
├── docker-compose.prod.yml   # Production overrides
└── Jenkinsfile               # CI/CD pipeline definition
```

## 5. API Endpoints & Schemas
**Key Pydantic Schemas:**
- `ActivityBase`: Title, Start Date, End Date, Category.
- `AcademicActivityCreate`: Inherits `ActivityBase`, adds `career_id`.
- `ScientificActivityCreate`: Inherits `ActivityBase`, adds `responsible_id`, `status`.
- `MergedCalendarResponse`: List of combined activities with a `type` flag (academic vs. scientific).

**Key Endpoints (`/api/v1`):**
- `POST /auth/login`: JWT generation.
- `GET /fusion`: Returns the merged calendar. Accepts query params `career_id`, `gestion_id`, `start_date`, `end_date`.
- `POST /academic/import`: Accepts file upload (CSV/Excel) for batch import.
- `POST /scientific`, `PUT /scientific/{id}`, `DELETE /scientific/{id}`: CRUD for research activities.
- `PUT /scientific/{id}/status`: Update status and add evidence link.
- `POST /reports/generate`: Queues a Celery task and returns a `task_id`.
- `GET /reports/{task_id}/download`: Retrieves the generated PDF/Excel.

**Database Models (SQLAlchemy):**
- `User` (id, roles)
- `Career` (id, name, department)
- `Gestion` (id, name, date_range)
- `AcademicActivity` (id, career_id, daterange, type, title)
- `ScientificActivity` (id, career_id, daterange, type, title, status, evidence_url, responsible_id)

## 6. Testing & Rollout Strategy
**Testing:**
- **Backend**: `pytest` for unit testing models and schemas, and integration testing API endpoints against a test PostgreSQL instance.
- **Frontend**: ESLint, TypeScript type checking, and component testing (Vitest/Playwright).
- **CI**: Jenkins runs the test suite on every PR/push to `main` and `develop`.

**Rollout:**
1. **Pilot Phase**: Deploy to a Staging environment (triggered by `develop` branch) targeting a single career (e.g., Medicine, Gestión II-2025).
2. **Feedback & Adjustment**: Incorporate feedback from the Research Dept and Academic Secretariat.
3. **Production Deployment**: Triggered manually in Jenkins on the `main` branch. 
4. **Rollback Plan**: Rely on Docker image tagging to revert containers and `alembic downgrade` (or database restores) for DB schema regressions.
