# Authentication session bootstrap

**Status:** COMPLETED  
**Date:** 2026-09-12  
**Scope:** Initial browser session restoration

## Change

The application previously called the protected `GET /api/v1/auth/me` endpoint during every initial render. A `401 Unauthorized` response was correct for a signed-out visitor and React handled it as a guest state, but the browser still reported the failed network request in its developer console.

Initial restoration now uses `GET /api/v1/auth/session`. This endpoint returns HTTP 200 with either the active authenticated user or `user: null`. It does not weaken `GET /api/v1/auth/me`: that endpoint remains protected and continues returning 401 to guests. An inactive account is signed out and returned as `user: null` without exposing account information through the public bootstrap response.

Protected portal authorization and all Student and Administrator data endpoints retain their existing authentication, active-account, and role middleware.

## Validation

- Laravel authentication tests: 15 passed, 66 assertions.
- Focused frontend authentication and application-state tests: 15 passed.
- Frontend ESLint: passed.
- TypeScript and Vite production build: passed.
- Focused Laravel Pint formatting check: passed.
- In-app browser connection: unavailable, so repository Playwright was used as the browser fallback.
- Desktop Chrome guest-bootstrap check: passed; exactly one `GET /api/v1/auth/session` response with status 200, no `/api/v1/auth/me` startup request, and no console error.
- The Playwright assertions passed, but the runner required interruption during post-test shutdown; this is not represented as a clean command exit.
