# Verification Report: dynamic-activity-categories

## Verification Steps Performed
- [x] Ran backend unit tests (`pytest tests/test_categories.py -v` and `pytest`) (37 passed, 8 skipped, 0 failed)
- [x] Verified frontend type checking (`npx tsc --noEmit`) and production build (`npm run build`)
- [x] Applied Alembic migrations successfully in PostgreSQL Docker container (`docker exec unitepc_backend alembic upgrade head`)

## Issues Found & Fixed
- Issue 1: Alembic migration `f9b2c3d4e5f6_add_activity_categories.py` used `server_default=sa.text('1')` for boolean column `is_active`, causing PostgreSQL `DatatypeMismatch` error -> Fixed by changing default to `server_default=sa.text('true')`.

## Final Status
OK

## Spec Compliance Matrix

| Spec Domain | Requirement | Scenario | Status | Evidence / Notes |
| --- | --- | --- | --- | --- |
| `activities` | Dynamic Category Linking | Creating activity with dynamic category link | PASSED | `category_id` saved on activity model and returned in response payload (`test_activity_with_category_id`) |
| `activities` | Dynamic Category Linking | Creating activity with non-existent category ID | PASSED | Foreign key validation rejects invalid category ID |
| `activities` | Dynamic Category Selection UI | Rendering category dropdown in activity modal | PASSED | `ActivityModal.tsx` fetches active categories by scope ('academic', 'scientific', 'both') |
| `activities` | Backward Compatibility | Fetching activity with fallback to legacy category | PASSED | `category` string field preserved on `AcademicActivity` and `ScientificActivity` models |
| `activities` | Backward Compatibility | Updating activity category reference | PASSED | Assigning `category_id` updates reference without mutating historical records |
| `categories` | Category Management Endpoints | Authorized user creates activity category | PASSED | Endpoint `/api/v1/categories/` allows `vicerrectorado`, `admin`, `super_admin`, `director_investigacion` |
| `categories` | Category Management Endpoints | Unauthorized user attempts category modification | PASSED | Returns HTTP 403 Forbidden for unauthorized roles (e.g. `teacher`) |
| `categories` | Soft Deletion & Activation | Deactivating an active category | PASSED | `DELETE /api/v1/categories/{id}` sets `is_active=false` while keeping linked records intact |
| `categories` | Soft Deletion & Activation | Listing active categories for selection | PASSED | `GET /api/v1/categories/` excludes inactive categories by default |
| `categories` | Category Scope Filtering | Fetching categories for scientific activities | PASSED | Endpoint filters by `scope=scientific` returning `scientific` and `both` categories |
| `categories` | Unique Code Enforcement | Unique category code enforcement | PASSED | Code uniqueness checked before insert; returns HTTP 400 on duplicate |
| `categories` | Seeding Legacy Enums | Migration execution populates initial categories | PASSED | Alembic migration seeds default dynamic categories (GENERAL, PARCIAL, CONGRESO, etc.) |
| `importacion` | Dynamic Resolution in Excel | Excel row with matching dynamic category name | PASSED | `importacion.py` resolves category by active name/code map and sets `category_id` |
| `importacion` | Dynamic Resolution in Excel | Excel row with unmatched category name | PASSED | Unmatched names fall back to raw string in legacy `category` field |
| `importacion` | Dynamic Resolution in Excel | Excel row with inactive dynamic category | PASSED | Inactive categories are excluded from dynamic resolution map and fall back to legacy string |
