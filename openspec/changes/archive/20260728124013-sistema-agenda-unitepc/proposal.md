# Change Proposal: Sistema Agenda UNITEPC

## Intent
Build a digital platform to manage, merge, and track the academic calendar and scientific research activities for Universidad Técnica Privada Cosmos (UNITEPC). The system will separate structured event data from visual presentation, providing a clear, interactive calendar and enabling automated follow-up and reporting for scientific research activities.

## Scope

**In Scope:**
- Interactive visual merged calendar (academic and scientific).
- Academic calendar module (structured data manual entry/import).
- Scientific calendar module (CRUD operations by career/department).
- Research activity tracking (status, responsible person, evidence).
- Reporting module (PDF/Excel exports).
- User and role management (Admin, Research Dept, Coordinators, Read-only).

**Out of Scope:**
- Integration with the university's student grading/enrollment systems.
- Native mobile application (web responsiveness is prioritized).
- Invoicing, billing, or research budget management.

## Approach
- **Frontend**: Next.js 14+ (App Router, React, TypeScript) with Tailwind CSS and shadcn/ui for building an accessible, responsive, and fast UI.
- **Backend**: FastAPI (Python 3.12+) leveraging Pydantic and SQLAlchemy 2.0 (with Alembic) for high-performance async API endpoints.
- **Database**: PostgreSQL 16 to utilize native date-range (`daterange`) features for event overlap queries.
- **Background Processing**: Celery + Redis for async tasks such as report generation (PDF/Excel) and future OCR capabilities without blocking the main API.
- **Reverse Proxy**: Nginx to route traffic between the frontend and backend, serving as the entry point and handling SSL termination.
- **Orchestration**: Docker Compose v2 for local and production environment parity.
- **CI/CD**: Jenkins declarative pipeline (`Jenkinsfile`) for automated building, testing, database migrations, and deployments.

## Affected Areas
- New monorepo creation (`/frontend`, `/backend`, `/nginx`, `/docs`).
- Infrastructure configuration (`docker-compose.yml`, `docker-compose.prod.yml`, `Jenkinsfile`).
- Database schema and migrations (`alembic/`).

## Risks & Mitigation
- **Non-Standard Imports**: Academic calendars provided as images/PDFs with inconsistent formats.
  *Mitigation*: Define a standard data format (e.g., Excel template) and implement OCR with human review in later phases.
- **User Resistance**: Coordinators hesitant to adopt a new platform.
  *Mitigation*: Roll out via a pilot program (e.g., Medicine department) before scaling; provide brief training sessions.
- **Information Overload**: Merged view could become cluttered.
  *Mitigation*: Implement mandatory career filters and category toggles on the UI.
- **Stale Data**: Scientific activities not updated.
  *Mitigation*: Assign clear ownership (responsible user) and set up automated reminders.

## Rollback Plan
- **Infrastructure**: Use Docker tags to revert to previous image versions via Jenkins pipeline `Deploy` rollback step.
- **Database**: Maintain regular pg_dump backups before running `alembic upgrade`. Revert database state using `alembic downgrade` or restoring the latest backup if migrations introduce critical errors.
- **System fallback**: In case of severe application failure, the university can temporarily revert to the existing static PDF/image calendar distribution process while fixes are applied.

## Success Criteria
- The system correctly merges academic and scientific activities into a single view without visual clutter.
- Authorized users can create, update, and track scientific activities efficiently.
- The pipeline successfully builds, tests, and deploys the system via Docker Compose and Jenkins.
- PDF and Excel reports are accurately generated via background tasks.
