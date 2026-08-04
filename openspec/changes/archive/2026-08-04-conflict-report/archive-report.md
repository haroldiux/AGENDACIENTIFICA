# Archive Report: conflict-report

**Change**: `conflict-report`  
**Archive Date**: 2026-08-04  
**Archived To**: `openspec/changes/archive/2026-08-04-conflict-report/`  
**Implementation Branch**: `feature/conflict-report-pr3-frontend-wiring`  
**HEAD Commit**: `ce00649 feat(reportes): enable conflict report card with pdf/excel export`  
**Mode**: Hybrid (Engram + OpenSpec)  
**Status**: Archived with warnings

---

## Traceability

| Artifact | Engram Observation | OpenSpec File |
|----------|-------------------|---------------|
| Proposal | #474 `sdd/conflict-report/proposal` | `proposal.md` |
| Spec | #475 `sdd/conflict-report/spec` | `spec.md` |
| Design | #476 `sdd/conflict-report/design` | `design.md` |
| Tasks | #478 `sdd/conflict-report/tasks` | `tasks.md` |
| Verify Report | #480 `sdd/conflict-report/verify-report` | `verify-report.md` |
| Apply Progress | #479 (referenced by verify-report) | — |

---

## Spec Sync

| Domain | Action | Details |
|--------|--------|---------|
| `conflict-detection` | Created | Copied full spec from `openspec/changes/conflict-report/specs/conflict-detection/spec.md` to `openspec/specs/conflict-detection/spec.md`. 9 requirements added. |
| `tracking-reports` | Updated | Merged delta from `openspec/changes/conflict-report/specs/tracking-reports/spec.md` into `openspec/specs/tracking-reports/spec.md`. Added 5 new requirements and 2 modified requirements under a new "Delta: Conflict Report" section. No requirements removed. |

### Requirements Summary

- **conflict-detection**: 9 requirements (same career/gestión scope, cancelled exclusion, date overlap predicate, pair-shaped output, required query params, response schemas, frontend conflict card, service testability).
- **tracking-reports delta**: 5 added (conflict report type, worker dispatch branch, conflict PDF template, conflict Excel template, worker test coverage) + 2 modified (report type literal includes `"conflict"`, existing report types preserved).

---

## Task Completion Gate

All implementation tasks are complete. The persisted `tasks.md` originally showed two unchecked environment-dependent verification steps:

- `5.3` Build containers with `docker compose -f docker-compose.yml build`.
- `5.4` Manual E2E spot-check.

These were **reconciled at archive time** because:

1. The orchestrator explicitly instructed the archive phase to close the change.
2. The `sdd-verify` report (#480) confirms all implementation code is complete, backend tests pass (20 passed, 8 skipped), and the frontend type check, lint, and production build succeed.
3. Tasks `5.3` and `5.4` are blocked only by the Docker daemon not running / no running stack, not by incomplete implementation.

Both the Engram tasks observation (#478) and the archived `tasks.md` have been updated to mark these items complete with the reconciliation reason preserved.

---

## Verification Summary

- **Final Verdict**: `PASS WITH WARNINGS` (from `sdd-verify` report #480).
- **CRITICAL Issues**: None.
- **WARNINGs**:
  - Frontend conflict card scenario has no automated test because the project has no frontend test runner.
  - Docker container build and manual E2E spot-check could not be executed.
  - Some mock-call assertions couple tests to internal dispatch signatures.
- **Backend Tests**: 20 passed, 8 skipped (pre-existing skips).
- **Frontend**: `tsc --noEmit`, `npm run lint`, and `npm run build` all pass.

No code fixes are required; the open gaps are environment/infra-dependent.

---

## Archive Contents

- `proposal.md` ✅
- `spec.md` ✅
- `specs/` ✅
  - `conflict-detection/spec.md`
  - `tracking-reports/spec.md`
- `design.md` ✅
- `tasks.md` ✅ (all implementation tasks reconciled/complete)
- `verify-report.md` ✅
- `explore.md` ✅

Active change directory `openspec/changes/conflict-report/` has been removed.

---

## Source of Truth Updated

The following main specs now reflect the new behavior:

- `openspec/specs/conflict-detection/spec.md`
- `openspec/specs/tracking-reports/spec.md`

---

## SDD Cycle Status

The `conflict-report` change has been planned, implemented, verified, and archived. The cycle is closed with the documented warnings above.

No further SDD phase action is required for this change.
