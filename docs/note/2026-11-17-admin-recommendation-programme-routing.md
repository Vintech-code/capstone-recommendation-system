# Selected Administrator recommendation programme routing

**Date:** 2026-11-17  
**Implementation status:** IN PROGRESS pending final manual rendered review  
**Decision status:** APPROVED by the repository owner  
**Owning domain:** Administrator Student evidence and programme monitoring

## Problem

Every `Review Curriculum & Quotas` action in an Administrator Student evidence record navigated to `/admin/programmes`. The action discarded the selected recommendation identifier, so choosing BLIS or another recommendation showed only the general Programme monitoring page.

## Implementation

- Each recommendation action now routes to `/admin/programmes/{programmeId}`.
- Programme monitoring resolves the route identifier against the authoritative catalogue response and opens the matching programme detail sheet.
- Closing a route-opened detail sheet replaces the URL with `/admin/programmes` so the closed sheet does not reopen.
- The behavior is generic for every recommendation identifier; it does not special-case BLIS.

## Validation

- Focused Administrator React coverage passed: 8 tests, including retention of the selected programme identifier and opening its matching detail dialog.
- Focused Playwright coverage passed in desktop and mobile Chrome: 2 tests verifying the exact route and selected programme dialog.
- Changed-file ESLint passed.
- Frontend architecture validation passed.
- The production TypeScript/Vite build passed; Vite retains its existing large-chunk advisory.
- `git diff --check` found no whitespace errors after the implementation.

## Remaining evidence

- Final manual rendered review remains pending. The slice remains IN PROGRESS until that evidence is available.
- The broader existing `access-routes.test.tsx` Administrator sign-in case still times out on the login screen and is outside this programme-routing slice; the route is covered by the passing focused Administrator workspace and browser tests above.
