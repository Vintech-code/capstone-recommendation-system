# Architecture and design governance

**Status:** COMPLETED  
**Date:** 2026-09-14  
**Scope:** future frontend/backend placement, dependency direction, clean-code workflow, UI implementation ownership, automated architecture boundaries, and documentation synchronization

## Decision

The repository-owner-approved 2026-09-14 direction makes the framework-native structure and anti-spaghetti rules mandatory for future work. `AGENTS.md` remains the repository workflow authority, `DESIGN.md` remains the UI/UX authority, and `docs/architecture/development-standards.md` is their implementation reference.

The existing `apps/web` and `apps/api` boundary is retained. The generic example structure is represented through React and Laravel conventions rather than duplicate root frontend, backend, database, test, or asset trees.

## Implemented governance

- Added explicit frontend and backend ownership, dependency, controller, service, component, hook, utility, and contract-migration rules.
- Added a mandatory seven-step implementation workflow from authority review through documentation synchronization.
- Defined extraction signals that prioritize cohesion and testability instead of arbitrary fragmentation.
- Added an automated architecture check for direct HTTP bypasses, reverse frontend dependencies, unsafe Laravel environment access, reverse backend dependencies, oversized new files, and growth in audited legacy hotspots.
- Added the architecture check to the documented validation workflow and linked the standards from the project index and README.
- Updated `DESIGN.md` to version 4.4 with frontend ownership, styling ownership, and enforcement rules.

## Validation

- `node --check apps/web/scripts/check-architecture.mjs` — passed.
- `npm.cmd run check:architecture` — passed.
- `npm.cmd run lint` — passed.
- `npm.cmd test -- --run --maxWorkers=1` — 24 files passed; 135 tests passed and 4 skipped.
- `npm.cmd run build` — passed.
- `php artisan test` — 121 tests passed with 1,038 assertions.
- `git diff --check` — passed; Git reported only the repository's existing LF-to-CRLF checkout warnings.
- `vendor\bin\pint --test` — not clean because eight existing/concurrently modified backend files have formatting drift. This governance slice did not edit those PHP files, so they were preserved for their owning change rather than rewritten here.

No rendered browser run was required because this slice changes governance documentation and static architecture checks, not rendered UI or runtime behavior. Documentation-only changes do not alter institutional, psychometric, admission, scoring, role, authorization, or recommendation policy.

## Backlog and risk

The automated guard cannot prove cohesion or good design. Reviewers must still inspect naming, responsibility boundaries, truthful data flow, accessibility, tests, and rendered behavior. Existing large-file allowances are debt caps, not preferred sizes; reduce them in dedicated behavior-preserving slices with proportionate validation.
