# Backend clean baseline and two-role audit

**Status:** COMPLETED locally  
**Date:** 2026-09-16  
**Scope:** Laravel migrations, routes, services, persistence, React API consumers, automated checks, and the local development database

## Approved outcome

The repository owner approved replacing the historical migration chain with a clean active-schema baseline and resetting the local development database after a verified backup. The application continues to implement exactly two roles: `Student Applicant` (`student`) and `Administrator` (`admin`). A database uniqueness constraint now prevents any user from holding more than one role assignment.

The former counselor/guidance-staff role, counselor portal, appointments, guidance cases, counselor assignments, personal API-token persistence, programme-source registry, forced temporary-password flag, and their obsolete migration history are not present in the baseline.

## Migration baseline

The active schema is grouped into four cohesive migrations:

1. core users, browser sessions, password recovery, cache, and queue infrastructure;
2. roles, Administrator governance, catalogue configuration, audit, and notifications;
3. Student profile and PSGC location persistence;
4. versioned assessment, entrance declaration, and recommendation evidence.

The fourth migration also installs the active `tcc-uhcc-riasec-42-v1` instrument with 42 questions, so a fresh database is immediately assessment-capable.

## Removed unused contracts

End-to-end route/controller/service/client/test tracing established that the following were not used by an active frontend workflow and were removed together:

- duplicate `GET /api/v1/auth/me` current-user endpoint;
- direct score-only `POST /api/v1/student/assessments/riasec/results` endpoint;
- duplicate `GET /api/v1/student/profile/riasec-result` endpoint;
- duplicate `POST /api/v1/student/profile` alias (the client uses `PUT`);
- configuration rollback endpoint and unused methodology configuration mode;
- programme-source registry endpoints, model, table, and service;
- unused report and overview fields with no React consumer;
- default framework `inspire` command.

The active assessment-session, historical result, catalogue publishing, password recovery/change, notifications, ESCO, and Administrator governance workflows were retained.

## Safety and reset evidence

- An encrypted MySQL backup was created under `apps/api/storage/app/private/backups/` before the reset.
- `php artisan system:verify-backup` successfully decrypted, restored, and integrity-checked the backup before schema deletion.
- `php artisan migrate:fresh --seed --force` completed against local MySQL database `db_psychometric`.
- Post-reset migration status shows exactly four baseline migrations in batch 1.
- Post-reset counts showed two users, two exclusive role assignments, two role rows, one assessment instrument, and 42 questions.
- Removed tables were absent from the target schema.
- `php artisan locations:sync` then restored the local PSGC catalogue: 17 regions, 82 provinces, 1,656 cities/municipalities, and 42,027 barangays.

## Validation

- PHP syntax validation: passed for application, route, and migration files.
- Laravel Pint: passed after formatting.
- Laravel suite after adding clean-baseline contract tests: 129 passed, 1,075 assertions.
- Frontend architecture guard: passed.
- Frontend ESLint: passed.
- Frontend full suite before the final helper-only extraction: 147 passed, 4 skipped.
- Frontend full suite after extraction: 147 passed, 4 skipped.
- TypeScript and Vite production build: passed. Existing font-resolution and large-chunk notices remain non-failing build warnings.
- Focused desktop Chrome Student authentication and Administrator governance assertions passed. The Administrator check exposed a stale invitation-tab test assumption, outdated test password, and insufficient invitation-button contrast; all three were corrected. The Playwright runner stalled during teardown, so these are passing assertions, not a clean process exit. The broader browser suite was interrupted after two other scenarios timed out and is not claimed as passed.

## Operational note

The reset intentionally removed all local Student and assessment records. The verified encrypted backup is the recovery source for the pre-reset state. Local authentication seeding recreated one account per approved role using environment-owned credentials; no credentials are recorded here.

On 2026-09-18, the encrypted backup file remained present. A repeat `migrate:status` check could not connect because the local MySQL service at `127.0.0.1:3306` was stopped; this is an environment availability limit, not a post-reset schema result. Restart MySQL and rerun status/count checks before using the local application.
