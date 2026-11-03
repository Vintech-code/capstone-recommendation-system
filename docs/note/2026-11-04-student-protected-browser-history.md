# Student protected browser history

**Status:** IN PROGRESS.  
**Date:** 2026-11-04.  
**Owner:** Student authentication and workspace navigation.

## Problem

The Student workspace previously rendered its primary sections as component state under one `/student` URL. Browser Back therefore had no Student section entries to revisit. A first repair added Student routes but still launched Google OAuth in the main tab, so repeated Back navigation could eventually expose Google's account chooser even though the Laravel session had not been explicitly ended.

## Implemented slice

- Give the authenticated Student sections stable protected routes: `/student`, `/student/programmes`, `/student/matches`, `/student/profile`, and `/student/history`.
- Push a route entry when the Student changes sections, so browser Back returns to the preceding authenticated Student section.
- Preserve the last active Student section for refresh and same-user restoration without changing the server-owned session or authorization checks.
- Keep session termination limited to the explicit Sign out workflow; browser navigation does not call the logout endpoint.
- Open Google authorization in a separate popup or browser-managed secondary tab. The main localhost tab never navigates to Google, so provider pages cannot enter its Back history.
- Carry a random flow identifier through the Laravel session and callback. The frontend completion route publishes the result only on that flow's same-origin `BroadcastChannel`; the original tab ignores mismatched flows and portals.
- Restore the authenticated Student or Administrator route in the original tab with history replacement. Do not inspect `window.closed`, avoiding the earlier Cross-Origin-Opener-Policy warning path.
- Keep the forced Google account chooser, server-owned role boundary, session regeneration, and explicit-only logout behavior unchanged.

## Evidence

- Focused Vitest: 7 tests passed across the popup navigation, popup completion, and Student workspace-state suites.
- Focused Laravel Google authentication suite: 15 tests passed with 71 assertions, including popup success and failure callbacks.
- Changed-file ESLint: passed.
- Frontend architecture check: passed.
- Frontend production build: passed, with the existing large-chunk advisory.
- Playwright assertions for `/student/matches` -> `/student/programmes` -> browser Back -> `/student/matches` displayed as passing on desktop and mobile and observed no logout request. The runner later became unstable while shutting down, so a clean browser-suite exit was not obtained.
- A focused popup-history Playwright check exposed and then verified the repair for the `/auth` Vite-proxy collision by moving completion to `/google-auth/complete`. The final rerun produced no assertion failure artifacts, but the Windows Playwright process again stalled during shutdown and required interruption.
- The in-app browser was unavailable. A live Google-provider round trip and rendered account-chooser Back check remain pending.

## Remaining verification

Run one desktop and one mobile-width manual check against the configured Google OAuth client: confirm Google opens separately, the original tab reaches the protected Student home after selection, and repeated Back navigation in the original tab never displays Google. Until that external-provider check and a clean browser-runner exit are recorded, this slice remains IN PROGRESS rather than COMPLETED.

## Risks

- Browser history entries that predate this change cannot be rewritten retroactively; close the old localhost tab and begin verification from a fresh tab after restarting or refreshing the updated frontend.
- Browsers configured to block popups will keep the main tab in place and show an actionable error instead of falling back to main-tab OAuth.
- Repeated Back navigation beyond the first Student workspace entry can still leave the application, as normal browser history does. Protected Student URLs continue to require a valid server session and role authorization.
