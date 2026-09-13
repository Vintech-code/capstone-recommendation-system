# Ranked match reference layout

**Status:** COMPLETED

## Scope

The Student **All ranked matches** list now follows the approved reference-inspired split composition without changing recommendation data or rules.

- Ranks 1–3 use pastel fields whose desktop widths step down from first to third.
- Programme summary rows omit the programme code, repeated RIASEC explanation, and interest-area chips so the list stays compact.
- Rank labels, programme titles, summaries, percentages, and controls use the compact reference hierarchy and reduced vertical spacing.
- Ranks after the top three use plain rows without a colored field.
- The right rail retains the Laravel-provided exact percentage, `Recorded match`, accessible progress value, and functional programme-detail action. Eligibility remains in the detailed programme flow.
- Mobile stacks the programme and match regions within one rounded surface for the top three.

## Validation

- Focused recommendation component tests cover compact content, accessible match values, the descending top-three widths, and the plain fourth rank.
- Frontend lint and production build were run after the implementation.
- The assessment-to-recommendation Playwright flow passed in desktop Chrome and mobile Chrome with no horizontal overflow or console errors.
- Desktop and mobile element screenshots were inspected. The in-app browser connection was unavailable, so the repository Playwright browsers supplied the rendered evidence.
