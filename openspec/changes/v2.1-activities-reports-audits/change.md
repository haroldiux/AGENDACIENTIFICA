# OpenSpec Change Proposal: v2.1 Activities, Reports, Audits & Role Onboarding

## Overview
This change set completes the full feature suite for Scientific Activities management (`/actividades`), Reports & Seguimiento (`/reportes`), 1-Page Activity Report Sheets with UNITEPC Institutional Header, User-Attributed Field Diffs Audit Trail, and Role-Tailored Interactive Onboarding Tutorials.

## Components & Changes

### 1. Database & Backend API
- **Models (`backend/app/models/models.py`)**: Added `created_at`, `updated_at` timestamps to `ScientificActivity`. Added `ScientificActivityAudit` model mapped to `scientific_activity_audits` table.
- **Schemas (`backend/app/schemas/schemas.py`)**: Added `ScientificActivityAuditResponse` and `UserMinResponse`. Added `audits`, `created_at`, `updated_at` to `ScientificActivityResponse`.
- **API (`backend/app/api/v1/scientific.py`)**: 
  - Added automatic event recording for `CREACION`, `EDICION` (with specific field diffs `Old ➔ New`), `CAMBIO_ESTADO`, `SUBIDA_EVIDENCIA`, and `ELIMINACION_EVIDENCIA`.
  - Added `GET /api/v1/scientific/{id}/audits` endpoint with `joinedload` on `user`.
  - Executed SQL migration to populate initial `CREACION` audit entries for pre-existing activities.

### 2. Frontend User Interface
- **Status & Evidence Sub-Dialog (`StatusUpdateModal.tsx`)**: Reusable modal for updating status, writing motives/notes, and uploading/deleting evidence files from both Calendar and `/actividades` table.
- **Table Optimization (`/actividades`)**: Re-architected table layout to `table-fixed` with percentage column widths and compact icon button action tooltips, guaranteeing 100% fit without horizontal scroll.
- **Activity Report Sheet (`ActivityDetailReportModal.tsx`)**:
  - Displays full activity details, time range, responsible, collaborating careers, attached evidence files with download links, and audit trail timeline with user attribution.
  - Features an official UNITEPC Institutional Print Header.
  - Enforces strict single A4 page print CSS (`@media print`) preventing multi-page background document leaks.
- **Role-Tailored Onboarding Tutorials (`OnboardingTutorialModal.tsx`)**:
  - Dynamically detects `user.role` (`super_admin`, `carrera_director`, `read_only`) and `user.careers`.
  - Delivers a role-customized walkthrough track with specific tips for their exact permission level.
  - Triggered automatically on first login and accessible anytime via the floating button or Sidebar option.

## Verification
- All code committed to Git `main` branch.
- Database migration executed in PostgreSQL `agenda` database.
- Docker containers (`unitepc_backend`, `unitepc_frontend`) rebuilt and running cleanly.
