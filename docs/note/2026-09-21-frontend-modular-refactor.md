# Frontend modular refactor

**Status:** IN PROGRESS  
**Date:** 2026-09-21  
**Scope:** `apps/web` architecture-only refactoring; no route, API-contract, authentication, recommendation, or business-rule changes.

## Completed slice

- Reduced the Student recommendation-results page from 598 to 184 lines by extracting its async workflow hook, pure derived-data utilities, summary, career-path, and ranked-list components.
- Separated Administrator DTOs, ordinary API transport, resource caching, and the reusable resource hook while preserving `admin-api.ts` as the existing consumer boundary and upload-progress adapter.
- Moved the shared authentication recovery frame out of the password-recovery page and removed the duplicated Student area-list formatter.
- Preserved the existing lazy not-found animation while making its fallback testable.
- Reduced the assessment-history summary from 490 to 185 lines by extracting the attempt feed and selected-attempt inspector.
- Reduced the assessment-session page from 908 to 157 lines by extracting its 262-line lifecycle/autosave hook, entrance declaration screen, completed screen, state types, and pure storage/formatting utilities.

## Validation evidence

- `npm.cmd run lint` — passed.
- `npm.cmd run check:architecture` — passed.
- `npm.cmd run build` — passed, including TypeScript project validation.
- `npm.cmd test -- --run --maxWorkers=1` — 28 files passed; 147 tests passed and 4 skipped.
- Focused assessment-session validation — 19 tests passed.
- Focused Student dashboard/history validation — 12 tests passed and 4 skipped.
- Playwright desktop/mobile run — 22 passed and 10 failed. The failures are existing UI/test drift: removed Admin dashboard and invitation labels, landing height/contrast expectations, and a recommendation illustration accessible-name expectation. These failures prevent a COMPLETED browser-evidence claim.
- Targeted post-refactor Playwright validation — assessment canvas and responsive/keyboard/contrast checks passed on desktop and mobile; the completion case still fails only on the existing recommendation illustration accessible-name expectation after reaching the result screen.
- The in-app browser surface was unavailable, so no separate manual rendered inspection was recorded.

## Remaining work and blockers

- Continue large-page decomposition feature by feature, beginning with Admin Student detail, landing, profile, Admin programmes, and Student catalogue.
- Decide whether the currently unreachable Student dashboard is intentionally retired or should be routed; do not delete or reconnect it without an approved product-flow decision.
- Reconcile the failing Playwright expectations with the current approved UI before using them as release evidence.
- Review the existing duplicate recommendation-results size-limit entries in the architecture checker separately because that file already contained unrelated worktree changes.
