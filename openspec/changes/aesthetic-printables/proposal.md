<Proposal: Aesthetic Printable Calendars>
## Intent
Upgrade the PDF generation engine to produce highly aesthetic, premium-quality printable calendars. This replaces the rigid `reportlab` library with `WeasyPrint` and Jinja2 templates, enabling HTML/CSS-based styling to achieve a "wow factor" that aligns with the UNITEPC institutional branding.

## Scope
### In Scope
- Replacing `reportlab` with `WeasyPrint` for PDF generation in `backend/app/workers/reports_worker.py`.
- Creating Jinja2 HTML/CSS templates for the calendar exports.
- Enforcing Vertical (Portrait) orientation for all generated PDFs.
- Implementing strict pagination using CSS page breaks, ensuring each grouped section (e.g., per Career or per Month) starts on a new page.
- Applying UNITEPC institutional colors: deep Purple (`#6B3392`) and Teal/Cyan (`#009E96`) to headers, borders, and general aesthetics.
- Updating `backend/Dockerfile` to install required WeasyPrint system dependencies (e.g., `libpango-1.0-0`, `libcairo2`).

### Out of Scope
- Frontend print approaches (e.g., `react-to-print` or `@react-pdf/renderer`).
- Generating non-PDF formats (e.g., Word, Excel).

## Approach
We will transition the existing Celery worker for PDF generation to use `WeasyPrint`. The worker will fetch the required calendar data, pass it to a Jinja2 template, and render the HTML. WeasyPrint will convert this HTML/CSS to a true downloadable PDF. The template will use CSS `@page` rules to enforce Portrait orientation and CSS page breaks (`break-before: page`) for grouped sections. The styling will heavily feature the specified UNITEPC color palette (`#6B3392` and `#009E96`) to create a premium, visually striking document.

## Affected Areas
| Area | Impact | Description |
| ---- | ------ | ----------- |
| `backend/app/workers/reports_worker.py` | High | Rewrite PDF generation logic to use `WeasyPrint` and Jinja2 instead of `reportlab`. |
| `backend/Dockerfile` | Medium | Add system dependencies like `libpango-1.0-0` and `libcairo2` required by WeasyPrint. |
| `backend/pyproject.toml` | Low | Replace `reportlab` dependency with `WeasyPrint` and `Jinja2`. |
| Templates Directory | Medium | Create new Jinja2 HTML templates for PDF layouts. |

## Risks
| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| Docker Image Size | High | The addition of Pango and Cairo will increase the backend image size. We have authorization for this, but we will use minimal package variants if possible. |
| CSS Compatibility | Medium | WeasyPrint doesn't support all modern web CSS features. We will stick to supported CSS features (like standard Flexbox and Print CSS) to ensure layout stability. |

## Rollback Plan
Revert the changes in `backend/app/workers/reports_worker.py` to use the legacy `reportlab` code, remove WeasyPrint dependencies from `pyproject.toml`, and remove system dependencies from the Dockerfile.

## Dependencies
- Backend system dependencies: `libpango-1.0-0`, `libcairo2`.
- Python libraries: `WeasyPrint`, `Jinja2`.

## Success Criteria
- [ ] Backend successfully generates PDFs using WeasyPrint within the Celery worker.
- [ ] PDFs are strictly formatted in Vertical (Portrait) orientation.
- [ ] Grouped sections (per Career, per Month) start on a new page.
- [ ] The PDF design prominently and elegantly features UNITEPC institutional colors (`#6B3392` and `#009E96`).
- [ ] The `backend/Dockerfile` builds successfully with the required system dependencies.
</Proposal: Aesthetic Printable Calendars>
