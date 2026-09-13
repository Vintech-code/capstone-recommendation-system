# Repository audit and maintainability refactor

**Status:** COMPLETED  
**Date:** 2026-09-13  
**Scope:** repository structure, shared transport, Laravel service boundaries, unused code/assets, setup, and current documentation

## Decision

Keep the existing `apps/web` and `apps/api` monorepo because it cleanly separates deployable applications. Preserve React's feature ownership and Laravel's native directory conventions instead of creating duplicate generic frontend, backend, database, test, or asset roots.

## Changes

- Added current documentation categories and a repository-wide audit record.
- Consolidated browser JSON, credential, CSRF, parsing, and network-error behavior in `apps/web/src/services/api-client.ts`.
- Extracted Administrator assessment presentation, audit sanitization, and aggregate reporting from the Admin controller into `app/Services/Admin`.
- Corrected the programme asset relocation and optimizer path.
- Removed verified unreachable frontend modules, unused presentation assets, the unused React Table dependency, and the unused Laravel Vite welcome scaffold.
- Replaced the Laravel default welcome page with API service metadata and separated optional backend workers into explicit Composer scripts.
- Updated stale tests to the approved source-controlled programme-content and all-programme-ranking contracts.
- Corrected primary-action/footer and ranked-match contrast, made the current recommendation result printable, and synchronized stale system-test assertions with the accepted Student UI.
- Limited Playwright to one worker because higher concurrency caused browser setup timeouts in this Windows checkout; the complete configured matrix is stable in that mode.

## Validation

- `composer validate --no-check-publish`: passed.
- `vendor\bin\pint --test`: passed.
- `php artisan route:list --json`: 63 routes resolved.
- `php artisan test`: 116 passed, 996 assertions.
- `npm.cmd run lint`: passed.
- `npm.cmd test -- --run`: 24 files passed; 135 tests passed and 4 explicitly skipped.
- `npm.cmd run build`: passed; 2,801 modules transformed and relocated programme WebP assets emitted.
- `npm.cmd run test:e2e -- --reporter=line`: 28 desktop/mobile Chrome tests passed with one configured worker, including navigation, overflow, keyboard, contrast, reduced-motion, console, and PDF smoke checks.
- `git diff --check`: passed.
- Stale-reference scan: no live source/config/test references remain for removed modules, the old `assets/Pcs` runtime path, or the removed React Table package.
- Sensitive-path scan: only tracked `.env.example` templates matched; no tracked runtime environment, private-key, or database file was found.

## Boundaries

No scoring formula, programme classification, role, admission rule, authorization rule, database migration history, or Student record was changed. Remaining institutional evidence gaps are unchanged.
