# Archive Report: Multi-Calendar Workflow

## Final Status
Completed successfully.

## Summary of Changes
Implemented full multi-calendar workflow capabilities for Agenda Científica:
- **Global & Career Scope Support**: Enabled null `career_id` for global institutional activities on `AcademicActivity` and `ScientificActivity` models.
- **Granular Role Definitions**: Expanded role access controls to support `vicerrectorado`, `director_investigacion`, and `jefe_investigacion` roles with scope-aware permissions.
- **Fusion Engine Event Merging**: Updated calendar feed API endpoints and query logic to seamlessly merge global events (`career_id IS NULL`) with career-specific events (`career_id == X`).
- **UI Scope Distinction**: Added visual scope badges ("Global" vs "Carrera") on activity cards and integrated career filtering in the calendar interface.
- **Evidence Management**: Implemented dedicated file evidence attachment endpoints (`POST`, `GET`, `DELETE`) for `ScientificActivityEvidence`.

## Delta Spec Sync
Synced the following delta specifications into `openspec/specs/`:
- `activities/spec.md`: Added evidence attachments requirements and nullable career scope requirement.
- `auth-roles/spec.md`: Added granular research roles requirement and scope-aware permissions requirement.
- `fusion-engine/spec.md`: Added global and career event fusion requirement and UI scope badge distinction requirement.

## Archive Details
- **Archived Path**: `openspec/changes/archive/2026-08-05-multi-calendar-workflow/`
- **Date**: 2026-08-05
- **Status**: Production Ready & Fully Verified
