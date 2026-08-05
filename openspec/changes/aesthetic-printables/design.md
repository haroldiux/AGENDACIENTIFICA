<Design: Aesthetic Printable Calendars>
## Technical Approach
We will replace the rigid programmatic PDF generation of `reportlab` with the HTML/CSS-based engine `WeasyPrint`, backed by `Jinja2` for templating. This enables us to define the layout and aesthetics using web standards, easily applying the UNITEPC brand colors (`#6B3392` and `#009E96`) and strict pagination rules.

## Architecture Decisions
### Decision: PDF Generation Engine
**Choice**: `WeasyPrint` combined with `Jinja2`.
**Alternatives considered**: `@react-pdf/renderer` (frontend generation, out of scope), `wkhtmltopdf` (deprecated, harder to configure).
**Rationale**: `WeasyPrint` is a pure Python solution that excels at converting modern HTML/CSS (including CSS Paged Media) to PDF. It seamlessly integrates into the existing Celery worker backend without requiring a separate microservice.

### Decision: Template Storage
**Choice**: Store Jinja2 templates in `backend/app/templates/`.
**Alternatives considered**: Inline HTML strings in the worker.
**Rationale**: Keeping HTML templates in separate files maintains separation of concerns, keeps the worker code clean, and makes styling updates much easier.

## Data Flow
1. The user requests a PDF report via the frontend, triggering an API call.
2. The backend enqueues a Celery task (`generate_pdf_report_task`).
3. `reports_worker.py` queries the database and formats the results into a context dictionary.
4. The Jinja2 environment loads the corresponding template (e.g., `research_agenda.html`) and renders it with the context.
5. The resulting HTML string is passed to `weasyprint.HTML(string=...).write_pdf(filepath)`.
6. The PDF is saved to `/app/reports/`, and the file path is returned.

## File Changes
| File | Action | Description |
| ---- | ------ | ----------- |
| `backend/pyproject.toml` | Update | Remove `reportlab>=4.2.0`. Add `weasyprint` and `jinja2`. |
| `backend/Dockerfile` | Update | Add `RUN apt-get update && apt-get install -y libpango-1.0-0 libcairo2 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info && rm -rf /var/lib/apt/lists/*` before `RUN pip install`. |
| `backend/app/workers/reports_worker.py` | Refactor | Remove `reportlab` logic. Implement data gathering, Jinja2 rendering, and `WeasyPrint` generation for `build_conflict_pdf`, `build_research_agenda_pdf`, and `_build_table_report`. |
| `backend/app/templates/base.html` | Create | Base Jinja2 layout containing global CSS, UNITEPC colors (`#6B3392`, `#009E96`), and `@page` rules for Portrait orientation. |
| `backend/app/templates/conflict_report.html` | Create | Template for conflict reports, extending `base.html`. |
| `backend/app/templates/research_agenda.html` | Create | Template for research agenda, utilizing `break-before: page;` to paginate per month or per career. |
| `backend/app/templates/activity_report.html` | Create | Template for the general table report. |

## Interfaces / Contracts
No changes to the external REST API or Celery task signatures. The inputs (`career_id`, `gestion_id`, `report_type`) and outputs (file path) remain identical.

## Testing Strategy
| Layer | What to Test | Approach |
| ----- | ------------ | -------- |
| Unit / Worker | PDF generation success | Mock the database, call `generate_pdf_report_task`, and assert that `weasyprint.HTML.write_pdf` is called and a file is created. |
| Rendering | Template syntax | Validate that Jinja2 renders the templates without syntax errors given a sample context. |

## Migration / Rollout
1. Update `pyproject.toml` and lock files if any.
2. Rebuild the backend Docker image to install the new OS-level dependencies (`libpango`, `libcairo`, etc.).
3. Deploy the updated worker and API containers.

## Open Questions
- Do we need to embed specific fonts (e.g., Google Fonts like Roboto or Inter) for the PDF, or are standard system fonts acceptable? We will default to a standard sans-serif stack for now.
</Design: Aesthetic Printable Calendars>
