# Programme-detail scroll reset

**Date:** 2026-11-04  
**Implementation status:** COMPLETED  
**Repository validation status:** IN PROGRESS because unrelated baseline failures remain  
**Owning domain:** Student recommendations

## Decision

Selecting **View programme** from the ranked Student matches opens the selected programme detail at the top of the document. The recommendation list and programme detail are states within one page, so the transition explicitly resets the document scroll position instead of retaining the ranked-list position.

Returning to the matches list remains an ordinary in-page state transition. This slice does not alter recommendation data, scoring, authentication, routes, or browser-history policy.

## Validation

Evidence recorded on 2026-11-04:

- The focused Student recommendation component suite passed: 15 tests.
- Focused ESLint passed for the changed component, its component test, and the Student browser workflow.
- The direct My Matches to programme-detail Playwright workflow passed in desktop and mobile Chrome. Both checks first moved to the bottom of the matches document and then verified `window.scrollY` returned to `0` after selecting **View programme**.
- The frontend production build and architecture check passed. The build retains the existing large-chunk advisory.
- The full frontend test run reported the same three unrelated baseline failures in `theme.test.tsx`, `authentication.test.tsx`, and `access-routes.test.tsx`, then did not exit normally. The focused Student recommendation suite remained green.
- Full lint remains blocked by the existing Fast Refresh export violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`; focused lint for this slice passed.
- The in-app browser controller was unavailable, so rendered evidence used the repository's Playwright desktop/mobile projects.

## Remaining blockers and risks

- No scoring, API, persistence, authorization, or browser-history behavior changed.
- The unrelated frontend baseline failures should be repaired in a separate slice. They do not affect the verified programme-detail scroll transition.
