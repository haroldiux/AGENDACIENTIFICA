# Spec: Career Filter

## Feature Description
The merged calendar view must allow users to filter activities by specific careers.

## Requirements
1. The frontend MUST query the existing `/api/v1/careers` endpoint to get a list of active careers.
2. The `calendario` page MUST include a `<select>` dropdown populated with the fetched careers.
3. When a career is selected, the frontend MUST append `?career_id=<id>` to the `GET /api/v1/fusion/` fetch call.
4. The calendar view must update dynamically when the filter changes.
