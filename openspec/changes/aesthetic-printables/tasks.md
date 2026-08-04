<Tasks: Aesthetic Printable Calendars>
## Phase 1: Environment & Dependencies
- [x] `backend/Dockerfile`: Add system dependencies (`libpango-1.0-0 libcairo2 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info`) for WeasyPrint before the pip install step.
- [x] `backend/pyproject.toml`: Remove `reportlab` dependency. Add `weasyprint` and `jinja2` dependencies.

## Phase 2: HTML Templates
- [x] `backend/app/templates/base.html`: Create base Jinja2 layout containing global CSS, UNITEPC colors (`#6B3392`, `#009E96`), `@page` rules for Portrait orientation, and embed a modern Google Font (e.g., Inter or Roboto) for premium typography.
- [x] `backend/app/templates/conflict_report.html`: Create template for conflict reports, extending `base.html`.
- [x] `backend/app/templates/research_agenda.html`: Create template for research agenda, utilizing `break-before: page;` to paginate per month or per career.
- [x] `backend/app/templates/activity_report.html`: Create template for the general table report.

## Phase 3: Worker Integration
- [x] `backend/app/workers/reports_worker.py`: Refactor to remove `reportlab`. Implement data gathering, Jinja2 template rendering, and `WeasyPrint` PDF generation for `build_conflict_pdf`, `build_research_agenda_pdf`, and `_build_table_report`.
</Tasks: Aesthetic Printable Calendars>
