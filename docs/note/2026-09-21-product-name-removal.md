# Product-name removal

**Status:** IMPLEMENTED with automated validation; rendered browser review remains pending  
**Date:** 2026-09-21

## Scope

The repository owner directed removal of the former product label everywhere in the codebase. A case-insensitive audit found occurrences across visible branding, ordinary interface phrases, TypeScript and PHP identifiers, configuration and environment keys, backup identifiers, tests, anchors, and documentation.

The change replaces visible branding with factual TCC course-recommendation wording and uses neutral technical names internally. Generic phrases were also rewritten, including programme recommendations and career directions, so the removed label does not remain as an ordinary noun.

## Compatibility

- Notification classes and frontend notification types were renamed without changing payload contracts.
- Backend configuration moved to `config/platform.php` and new environment examples use the `TCC_*` prefix.
- Existing deployments may continue reading the earlier environment settings through an internal compatibility fallback that does not retain the removed literal label in source.
- New backup filenames and archive identifiers use neutral TCC course-recommendation names. Existing encrypted backups retain key-derivation and archive-format compatibility.
- Assessment scoring, recommendation logic, authentication, authorization, persistence, routes, and API payloads are unchanged.

## Validation

- Repeated case-insensitive source-content and source-path searches returned zero matches.
- Focused backend coverage: 17 tests passed with 93 assertions.
- Full Laravel suite: 132 tests passed with 1,147 assertions.
- Laravel Pint passed.
- Focused frontend coverage: 23 tests passed and 4 skipped.
- Frontend ESLint passed.
- Production TypeScript/Vite build passed with the existing large-chunk warning.
- Full frontend Vitest: 150 tests passed and 4 skipped; three unrelated existing tests failed: the known theme-token mismatch and timeouts in the Admin configuration and assessment calculation tests.
- Focused public-landing Playwright validation exposed an unrelated existing desktop spacing assertion (55 px rendered gap versus the test's 40 px limit); the run did not terminate cleanly after the failure and was stopped.
- The architecture guard remains blocked by the unrelated existing 1,047-line `configuration-workflow.tsx` file.
- The in-app browser remains unavailable, so rendered desktop/mobile, keyboard, overflow, console, contrast, zoom, and reduced-motion evidence is pending.
