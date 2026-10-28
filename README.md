# TCC Course Recommendation System

The TCC Course Recommendation System is a responsive decision-support application for incoming Tagoloan Community College Student Applicants. A React frontend presents a Laravel-owned workflow for self-declared entrance examination guidance, a versioned RIASEC assessment, explainable programme matches, catalogue exploration, Student records, and Administrator governance.

The system does not enrol students, guarantee admission, diagnose ability or personality, or make a final course assignment. Researcher-proposed RIASEC programme profiles and the working visual identity must not be described as institutionally or psychometrically approved.

## Repository structure

```text
apps/frontend/  React 19, TypeScript, Vite, and Tailwind CSS presentation app
apps/backend/   Laravel 13 REST API, persistence, policy, and integrations
docs/           Architecture, API, database, operation, and decision records
AGENTS.md       Repository workflow and product constraints
DESIGN.md       UI and interaction source of truth
```

Start with the [documentation index](docs/README.md), [system architecture](docs/architecture/system-overview.md), [development standards](docs/architecture/development-standards.md), [product requirements](docs/requirements/README.md), and [design system](DESIGN.md).

## Prerequisites

Install these tools before cloning the project:

- Git
- PHP 8.3 or newer, with PDO SQLite enabled for the default local setup
- Composer 2
- Node.js 22.13 or newer and npm
- Internet access for the initial dependency installation and Philippine location sync

The default local configuration uses SQLite, so MySQL is not required. MySQL, MariaDB, PostgreSQL, and SQL Server may be configured through Laravel environment variables when needed.

Check the installed tools:

```powershell
git --version
php --version
composer --version
node --version
npm.cmd --version
```

## Clone and install

The commands below use Windows PowerShell. Replace `<repository-url>` with the Git URL supplied by the repository owner.

```powershell
git clone <repository-url> capstone-recommendation-system
Set-Location capstone-recommendation-system
```

### 1. Set up the Laravel backend

```powershell
Set-Location apps/backend
composer install
Copy-Item .env.example .env
php artisan key:generate

if (-not (Test-Path database/database.sqlite)) {
    New-Item -ItemType File database/database.sqlite
}

php artisan migrate --seed
php artisan locations:sync
```

What these commands do:

- Install the locked PHP dependencies.
- Create the untracked local `.env` file and application key.
- Create the local SQLite database when it is absent.
- Create the schema, versioned assessment data, catalogue data, and the two application roles.
- Download the Philippine location hierarchy into the local database. `locations:sync` needs internet access and may take several minutes.

Do not use `migrate:fresh` on a database containing data you need to preserve. It deletes all application tables before rebuilding them.

### 2. Create a local Administrator account

Students can create their own accounts at `/student/register`. To use the Administrator portal locally, run this interactive command from `apps/backend`:

```powershell
php artisan auth:create-local-admin
```

Enter the requested name, email address, and password. Passwords must contain 12 to 255 characters, including uppercase and lowercase letters, a number, and a symbol.

The command is restricted to local and test environments. Never place generated passwords or local test credentials in Git.

### 3. Set up the React frontend

```powershell
Set-Location ../frontend
npm.cmd ci
Copy-Item .env.example .env
```

Keep `VITE_API_ORIGIN` blank for local development. Vite proxies `/api`, `/auth`, `/sanctum`, and `/storage` requests to `http://127.0.0.1:8000`.

## Run the system

Open two PowerShell terminals from the repository root.

Terminal 1 — Laravel API:

```powershell
Set-Location apps/backend
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2 — React frontend:

```powershell
Set-Location apps/frontend
npm.cmd run dev
```

Open the application at [http://localhost:5173](http://localhost:5173).

Useful local URLs:

| Purpose | URL |
| --- | --- |
| Public landing page | `http://localhost:5173/` |
| Student registration | `http://localhost:5173/student/register` |
| Student sign-in | `http://localhost:5173/student/login` |
| Administrator sign-in | `http://localhost:5173/admin/login` |
| Backend health check | `http://127.0.0.1:8000/up` |

Stop either development server with `Ctrl+C` in its terminal.

## Optional local configuration

### Google sign-in

Email and password authentication works without Google credentials. To enable Google sign-in, create OAuth credentials with this callback URL:

```text
http://localhost:8000/auth/google/callback
```

Then configure these values in `apps/backend/.env`:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

Google Student sign-in may create a Student account. Administrator Google sign-in only works for an already-provisioned active Administrator whose email address matches the selected Google account.

### MySQL instead of SQLite

Create an empty MySQL database, then replace the SQLite settings in `apps/backend/.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

Apply the schema and required seed data afterward:

```powershell
Set-Location apps/backend
php artisan migrate --seed
php artisan locations:sync
```

## Validation commands

Backend, from `apps/backend`:

```powershell
composer validate --no-check-publish
vendor\bin\pint --test
php artisan test
```

Frontend, from `apps/frontend`:

```powershell
npm.cmd run check:architecture
npm.cmd run lint
npm.cmd test -- --run
npm.cmd run build
npm.cmd run test:e2e
```

Automated checks do not replace the rendered desktop/mobile, keyboard, overflow, console, contrast, zoom, and reduced-motion review required by `DESIGN.md`.

## Deployment note

For a temporary Vercel deployment, use `apps/frontend` as the Vercel project root, `npm run build` as the build command, and `dist` as the output directory. Set `VITE_API_ORIGIN` to the public origin of the separately hosted Laravel API without a trailing slash. `VITE_*` values are bundled into browser code and must never contain secrets.

Vercel hosts only the Vite application. Laravel, its database, private storage, queues, scheduled tasks, and stateful Sanctum authentication require a separate PHP-capable host. That host must use the real frontend and API origins in `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, session-cookie, and credentialed CORS configuration.

## Troubleshooting

### `could not find driver` during migration

Enable the PHP PDO SQLite extension, then confirm it is loaded:

```powershell
php -m | Select-String -Pattern "pdo_sqlite|sqlite3"
```

Restart the terminal after changing `php.ini`.

### The frontend cannot reach the API

- Confirm Laravel is running on `http://127.0.0.1:8000`.
- Confirm Vite is running on `http://localhost:5173`.
- Keep `VITE_API_ORIGIN` blank for local development.
- Open the application through the Vite URL instead of opening generated files directly.
- If environment values changed, stop and restart both servers.

### Location fields are empty

Run the location sync from `apps/backend` with an active internet connection:

```powershell
php artisan locations:sync
```

Use `php artisan locations:sync --force` only when the existing location catalogue must be refreshed before its seven-day cache period expires.

### Laravel reports a missing application key

```powershell
Set-Location apps/backend
php artisan key:generate
php artisan config:clear
```

### Dependencies appear inconsistent

Use the committed lock files instead of updating package versions during setup:

```powershell
Set-Location apps/backend
composer install

Set-Location ../frontend
npm.cmd ci
```

## Security and repository hygiene

Never commit:

- `apps/backend/.env` or `apps/frontend/.env`
- API keys, OAuth secrets, mail credentials, or database passwords
- Local account passwords or generated credentials
- Production Student data, database exports, private media, or backup keys
- `vendor`, `node_modules`, build output, test reports, or runtime logs

Use the tracked `.env.example` files as templates. Laravel remains authoritative for authentication, authorization, ownership, validation, scoring, entrance grouping, recommendation generation, persistence, and audit records.

## Current product boundaries

- Exactly two roles are implemented: Student Applicant and Administrator.
- Student and Administrator authentication use dedicated portal URLs; role selection is not user-controlled.
- All classified programmes are ranked by RIASEC fit; entrance grouping is presented as separate guidance.
- BS Community Development remains visible with classification pending and receives no fabricated rank or match.
- CMO-grounded programme facts are source-controlled; ordinary Administrator edits are limited to permitted enrichment and media.
- ESCO supplies optional career-exploration references only and never affects Student scores or programme rank.

See [SYSTEM-IMPROVEMENT-ROADMAP.md](SYSTEM-IMPROVEMENT-ROADMAP.md) and the dated records in `docs/note/` for current progress, evidence, risks, and unresolved external-review items.
