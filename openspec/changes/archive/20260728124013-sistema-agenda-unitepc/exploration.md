# Exploration Analysis: Sistema Agenda UNITEPC

## 1. Architecture Requirements Analysis
Based on the implementation plan, the system will utilize a modern web architecture optimized for high performance, ease of development, and maintainability:

*   **Frontend**: Next.js 14+ (React, App Router, TypeScript) will be used for its SSR/SSG capabilities, ensuring fast load times and good SEO. Styling will rely on Tailwind CSS and shadcn/ui for accessible, consistent components. A calendar library (e.g., FullCalendar) will be required.
*   **Backend**: FastAPI (Python 3.12+) provides a high-performance, async-capable API. It uses Pydantic for data validation and SQLAlchemy 2.0 + Alembic for ORM and migrations.
*   **Database**: PostgreSQL 16 is chosen for its robust relational features and native support for date ranges (`daterange`), which is highly beneficial for calendar overlapping queries.
*   **Background Processing**: Celery paired with Redis will handle long-running async tasks without blocking the main API thread. Initial tasks include report generation (PDF/Excel), with future plans for OCR processing of academic calendars.
*   **Reverse Proxy**: Nginx will handle routing between the frontend and backend, as well as SSL termination.
*   **Deployment & CI/CD**: Docker Compose v2 will orchestrate the entire stack (local and production parity). A Jenkins declarative pipeline (`Jenkinsfile`) will handle CI/CD, encompassing build, test, database migration, and deployment stages.

## 2. Monorepo Structure
The project will be organized as a monorepo to centralize configuration, deployment, and versioning.

```text
/ (Project Root)
├── frontend/                 # Next.js application
│   ├── app/
│   ├── components/
│   └── package.json
├── backend/                  # FastAPI application
│   ├── app/
│   ├── alembic/
│   └── pyproject.toml
├── nginx/                    # Reverse proxy configuration
│   └── nginx.conf
├── docker-compose.yml        # Main orchestration file
├── docker-compose.prod.yml   # Production overrides
└── Jenkinsfile               # CI/CD pipeline definition
```

## 3. Database Schema Overview
The core entities will include:
*   `Carrera`: id, nombre, facultad
*   `Gestión`: id, nombre, fecha_inicio, fecha_fin
*   `ActividadAcademica`: id, carrera_id, gestión_id, nombre, fecha_inicio, fecha_fin, categoría, color_origen
*   `ActividadCientifica`: id, carrera_id, gestión_id, nombre, tipo, fecha_inicio, fecha_fin, responsable, estado, evidencia_url
*   `Usuario`: id, nombre, rol
*   `Reporte`: id, gestión_id, carrera_id, tipo, fecha_generación, archivo

## 4. Next Steps for Implementation
1.  Initialize the Git repository and set up the monorepo folder structure.
2.  Create the `docker-compose.yml` to orchestrate PostgreSQL and Redis.
3.  Bootstrap the backend with FastAPI, SQLAlchemy, and Alembic.
4.  Bootstrap the frontend with Next.js, Tailwind, and shadcn/ui.
5.  Set up the Nginx configuration to route traffic appropriately.
6.  Draft the initial `Jenkinsfile` for CI/CD setup.
