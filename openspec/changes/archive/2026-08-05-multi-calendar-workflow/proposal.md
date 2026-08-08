# Proposal: Multi-Calendar Hierarchy, Research Roles & Activity Evidence Attachments

## Intent
Enable institutional multi-calendar hierarchy (Global/Vicerrectorado vs Career-specific), refine research and academic roles/permissions, and introduce multi-file activity evidence attachment capabilities.

## Scope
### In Scope
- Support nullable `career_id` on `AcademicActivity` and `ScientificActivity` to represent global institutional events.
- Update Fusion Engine query logic to merge global (`career_id IS NULL`) and career-scoped (`career_id == X`) events into consolidated views.
- Add granular roles (`director_investigacion`, `jefe_investigacion`, `vicerrectorado`) and enforce role-based access control (RBAC) across endpoints.
- Create `ScientificActivityEvidence` table and endpoints for uploading, downloading, listing, and deleting activity evidence files (PDFs, images, reports).
- UI updates in calendar and activity components to display scope badges, upload evidence files, and manage role-scoped actions.

### Out of Scope
- Dynamic faculty-level sub-calendars (hierarchies beyond Global vs Career).
- Asynchronous video transcoding or real-time document editing for evidence attachments.

## Approach
Implement Option 1: Nullable `career_id` foreign keys with scope inheritance in the Fusion Engine, dedicated `ScientificActivityEvidence` relational model for attachments, and updated RBAC permissions for specialized research and vicerrectorado roles.

## Affected Areas
| Area | Impact | Description |
| --- | --- | --- |
| `backend/app/models/models.py` | High | Add `vicerrectorado`, `director_investigacion`, `jefe_investigacion` to `RoleEnum`, set `career_id` nullable, add `ScientificActivityEvidence`. |
| `backend/app/schemas/schemas.py` | Medium | Update activity schemas to support optional `career_id` and add `ActivityEvidence` CRUD schemas. |
| `backend/app/api/v1/fusion.py` | Medium | Merge global (`career_id IS NULL`) and career events in calendar feed. |
| `backend/app/api/v1/academic.py` & `scientific.py` | High | Enforce Vicerrectorado/Director vs Jefe/Coordinador permission boundaries and add evidence file upload/download endpoints. |
| `frontend/app/` | Medium | Update API client, calendar scope badges, activity modals, and file upload dropzones. |

## Risks
| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Permission leakage between career and global scopes | Medium | Enforce strict RBAC middleware validation comparing user roles and `user.careers` mapping against target `career_id`. |
| Insecure file uploads or storage exhaustion | Low | Validate file MIME types (PDF, PNG, JPG, DOCX), sanitize filenames, limit file sizes, and store in isolated upload directories. |

## Rollback Plan
Revert DB schema changes, restore non-nullable `career_id` constraint, drop `scientific_activity_evidences` table, and revert frontend API client and UI components to previous commit.

## Dependencies
- SQLAlchemy / Alembic database migrations.
- Multipart form data handling (`python-multipart` in FastAPI).

## Success Criteria
- [ ] Global academic and scientific events inherit cleanly into career calendar feeds.
- [ ] Vicerrectorado and Director de Investigación can publish global activities (`career_id = None`).
- [ ] Jefe de Investigación and Coordinador can only publish/edit events within their assigned careers.
- [ ] Users can upload, view, and delete multiple evidence attachments per scientific activity.
