# System architecture

## Repository layout

```text
apps/
  web/                    React 19, TypeScript, Vite, Tailwind v4
    src/app/              application providers
    src/components/ui/    shadcn/Radix primitives
    src/components/shared application-wide components
    src/features/         domain-owned UI, state, and API adapters
    src/services/         cross-feature infrastructure
    src/assets/           bundled images, fonts, animation data
    e2e/                  Playwright system tests
  api/                    Laravel 13 REST API
    app/Http/Controllers/ transport and authorization boundary
    app/Http/Requests/    reusable request validation
    app/Models/           Eloquent persistence model
    app/Services/         domain and integration services
    app/Jobs/             result-processing jobs
    app/Notifications/    in-app notification payloads
    database/             migrations, factories, and seeders
    tests/                PHPUnit unit and feature tests
docs/                     current guides, evidence, and dated records
```

This layout adapts the requested frontend/backend reference to framework conventions. Moving Laravel's `app`, `routes`, `database`, or `tests` into a generic `backend/src` tree would break convention and tooling without adding maintainability.

## Runtime flow

1. `apps/web/src/main.tsx` mounts application providers and the route tree.
2. Public and dedicated portal routes are composed in the auth feature. Protected routes restore the Sanctum session and authorize the requested role.
3. Feature API adapters use the shared `src/services/api-client.ts` transport for credentials, JSON headers, CSRF headers, response parsing, and network errors.
4. Laravel routes in `routes/api.php` apply authentication, active-account, role, ownership, validation, and throttling middleware before controllers run.
5. Controllers delegate scoring, catalogue, location, privacy, notification, reliability, and Administrator presentation/reporting work to services.
6. Eloquent models persist owned records. Versioned JSON snapshots preserve assessment, entrance, catalogue, and recommendation evidence.

## Domain modules

- **Authentication:** local Student registration, individual Administrator login, Student-only Google OAuth, password recovery, session restoration, suspension, and revocation.
- **Assessment:** versioned questionnaire, entrance declaration prerequisite, answer persistence, immutable completion, retryable result processing, and retakes.
- **Recommendation:** locally versioned programme catalogue, deterministic RIASEC engine, ties, pending classifications, saved programmes, and historical snapshots.
- **Student profile:** encrypted/self-owned personal and academic fields, structured PSGC location references, profile media, and derived read-only result content.
- **Administrator:** operational overview, Student directory/detail, catalogue enrichment, ESCO lookup, aggregate reports, and sanitized audit records.
- **Notifications and governance:** result-ready events, batched programme-update events, retention, and encrypted SQLite backup support.

## External integrations

- Google OAuth through Laravel Socialite; it can create or link only Student accounts.
- PSGC Cloud v2 through an explicit sync command; normal profile requests read the local database and cache.
- ESCO occupation API through the authenticated, throttled Laravel Admin boundary; published selections enrich exploration and never affect scoring.
- Mail transport through Laravel for password recovery.

No external AI model or machine-learning inference is part of the implemented recommendation path.
