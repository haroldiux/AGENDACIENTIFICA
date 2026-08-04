<Archive: Aesthetic Printable Calendars>
## Final Status
Completed successfully.
## Summary of Changes
- Replaced `reportlab` with `WeasyPrint` for generating premium-quality PDF reports in `backend/app/workers/reports_worker.py`.
- Developed Jinja2 HTML/CSS templates (e.g., `activity_report.html`, `conflict_report.html`, `research_agenda.html`, and `base.html`) enforcing UNITEPC branding (Purple `#6B3392` and Teal `#009E96`).
- Enforced Vertical (Portrait) orientation using CSS `@page` rules and strict pagination for grouped sections using `page-break-before: always`.
- Updated `backend/Dockerfile` to include essential system dependencies for WeasyPrint (`libpango-1.0-0`, `libpangoft2-1.0-0`, etc.).
- Reconfigured `pyproject.toml` to depend on `WeasyPrint` and `Jinja2` while removing `reportlab`.
</Archive: Aesthetic Printable Calendars>
