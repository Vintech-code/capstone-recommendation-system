# Shared assessment result card

**Status:** COMPLETED with automated and rendered-browser evidence  
**Date:** 2026-11-16  
**Owning domain:** Student assessment results with Administrator record access

## Audited cause

The Student and Administrator screens already rendered one shared result-card component, but their dialog containers differed. The Administrator dialog applied `overflow-hidden`, preventing access to content below the viewport. The action labelled **Download (PDF)** only called `window.print()` and did not create a downloadable card file.

## Implemented behavior

- Both entry points retain the shared result-card component and now use the same viewport-bounded vertical scrolling behavior.
- The card action bar remains reachable while the record scrolls, and the duplicate primitive close control is suppressed in favor of the card's labelled close action.
- The card uses the controlled RIASEC color tokens, exact scores, accessible progress labels, clearer record wording, and the recorded Student name, reference, completion date, attempt, current/historical state, interest pattern, and complete six-dimension breakdown.
- **Download card** captures the complete card at two-times pixel density and downloads a PNG. Share, download, and close controls are excluded from the captured image.
- The former browser print/PDF action is removed. The separately proposed interpretation and version-details panel is also omitted by repository-owner direction.

## Validation evidence

- Focused result-card component suite: 4 passed.
- Changed-file ESLint: passed.
- Frontend architecture check: passed.
- Production build: passed with the existing large-chunk advisory.
- Playwright desktop and mobile Chrome: 4 passed across the Student and Administrator card flows, including viewport scrolling, access to the final dimension, and the Administrator PNG download filename.

## Remaining risk

- Downloaded PNG dimensions follow the rendered card width. Very narrow mobile downloads remain complete but naturally use the stacked mobile layout.
