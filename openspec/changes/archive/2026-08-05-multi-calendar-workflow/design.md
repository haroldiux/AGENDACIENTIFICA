# Design: Multi-Calendar Hierarchy, Research Roles & Activity Evidence Attachments

## Technical Approach
This design introduces institutional multi-calendar hierarchy, scope-aware role permissions, and multi-file activity evidence attachments. The solution makes `career_id` nullable on `AcademicActivity` and `ScientificActivity` models to represent global institutional events. The Fusion Engine query is updated to automatically merge global events (`career_id IS NULL`) into career-specific calendar feeds. Role-based access control (RBAC) is extended with specialized research and vicerrectorado roles, enforcing scope boundary permissions. Finally, a `ScientificActivityEvidence` relational model and FastAPI file upload endpoints provide file attachment capabilities for scientific activities.

## Architecture Decisions
### Decision: Nullable career_id & Scope Inheritance in Fusion Query
**Choice**: Make `career_id` optional (`nullable=True`) on activity tables. Update the Fusion Engine query to filter using `or_(Activity.career_id == career_id, Activity.career_id.is_(None))` when querying a career calendar feed.
**Alternatives considered**: 1) Creating a separate `GlobalActivity` table; 2) Duplicating global events across all career entries.
**Rationale**: Nullable foreign keys avoid schema duplication, preserve existing API contracts, and allow clean SQL ORM queries without redundant sync logic.

### Decision: Relational Evidence Attachments & Local File Storage
**Choice**: Create a `ScientificActivityEvidence` table (`id`, `activity_id`, `filename`, `file_path`, `file_type`, `file_size`, `uploaded_at`) linked via 1-to-many relationship to `ScientificActivity`. Physical files are saved in `uploads/evidences/{activity_id}/` with maximum size 10MB and MIME type validation (PDF, PNG, JPG, DOCX).
**Alternatives considered**: 1) Storing binary blobs in DB (`BYTEA`); 2) Single `evidence_url` string column.
**Rationale**: 1-to-many relational structure enables uploading and deleting multiple attachments per activity while keeping DB size optimal.

### Decision: Centralized Scope-Aware Permission Validation
**Choice**: Extend `RoleEnum` with `vicerrectorado`, `director_investigacion`, and `jefe_investigacion`. Create a helper function `check_activity_scope_permission(user, career_id)` used across HTTP handlers. `vicerrectorado` and `director_investigacion` can manage global (`career_id=None`) and career-scoped events. `jefe_investigacion` and `coordinador` can only manage events matching their assigned `user.careers`.
**Alternatives considered**: Dynamic ACL permission matrix table in DB.
**Rationale**: Leveraging Python/SQLAlchemy role evaluation keeps authorization fast and aligned with existing `deps.py` security patterns.

## Data Flow
1. **Merged Feed Request**: Client calls `GET /api/v1/fusion/?career_id=10`. Backend queries academic and scientific activities where `career_id == 10 OR career_id IS NULL`. Items are tagged with `scope: "global" | "career"` and returned to client.
2. **Evidence File Upload**: Authorized user sends `POST /api/v1/scientific/{id}/evidence` with multipart file data. Backend verifies MIME/size limits, writes file to disk, creates `ScientificActivityEvidence` DB record, and returns file metadata.
3. **Evidence Deletion**: Client calls `DELETE /api/v1/scientific/evidence/{evidence_id}`. Backend verifies ownership/role permissions, deletes physical file from storage, and removes database record.

## File Changes
| File | Action | Description |
| --- | --- | --- |
| `backend/app/models/models.py` | Modify | Add roles (`vicerrectorado`, `director_investigacion`, `jefe_investigacion`) to `RoleEnum`, set `career_id` nullable in activities, and add `ScientificActivityEvidence` model. |
| `backend/app/schemas/schemas.py` | Modify | Add roles to `RoleEnum`, set `career_id` optional in activity schemas, add `scope` to `MergedCalendarItem`, and define evidence CRUD schemas. |
| `backend/app/api/v1/fusion.py` | Modify | Update query filter logic to merge `career_id IS NULL` events and supply `scope` attribute in response items. |
| `backend/app/api/v1/scientific.py` | Modify | Enforce scope-aware RBAC; add `POST /{id}/evidence`, `GET /{id}/evidence`, and `DELETE /evidence/{evidence_id}` endpoints. |
| `backend/app/api/v1/academic.py` | Modify | Enforce scope-aware RBAC for global vs career activity creation and editing. |
| `backend/app/api/deps.py` | Modify | Add `check_activity_scope_permission(user, career_id)` helper function. |
| `frontend/lib/api.ts` | Modify | Update interfaces (`MergedCalendarItem`, `RoleEnum`) and add evidence upload/download/delete methods. |
| `frontend/components/calendar/CalendarView.tsx` | Modify | Render scope badges ("Global" vs "Carrera") in event items and detail dialogs. |
| `frontend/app/calendario/page.tsx` | Modify | Support selecting global calendar scope (`career_id = null`) alongside career filters. |

## Interfaces / Contracts
- `POST /api/v1/scientific/{id}/evidence`: Upload evidence file (`multipart/form-data`). Returns `ScientificActivityEvidenceResponse`.
- `GET /api/v1/scientific/{id}/evidence`: List activity evidence files. Returns `List[ScientificActivityEvidenceResponse]`.
- `DELETE /api/v1/scientific/evidence/{evidence_id}`: Remove evidence file. Returns HTTP 204.
- `MergedCalendarItem`: JSON payload updated with `scope: "global" | "career"` and optional `career_name: Optional[str]`.

## Testing Strategy
| Layer | What to Test | Approach |
| --- | --- | --- |
| Database / ORM | Nullable `career_id` & `ScientificActivityEvidence` relations | SQLAlchemy unit tests with SQLite test database |
| Fusion Engine | Merging global (`career_id IS NULL`) and career events | Pytest integration tests checking merged list filtering |
| Auth & RBAC | Global vs career permission boundaries (200 OK vs 403 Forbidden) | Pytest endpoint tests with mocked JWT tokens for all roles |
| Storage | Evidence upload MIME/size validation & physical file deletion | Pytest tests uploading valid/invalid files and verifying filesystem state |
| UI Components | Scope badge display, global calendar selection, evidence upload | React component unit tests |

## Migration / Rollout
1. Run Alembic migration to update `RoleEnum`, alter `career_id` to nullable in activity tables, and create `scientific_activity_evidences` table.
2. Create upload directory `uploads/evidences/` with appropriate service account permissions.
3. Deploy updated FastAPI backend service.
4. Deploy updated Next.js web frontend.

## Open Questions
None.
