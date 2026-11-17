# Public landing guidance illustrations

**Status:** IN PROGRESS  
**Date:** 2026-11-17  
**Scope:** Public Student landing page only

## Approved change

The **What We Provide** section replaces its four Lucide icon cards with the repository-owner-supplied `compass.png`, `clipboard.png`, `chart.png`, and `filetext.png` artwork. Each item now follows the established RIASEC presentation pattern: transparent PNG artwork on the open section canvas, followed by its existing title and factual description.

The layout uses two columns on mobile and four columns from the large breakpoint. The images are decorative because the adjacent headings and descriptions carry the complete meaning. The section remains statically visible and does not restore the removed intersection-observer or staggered reveal.

No authentication, assessment, recommendation, programme catalogue, or Laravel behavior changed.

## Validation evidence

- Focused landing component coverage passed: 2 tests, including the four ordered PNG mappings and decorative alternative-text boundary.
- Focused ESLint passed for the landing component, its component test, and the public landing Playwright specification.
- Frontend architecture validation passed.
- The TypeScript and Vite production build passed.
- The focused mobile Chrome scenario passed with a clean runner exit. It confirmed two guidance columns, four rendered PNGs, visible static section content, no horizontal overflow, and preserved menu and FAQ behavior.
- The captured mobile section screenshot was visually reviewed; image sizing, text alignment, two-column flow, and the card-free presentation matched the requested direction.

## Remaining review

Final manual keyboard-focus and rendered-contrast review remains pending. The full landing accessibility scenario continues to report the existing white-on-primary button contrast issue, which is outside this illustration-only slice.
