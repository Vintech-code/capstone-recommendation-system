# TCC Course Recommendation System

The TCC Course Recommendation System is a responsive decision-support application for incoming Tagoloan Community College Student Applicants. A React application presents a Laravel-owned workflow for self-declared entrance examination guidance, a versioned RIASEC assessment, explainable programme matches, catalogue exploration, Student records, and Administrator governance.

The system does not enrol students, guarantee admission, diagnose ability or personality, or make a final course assignment. Researcher-proposed RIASEC programme profiles and the working visual identity must not be described as institutionally or psychometrically approved.

## Repository structure

```text
apps/web/       React 19 + TypeScript + Vite presentation application
apps/api/       Laravel 13 REST API, persistence, policy, and integrations
docs/           Current guides, architecture, API/database notes, evidence, and history
AGENTS.md       Repository workflow and product constraints
DESIGN.md       UI/UX source of truth
```

The repository keeps framework-native structures. Laravel migrations and PHPUnit tests remain in `apps/api/database` and `apps/api/tests`; React feature tests and Playwright system tests remain in `apps/web/src` and `apps/web/e2e`; runtime assets remain with the application that bundles or stores them.

Start with the [documentation index](docs/README.md), [system architecture](docs/architecture/system-overview.md), [development standards](docs/architecture/development-standards.md), [product requirements](docs/requirements/README.md), and [design system](DESIGN.md).

## Prerequisites

- PHP 8.3 or newer and Composer
- A database supported by the configured Laravel environment
- Node.js and npm compatible with the locked frontend toolchain

Never commit `apps/api/.env`, real credentials, production Student data, private media, database files, or generated local-account passwords. Use the tracked `.env.example` files as templates.

## Backend setup

From `apps/api`:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan locations:sync
composer dev
```

`locations:sync` is required before structured Philippine location choices are available. It reads PSGC Cloud explicitly; normal application requests use the local database and cache.

Optional long-running workers use separate terminals:

```powershell
composer queue
composer schedule
composer logs
```

## Frontend setup

From `apps/web`:

```powershell
npm.cmd install
npm.cmd run dev
```

Vite proxies `/api`, `/auth`, `/sanctum`, and `/storage` to `http://127.0.0.1:8000` during local development.

## Validation

Backend, from `apps/api`:

```powershell
composer validate --no-check-publish
vendor\bin\pint --test
php artisan test
```

Frontend, from `apps/web`:

```powershell
npm.cmd run check:architecture
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
```

## Temporary Vercel deployment

Deploy `apps/web` as the Vercel project root. Vercel should use `npm run build` as the build command and `dist` as the output directory. Set the frontend environment variable `VITE_API_ORIGIN` to the public origin of the separately hosted Laravel API, without a trailing slash. Do not put API secrets in Vercel; `VITE_*` values are bundled into browser code.

Vercel hosts the Vite SPA only. Laravel, its database, storage, queues, scheduled tasks, and stateful Sanctum authentication must remain on a PHP-capable API host. Configure the API host with `APP_URL`, `FRONTEND_URL` set to the Vercel URL, `SANCTUM_STATEFUL_DOMAINS` including the Vercel hostname, and secure HTTPS session cookies. The API host must also allow credentialed CORS requests from the exact Vercel origin.

When the project moves to Hostinger, replace `VITE_API_ORIGIN` with the Hostinger API origin and redeploy the frontend; no frontend code change should be required.

Automated tests and builds do not replace rendered desktop/mobile, keyboard, overflow, console, contrast, zoom, and reduced-motion review required by `DESIGN.md`.

## Current product boundaries

- Exactly two roles are implemented: Student Applicant and Administrator.
- Student and Administrator authentication use dedicated portal URLs; role selection is not user-controlled.
- Laravel is authoritative for role access, ownership, validation, scoring, entrance grouping, recommendation generation, persistence, and audit.
- All classified programmes are ranked by RIASEC fit; the entrance group is separate guidance.
- BS Community Development remains visible with classification pending and receives no fabricated rank or match.
- CMO-grounded programme facts are source-controlled; ordinary Administrator edits are limited to permitted enrichment and media.
- ESCO supplies optional career-exploration references only and never affects Student scores or programme rank.

See [SYSTEM-IMPROVEMENT-ROADMAP.md](SYSTEM-IMPROVEMENT-ROADMAP.md) and the dated records in `docs/note/` for current progress, evidence, risks, and unresolved external-review items.
