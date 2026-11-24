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
    app/Notifications/    transactional account-email payloads
    database/             migrations, factories, and seeders
    tests/                PHPUnit unit and feature tests
docs/                     current guides, evidence, and dated records
```

This layout adapts the requested frontend/backend reference to framework conventions. Moving Laravel's `app`, `routes`, `database`, or `tests` into a generic `backend/src` tree would break convention and tooling without adding maintainability.

File-placement, dependency-direction, clean-code, contract-change, and validation requirements are defined in [Development and architecture standards](development-standards.md).

## Runtime flow

1. `apps/web/src/main.tsx` mounts application providers and the route tree.
2. Public and dedicated portal routes are composed in the auth feature. Protected routes restore the Sanctum session and authorize the requested role. Authenticated Student sections use route-backed browser history, while only the explicit sign-out workflow calls the logout endpoint.
3. Feature API adapters use the shared `src/services/api-client.ts` transport for credentials, JSON headers, CSRF headers, response parsing, and network errors.
4. Laravel routes in `routes/api.php` apply authentication, active-account, role, ownership, validation, and throttling middleware before controllers run.
5. Controllers delegate scoring, catalogue, location, privacy, reliability, and Administrator presentation/reporting work to services.
6. Eloquent models persist owned records. Versioned JSON snapshots preserve assessment, entrance, catalogue, and recommendation evidence; mutable Student feedback remains in a separate owned relation.

## Domain modules

- **Authentication:** split-name local Student registration with signed-link email verification and non-enumerating resend, invitation-based individual Administrator activation, individual Administrator login, role-aware Google OAuth, password recovery, session restoration, suspension, and revocation. Unverified local accounts cannot sign in or enter protected APIs. Google may create or link a Student account only from a provider-verified email, but it may only link an already-provisioned active Administrator whose email matches; it never grants the Administrator role.
- **Assessment:** versioned questionnaire, entrance declaration prerequisite, answer persistence, immutable completion, retryable result processing, deterministic three-code tie-variant presentation, and retakes.
- **Recommendation:** locally versioned programme catalogue, deterministic RIASEC engine, ties, pending classifications, saved programmes, historical snapshots, and private Student-owned per-programme interest-match feedback that cannot alter those snapshots.
- **Student profile:** encrypted/self-owned personal and academic fields, a required unique eight-digit ID number, structured PSGC location references, profile media, and derived read-only RIASEC result content. The former self-reported strengths, growth areas, learning preferences, and derived learning-profile summary are removed.
- **Administrator:** operational overview, Student directory/detail, catalogue enrichment, ESCO lookup, aggregate reports, a separate first-response recommendation-feedback workflow that groups programme responses into current-view numbered anonymous respondents and joins them to complete immutable recommendation snapshots without serializing Student, run, or assessment identity, sanitized audit records, and capability-gated Administrator account governance.
- **Governance and reliability:** retention, audit records, account-security email delivery, and encrypted SQLite backup support. The Student and Administrator panels do not provide an in-app notification feed.

## External integrations

- Google OAuth through Laravel Socialite; every authorization starts with Google's account chooser in a separate popup or browser-managed secondary tab. A session-bound flow identifier returns success or a safe error through a same-origin completion channel, keeping provider URLs out of the main application tab's history. Student authorization can create or link a Student account, while Administrator authorization requires a matching existing Administrator account and cannot create or grant that role.
- PSGC Cloud v2 through an explicit sync command; normal profile requests read the local database and cache.
- ESCO occupation API through the authenticated, throttled Laravel Admin boundary; published selections enrich exploration and never affect scoring.
- Mail transport through Laravel for password recovery.

No external AI model or machine-learning inference is part of the implemented recommendation path.
