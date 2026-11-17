# Public landing TCCHOICE footer

**Status:** IN PROGRESS  
**Date:** 2026-11-17  
**Scope:** Public Student landing page only

## Approved change

The public footer adapts the supplied reference's compact information-row and oversized lower-wordmark composition without copying its brand, content, or black palette. The approved `primary-ink` surface, factual Explore links, guidance principles, and small real TCC mark remain.

The former giant low-opacity logo watermark is removed. A native text **TCCHOICE** wordmark now spans the lower footer in the bundled bold display font. The same name appears as the compact brand label in the information row.

No fabricated contact, newsletter, social, policy, copyright, or institutional content was added. Authentication, assessment, recommendation, programme catalogue, and Laravel behavior are unchanged.

## Validation evidence

- Focused landing component coverage passed: 2 tests, including the `TCCHOICE` content and removal of the former logo watermark.
- Focused ESLint passed for the landing component, its component test, and the public landing Playwright specification.
- Frontend architecture validation passed.
- The TypeScript and Vite production build passed.
- The dedicated footer Playwright scenario passed in desktop and mobile Chrome: 2 tests. It verified the bold computed font weight, labelled footer navigation, wordmark containment, removed watermark, and absence of horizontal document overflow.
- Captured desktop and mobile footer screenshots were visually reviewed; the compact upper information row, oversized lower wordmark, responsive stacking, spacing, and dark-green reference adaptation matched the requested direction.

## Remaining review

Final manual keyboard-focus and complete-page rendered-contrast review remains pending. The separate existing white-on-primary action contrast issue prevents the broader landing accessibility scenario from passing and is outside this footer-only slice.
