# In-app notification removal

**Status:** IMPLEMENTED with automated validation; migration application and rendered browser review remain pending  
**Decision status:** APPROVED by repository owner request  
**Date:** 2026-09-30

## Scope and boundary

The Student and Administrator panel notification feature is removed. This includes the header controls, anchored feed, frontend API adapter, authenticated read/list endpoints, database notification payload, assessment-result producer, batched programme-update policy, scheduled dispatcher, dispatch model/configuration, tests dedicated to that feature, and active-schema ownership.

Transactional account-security email delivery remains in scope and unchanged. Laravel's password-reset notification plus Administrator invitation and security notifications are retained because removing them would break account recovery, individual Administrator provisioning, and sensitive-account-change warnings; none appears as a Student or Administrator panel feed.

The current worktree has an unresolved `apps/api` and `apps/web` to `apps/backend` and `apps/frontend` relocation. This slice preserves that existing worktree state and does not approve or repair the repository-boundary change.

## Implementation

- Student and Administrator headers no longer import or render the notification center.
- The frontend notification feature module and its dedicated tests were removed, and browser fixtures no longer mock `/api/v1/notifications`.
- Laravel no longer exposes notification list/read routes or dispatches a result-ready event after assessment processing.
- Catalogue publication no longer queues or batches programme-update notifications, and the scheduled notification command was removed.
- The in-app controller, database notification class, notifier service, scheduling service, dispatch model, configuration, and dedicated feature test were removed.
- The historical consolidated baseline is preserved for migration-order and rollback integrity. A forward migration drops `notifications` and `notification_dispatches` for both fresh and previously initialized databases; its rollback recreates the former schema for deployment rollback compatibility.
- The clean-baseline contract now asserts that both tables and both notification endpoints are absent.
- Product, API, database, architecture, roadmap, and design-system documentation now describe the no-panel-notification boundary.

## Validation

- Full Laravel suite passed: 130 tests and 1,140 assertions.
- Focused backend coverage passed before the full run: 49 tests and 314 assertions across schema/routes, assessment processing, catalogue publishing, authentication, and Administrator account-security email delivery.
- Laravel Pint passed for all changed backend files.
- Focused Student shell coverage passed: 9 tests. Focused Administrator shell coverage passed: 1 selected test, with 7 skipped by the name filter. Both assert the absence of notification controls.
- Focused ESLint passed for all affected frontend files.
- Production TypeScript/Vite build passed with the existing large-chunk warning.
- `php artisan route:list --except-vendor` passed and exposes no `/notifications` route.
- Full frontend Vitest completed with 149 passing tests and 4 skipped. Three unrelated existing failures remain: the stale background-token expectation and two Administrator authentication/redirect expectations.
- Full frontend ESLint remains blocked by the existing Fast Refresh export violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`.
- The architecture check remains blocked because its configured `apps/web/src` path does not exist in the relocated worktree.
- `git diff --check` passed.
- The in-app browser was unavailable, so desktop/mobile, keyboard, overflow, console, and rendered-contrast review remains pending.

## Operational follow-up

Migration `2026_09_30_000000_remove_in_app_notifications` is pending in the current local database. Apply it through `php artisan migrate` only after the target environment's required backup and rollback preparation. Applying it permanently deletes existing in-app notification and dispatch records; it does not delete mail delivery configuration or transactional account-security email behavior.
