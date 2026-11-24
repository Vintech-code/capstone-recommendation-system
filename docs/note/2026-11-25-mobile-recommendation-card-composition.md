# Mobile recommendation-card composition

**Status:** IN PROGRESS pending a clean browser-runner exit.  
**Date:** 2026-11-25.  
**Owner:** Student recommendation presentation domain.

## Direction

- Preserve the ranked card's stepped partial pastel field on mobile instead of filling the complete information region.
- Keep the match summary on the neutral card surface and center it at small widths.
- Stack and center the feedback question, five-star control, comment action, and saved response on mobile. Preserve the compact horizontal layout from the `sm` breakpoint upward.
- Center the result-summary heading, explanation, three-code disclosure, leading-area chips, generated metadata, and actions on mobile. Preserve the established left-aligned desktop layout beside the RIASEC score panel.
- Do not change recommendation positions, match percentages, entrance guidance, feedback persistence, or result-profile data.

## Implementation

The ranked highlight now belongs to the programme-information region instead of the full article. Its responsive width steps down across the top three results and retains the existing pastel semantic tokens. Match and feedback sections remain neutral and keep their existing accessible controls.

## Validation evidence

- Focused recommendation component suite: 19 tests passed.
- Changed-file ESLint and architecture checks pass.
- The mobile workflow rendered the partial pastel field, centered match summary, vertically ordered feedback controls, and centered result-summary content without horizontal overflow.
- The production build passes. The Vite size advisory remains unchanged and is not introduced by this slice.
- The complete recommendation workflow passes on desktop and Pixel 7 projects, including feedback save, keyboard interaction, no horizontal overflow, and no captured console errors.
- Playwright reports each selected desktop/mobile case as passed but its reused Vite-server session does not terminate cleanly, so the runner still requires manual interruption after emitting the result.
