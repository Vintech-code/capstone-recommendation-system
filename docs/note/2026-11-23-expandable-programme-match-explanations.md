# Expandable programme-match explanations

**Status:** COMPLETED with automated and rendered-browser evidence  
**Date:** 2026-11-23  
**Owning domain:** Student recommendation details

## Adviser-directed requirement

The capstone adviser requested a fuller explanation for each RIASEC result shown under **Why this fits you**, including Conventional, Investigative, and the other configured programme areas. The repository owner directed these explanations to remain compact behind a dropdown or labelled control instead of lengthening the page with one permanently expanded card.

## Implemented behavior

- Each configured programme RIASEC area is now an independently expandable disclosure that is collapsed by default.
- The closed row shows the RIASEC code, full area label, and exact recorded Student score with its stored denominator when available.
- The expanded region explains:
  - how the stored assessment score was formed;
  - what the area means using the versioned guidance stored with that assessment result; and
  - why that configured programme area contributes to the selected programme match.
- Current 0-through-7 binary results state the exact number of assessment statements marked **Agree** for that server-mapped area. Historical result shapes retain their stored score and denominator without being rewritten as the current instrument.
- The duplicated catalogue-learning-area row was removed from **Why this fits you** because the authoritative learning areas remain immediately above in **Core learning areas**.
- The disclosure copy states that the result summarizes recorded interests and does not measure ability or guarantee programme success.
- Scoring, recommendation weights, ranking, persisted evidence, and API contracts are unchanged.

## Validation evidence

- Focused recommendation-result Vitest: 1 file and 15 tests passed, including collapsed state, expansion, score formation, stored guidance, programme connection, and axe-core accessibility coverage.
- Changed-file ESLint passed.
- Full frontend ESLint remains blocked only by the two pre-existing Fast Refresh export violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`; no changed file produced a lint error.
- Frontend architecture check passed.
- Production build passed with the existing large-chunk advisory.
- Playwright desktop and mobile Chrome: 2 passed. Coverage includes keyboard activation, expanded/collapsed state, exact score evidence, versioned guidance, programme connection, horizontal overflow, console errors, and axe-core color-contrast, ARIA, and button-name checks.
- Desktop and mobile screenshots were visually inspected; the disclosure remains compact when closed and stacks the three explanation fields without horizontal overflow when opened.

## Remaining blockers and risks

- No implementation blocker remains for this presentation slice.
- The underlying RIASEC instrument, programme classification, and weighted matching methodology retain their recorded PROPOSED status pending external review; this UI does not promote them to institutionally or psychometrically approved rules.
