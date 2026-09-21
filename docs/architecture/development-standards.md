# Development and architecture standards

**Status:** APPROVED repository workflow  
**Approved:** 2026-09-14  
**Authority:** `AGENTS.md` governs repository work; `DESIGN.md` governs visual and interaction implementation.

## Purpose

These standards turn the 2026-09-13 audit into the default implementation contract for future frontend and backend work. They preserve framework conventions, make ownership visible, and prevent route files, page components, controllers, generic utilities, and duplicated transport logic from becoming new maintenance hotspots.

## Framework-native layout

```text
apps/web/src/
  app/                 providers and application bootstrap
  components/ui/       shadcn/Radix primitives
  components/shared/   cross-feature application presentation
  features/<domain>/   domain pages, components, hooks, API adapters, and types
  services/            cross-feature infrastructure
  lib/ and utils/      small domain-neutral functions
  assets/              bundled presentation assets

apps/api/
  app/Http/Controllers/ HTTP orchestration
  app/Http/Requests/    reusable validation
  app/Http/Middleware/  request access and cross-cutting guards
  app/Models/           persistence relationships, casts, and scopes
  app/Services/         domain workflows and integrations
  app/Jobs/             asynchronous retryable work
  app/Notifications/    notification payloads
  routes/               declarative route registration
  database/             migrations, factories, and seeders
  tests/                Laravel unit and feature tests
```

Do not reproduce these folders at the repository root. Tests, migrations, assets, and configuration stay with the framework that discovers or consumes them.

## Frontend rules

1. Route and page components compose a workflow. They may coordinate navigation and top-level state but should delegate independently stateful sections and complex interactions to feature components or hooks.
2. Feature modules own endpoint adapters and payload types for their domain. Ordinary HTTP behavior goes through `src/services/api-client.ts`; components never call `fetch` directly.
3. Laravel responses are authoritative. React may format or derive presentation state, but it must not recreate scoring, admission grouping, authorization, ownership, qualitative match thresholds, or catalogue policy.
4. `components/shared` and `components/ui` never import feature modules. Cross-feature services never import React UI. This keeps the dependency graph pointing toward stable lower layers.
5. Keep feature-specific types and helpers in their feature. Promote them only after multiple consumers need the same stable meaning.
6. Build accessible semantics first. Loading, empty, error, permission, blocked, saving, success, keyboard, focus, touch, responsive, reduced-motion, and print behavior are part of the component contract where applicable.
7. Follow `DESIGN.md` through semantic tokens and shared variants. Do not create page-specific design systems, duplicate long class recipes, or place routine component styling in global CSS.

## Backend rules

1. Routes declare URI, middleware, throttling, and controller action. They do not implement workflows.
2. Controllers translate an authorized and validated HTTP request into a service call and response. Repeated validation belongs in Form Requests; reusable workflows, transactions, aggregation, and integrations belong in services.
3. Models express persistence behavior, relationships, casts, scopes, and narrow invariants. They do not depend on controllers or format frontend screens.
4. Services do not depend on HTTP controllers. External integrations stay behind Laravel services with timeouts, safe failure behavior, and tests.
5. Authorization, active-account checks, role boundaries, ownership, validation, scoring, entrance grouping, recommendation generation, and audit behavior remain server-side.
6. Use configuration values through `config()` in application code. Direct `env()` calls stay in Laravel configuration files so cached configuration remains correct.
7. Preserve versioned and immutable evidence. Never rewrite completed assessment, entrance, catalogue, rule, or recommendation history to simplify a new feature.

## Contract-change checklist

When an API or workflow changes, inspect and update the complete path:

```text
route -> middleware/request -> controller -> service/model/job
      -> JSON contract -> frontend adapter/types -> component/state
      -> backend tests + frontend tests + system tests + documentation
```

A partial producer-only or consumer-only migration is not complete. Fixtures and browser mocks must represent the same current contract as Laravel.

## Size and extraction guidance

Line counts are health signals, not design goals. New production TypeScript/TSX modules should normally remain below 500 lines and new Laravel controllers below 350 lines. Existing larger hotspots have explicit caps in the architecture check so unrelated features cannot keep expanding them.

Extract by responsibility when code has one or more of these signals:

- independent async or interaction state;
- a reusable visual or behavioral contract;
- duplicated parsing, validation, formatting, or class recipes;
- multiple unrelated effects or workflows in one component;
- controller aggregation, transactions, or integration logic that can be tested as a service;
- imports crossing several domains to reach internal implementation details.

Do not split a cohesive function into arbitrary tiny files, introduce one-method manager classes, or create generic helpers without a stable shared meaning.

## Required evidence

Use the smallest relevant set, expanding when a contract or UI boundary changes:

- `npm.cmd run check:architecture`
- `npm.cmd run lint`
- `npm.cmd test -- --run`
- `npm.cmd run build`
- `npm.cmd run test:e2e -- --reporter=line` for user-visible workflows
- `vendor\bin\pint --test`
- `php artisan test`
- `php artisan route:list --json` when routes or middleware change
- `composer validate --no-check-publish` when Composer metadata changes

Rendered browser evidence remains separate from unit tests and builds. Record unavailable evidence and keep the affected UI slice IN PROGRESS.

## Reviewed exceptions

An exception must be narrow, dated, and recorded in `docs/note/`. It must identify the violated boundary, why a compliant change is unsafe or out of scope now, tests that protect the temporary state, and the specific follow-up action. Never weaken the global guard merely to make an unrelated feature pass.
