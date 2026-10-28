# Clone and local setup guide

**Status:** COMPLETED  
**Recorded:** 2026-10-28  
**Scope:** Root repository onboarding documentation only

## Change

The root `README.md` now provides a clone-to-running Windows PowerShell guide based on the current `apps/backend` and `apps/frontend` repository layout. It documents prerequisites, locked dependency installation, the default SQLite setup, migrations and required seed data, Philippine location sync, local Administrator provisioning, frontend startup, portal URLs, optional Google and MySQL configuration, validation commands, troubleshooting, and secret-handling boundaries.

The previous product overview, authority boundaries, and deployment guidance remain represented. Obsolete `apps/api` and `apps/web` setup paths were removed from the root guide.

## Evidence

- Commands, paths, ports, proxy targets, routes, environment keys, migration behavior, seed behavior, and the local Administrator command were checked against current repository source and configuration.
- Markdown links in the root guide resolve to existing repository files.
- `git diff --check` passed for the documentation slice.

## Boundaries

- No application behavior, database state, dependencies, credentials, or environment files were changed.
- The guide uses a `<repository-url>` placeholder because no canonical remote URL is recorded as repository authority.
- Dependency installation, fresh-clone execution, live PSGC synchronization, and browser startup were not performed as part of this documentation-only slice.

