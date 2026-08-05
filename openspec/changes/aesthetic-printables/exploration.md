## Exploration: Aesthetic Printable Calendars

### Current State
The application currently generates PDFs on the backend using the `reportlab` library inside a Celery worker (`backend/app/workers/reports_worker.py`). The PDFs are created programmatically via ReportLab's `Platypus` layout engine. While robust for basic tables, ReportLab is notoriously rigid and difficult to style for "premium aesthetics" (custom fonts, complex flex-like layouts, overlaps, themed colors, and SVG logos) without writing verbose and mathematically complex drawing code.

### Affected Areas
- `backend/app/workers/reports_worker.py` — Current PDF generation logic.
- `backend/pyproject.toml` & `backend/Dockerfile` — Dependency management (if shifting backend engines).
- `frontend/app/calendario/page.tsx` & `frontend/app/reportes/page.tsx` — Triggering and downloading the PDFs.

### Approaches

1. **Frontend: `react-to-print` (Print Dialog)**
   - **Description**: Build a visually stunning, print-only React component using Tailwind CSS, hidden from the normal UI. Use `react-to-print` to invoke the browser's native print dialog.
   - **Pros**: Maximum aesthetic control using standard React and Tailwind. Easy to iterate with hot-reloading. Zero backend overhead.
   - **Cons**: Does not directly generate a `.pdf` file (prompts the user to "Save as PDF"). Inconsistent rendering across different browsers (margins, default headers/footers). Mobile support is poor. Paging control can be finicky.
   - **Effort**: Low to Medium

2. **Frontend: `@react-pdf/renderer`**
   - **Description**: Build the PDF directly on the client (or Next.js server) using specialized React primitives (`<Document>`, `<Page>`, `<View>`).
   - **Pros**: Generates a true downloadable `.pdf` file. Doesn't rely on browser print settings.
   - **Cons**: Does not support standard HTML/CSS or existing Tailwind components directly. Styling engine is limited (subset of CSS), making "wow factor" aesthetics and complex layouts more time-consuming to achieve.
   - **Effort**: Medium to High

3. **Backend: `WeasyPrint` with Jinja2 HTML Templates**
   - **Description**: Replace `reportlab` with `WeasyPrint`. The backend renders a Jinja2 HTML template populated with calendar data, and WeasyPrint converts the HTML/CSS to a true PDF.
   - **Pros**: Fits perfectly into the existing Celery async worker architecture. Allows the use of standard HTML and CSS (including Flexbox and Grid) to achieve premium, themed aesthetics. Excellent support for print-specific CSS (`@page` rules for margins and page numbers). Generates a true downloadable file.
   - **Cons**: Requires adding C-level system dependencies (Pango, Cairo) to the `backend/Dockerfile`. Slower feedback loop during design iteration compared to React.
   - **Effort**: Medium

4. **Backend: Headless Browser (Puppeteer/Playwright)**
   - **Description**: Spin up a headless browser on the server to render a web page and snapshot it as a PDF.
   - **Pros**: 100% modern web CSS support. Highest fidelity.
   - **Cons**: Enormous resource footprint. Very heavy backend dependency for Docker. Overkill.
   - **Effort**: High

### Recommendation
**Approach 3 (Backend: `WeasyPrint` with Jinja2)** is the most robust recommendation for this architecture. 
It preserves the existing asynchronous Celery PDF generation flow but upgrades the rendering engine from the rigid `reportlab` to `WeasyPrint`. This allows developers to use standard HTML and CSS to create highly aesthetic, themed, and precisely paginated PDFs (grouped by career, semester, month, etc.) without relying on the user's browser print dialog.

*Alternative*: If adding system dependencies to the backend Docker image is undesirable, **Approach 1 (`react-to-print`)** is a strong fallback, provided the client accepts that users will need to manually use the browser's "Save as PDF" feature.

### Risks
- **WeasyPrint Dependencies**: Requires updating `backend/Dockerfile` with packages like `libpango-1.0-0`, which increases image size and requires testing the build.
- **CSS Limitations**: While WeasyPrint supports modern CSS, it may not support every cutting-edge CSS feature compared to a real browser, requiring some layout adjustments.

### Ready for Proposal
Yes. The orchestrator should present WeasyPrint (Backend) as the recommended path for true PDF export with high aesthetics, or `react-to-print` (Frontend) if they prefer rapid UI development but are okay with a browser print dialog.
