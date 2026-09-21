# Codebase audit — 2026-09-13

**Status:** COMPLETED audit; refactor validation recorded in `docs/note/2026-09-13-codebase-refactor.md`.

## Scope inspected

The audit covered the root authorities and roadmap; all tracked and untracked project paths outside dependency/build directories; React entry points, routes, feature modules, shared components, API adapters, tests, configuration, scripts, and assets; Laravel routes, controllers, requests, middleware, models, jobs, notifications, services, configuration, migrations, seeders, factories, tests, and data files; dependency manifests and lock files; documentation links; ignored/sensitive paths; source reachability; duplicate file hashes; and baseline validation.

## Architecture and usage findings

- The repository is a two-application monorepo, not an uncustomized scaffold: React/Vite lives in `apps/web`; Laravel lives in `apps/api`.
- The existing feature-based React layout and Laravel default layout already match the requested organizational intent better than literal `frontend/src` and `backend/src` replacements.
- All 63 Laravel routes resolve. Protected API groups consistently use Sanctum, active-account checks, and role middleware.
- The frontend had seven separate implementations of JSON headers, credentials, CSRF extraction, parsing, and errors. These were consolidated into one cross-feature service.
- `AdminWorkspaceController` mixed HTTP transport, report aggregation, assessment presentation, and audit sanitization. Report and presentation work were extracted to `app/Services/Admin`.
- Eight TypeScript/TSX files were unreachable from the production entry graph and had no runtime imports. They were removed.
- `@tanstack/react-table` had no source/config/test references and was removed. `react-is` is retained because the installed Recharts stack uses it for React compatibility.
- The Laravel Vite welcome-page scaffold was independent of the real React application. Its view, Vite resources, and Node manifest were removed; the API root now returns service metadata.
- Programme assets had been moved from `assets/Pcs` to `assets/programmes`, but the runtime glob and optimization script still referenced the old path. Both references were corrected.
- Ten presentation assets had no import, glob, HTML, CSS, script, or test reference and were removed. Original programme source images remain because the WebP optimization script consumes them.
- The root lacked a `.gitignore`; scoped repository temporary/report patterns were added without weakening application-specific ignores.
- No committed runtime `.env`, private key, database, dependency directory, or build output was found. `.env.example` remains intentionally tracked.

## Baseline validation before refactoring

- Composer manifest validation: passed.
- Laravel route discovery: 63 routes resolved.
- Laravel tests: 113 passed and 3 failed. The failures were stale assertions after approved CMO content protection, all-programme entrance-group separation, and current career-direction content.
- Laravel Pint check: failed on two pre-existing files.
- Frontend tests: 132 passed, 4 skipped, and 1 failed. The failure exposed the stale programme asset path.
- Frontend ESLint: passed.
- Frontend TypeScript and production Vite build: passed.

The refactor did not treat these baseline failures as successful evidence. Their resolution is verified separately after the changes.

## Remaining maintainability risks

- Several page modules remain large, especially Student dashboard, landing, assessment, profile, programme catalogue, and Admin Student detail. They should be split by independently stateful section only in dedicated UI slices with browser evidence.
- `index.css` remains large and contains legacy compatibility selectors. DESIGN.md requires obsolete-theme removal as a separately verified UI slice.
- Large landing and assessment PNG files dominate the production asset payload. Re-encoding or replacing them changes presentation assets and requires visual QA.
- The Playwright suite is intentionally configured for one worker in this Windows checkout. Higher concurrency caused browser setup timeouts even when the same cases passed alone; reliability is preferred over a shorter local run.
- Historical migrations intentionally included creation and later removal of deprecated counselor/appointment tables. This finding was superseded by the repository-owner-approved 2026-09-16 clean baseline and verified local reset; see [the current implementation record](../note/2026-09-16-backend-clean-baseline.md).
- Exact Criminology, BSEd, BPEd, and Community Development source gaps remain as recorded in the CMO programme-content note. Refactoring cannot resolve those institutional evidence gaps.
