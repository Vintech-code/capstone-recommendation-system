# Student loading-skeleton alignment

**Date:** 2026-11-04  
**Implementation status:** COMPLETED  
**Repository validation status:** IN PROGRESS because unrelated baseline failures remain  
**Owning domain:** Shared Student loading presentation

## Decision

The My Matches, Explore Programs, and My Profile loading states use page-specific skeletons instead of a generic centered card or generic three-column grid. Each skeleton preserves the main geometry of the content that replaces it:

- My Matches mirrors the illustrated result summary, RIASEC score panel, career guidance, and ranked split rows.
- Explore Programs mirrors the catalogue hero, filter sidebar, search and sort toolbar, and responsive two-column programme cards.
- My Profile mirrors the breadcrumb and action row, editor tabs, Student identity, personal fields, RIASEC summary, and navigation actions.

Skeleton blocks use semantic design tokens, the final component radii and responsive breakpoints, and reduced-motion-safe animation. They remain content-neutral and do not display fabricated programme, assessment, or profile values.

The Student workspace also remembers the last active module for the signed-in Student in tab-scoped session storage. Refreshing while My Matches is active therefore restores My Matches before its data request completes and shows the matching recommendation skeleton. The stored value is account-scoped, restricted to known module identifiers, and removed on sign-out. If browser storage is unavailable or invalid, the workspace safely falls back to the assessment module.

## Validation

Evidence recorded on 2026-11-04:

- Four affected component suites passed: 34 tests covering the shared loading component, Student profile, recommendations, and programme catalogue.
- Focused ESLint passed for the shared skeleton primitive, loading component, loading tests, Student profile integration, and browser workflow.
- The frontend architecture check and production build passed. The build retains the existing large-chunk advisory.
- The controlled slow-response Playwright workflow passed in desktop and mobile Chrome. It verified the expected regions for all three loading layouts, checked mobile document overflow, and captured full-page rendered evidence for comparison with the loaded screens.
- A separate refresh-regression workflow passed in desktop and mobile Chrome. It verified that My Matches remains the active module after refresh and that the recommendation score skeleton is rendered during the restored request.
- Three focused Student workspace-state unit tests passed for account isolation, invalid-value fallback, and sign-out cleanup. Together with the affected loading and recommendation suites, the latest focused run passed 27 tests.
- Rendered review confirmed that the skeletons preserve the finished pages' desktop/mobile columns, major surfaces, spacing, and responsive stacking. The skeleton tone remains visible on both open canvas and card surfaces.
- Skeleton animation now respects `prefers-reduced-motion`.
- The full frontend suite completed with 151 passed, 4 skipped, and 3 unrelated baseline failures in `theme.test.tsx`, `authentication.test.tsx`, and `access-routes.test.tsx`.
- Full lint remains blocked by the existing Fast Refresh export violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`; neither file belongs to this loading-state slice.
- The in-app browser controller was unavailable, so rendered evidence used the repository's Playwright desktop/mobile projects.

## Remaining blockers and risks

- The three existing full-suite failures and two Admin lint violations remain a separate frontend-baseline task.
- No scoring, API contract, authentication, or Student record behavior changed. The only new persistence is tab-scoped presentation state for the active workspace module.
