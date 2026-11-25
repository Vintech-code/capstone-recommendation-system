# Three-code RIASEC tie variants

**Status:** SUPERSEDED on 2026-11-26 by `2026-11-26-riasec-tied-tier-result-variants.md`; retained as historical implementation and validation evidence.
**Date:** 2026-11-24.  
**Owner:** Assessment result-presentation domain.  
**Methodology status:** Repository-owner-approved for local implementation; external institutional and psychometric review remains required.

## Confirmed rule

Student results must remain three-code profiles instead of presenting one four-, five-, or six-letter code.

- With no highest-score tie, keep the single ordered top-three result.
- With exactly two tied highest areas, treat each tied area as an alternative first code. Build the leading pool from the three highest distinct score tiers, choose every pair from the remaining leading areas, and emit both orders of that pair.
- With three or more tied highest areas, emit every ordered three-code permutation from the tied highest group.
- Every emitted code contains three distinct RIASEC areas.

The owner-confirmed example `R6 I6 A5 S4 E3 C1` produces `R-A-S`, `R-S-A`, `I-A-S`, and `I-S-A`. A two-primary five-code leading pool produces 12 variants; a two-primary six-code leading pool produces 24. Five- and six-way highest-score ties produce 60 and 120 ordered triples respectively.

The rule reference is `PROPOSED-RIASEC-PROFILE-VARIANTS-2026-11-24`.

## Implementation boundary

- Laravel owns deterministic generation and exposes the same variant contract to assessment sessions/cards, Student profile and recommendation responses, shared results, and protected Administrator assessment responses.
- `topCode` remains the first deterministic variant for compatibility; consumers that explain ties use the complete variant list.
- Each variant uses the existing `PSG-PROFILE-NAMES-2026-09-21-V2` presentation-name and explanation catalogue.
- The Student result page uses one collapsed, keyboard-operable result-count disclosure. Opening it shows every three-code code, name, and explanation in a bounded scroll region.
- Completed assessment payloads, raw scores, recommendation snapshots, programme profiles, weighted match percentages, programme ranks, and entrance guidance are not rewritten or recalculated by this presentation rule.

## Validation evidence

- The complete Laravel suite passes: 147 tests and 1,301 assertions, including 4-, 12-, 24-, 60-, and 120-result generator cases.
- The focused Student recommendation/result-card component suites pass: 22 tests.
- Changed-file frontend ESLint, Laravel Pint, the architecture check, and the production build pass.
- The main desktop/mobile Student workflow passes with keyboard expansion of all four confirmed example codes. Rendered screenshots show the bounded disclosure without horizontal overflow.
- Desktop and mobile keyboard, responsive, contrast, and printable-page smoke assertions pass. The first desktop print-size attempt was transiently below its existing threshold; its isolated rerun passed.
- Repository-wide frontend ESLint remains blocked by two pre-existing `react-refresh/only-export-components` errors in Administrator files outside this slice. Playwright reports each selected test as passed but does not terminate its reused Vite-server session cleanly, so the process requires manual interruption after the results are emitted.
