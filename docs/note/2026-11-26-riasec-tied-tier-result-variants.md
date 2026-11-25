# RIASEC tied-tier result variants

**Status:** IN PROGRESS because repository-wide frontend lint and tests retain unrelated baseline failures and the Playwright runner requires manual shutdown after reporting passing cases.
**Date:** 2026-11-26.
**Owner:** Assessment result-presentation domain.
**Methodology status:** Repository-owner-approved for local implementation; external institutional and psychometric review remains required.

## Confirmed rule

Student result codes preserve the hierarchy and complete membership of tied primary and secondary score tiers.

- With no relevant tie, return the single ordered top-three result.
- Permute tied primary areas only within the primary tier. When three or more areas share the primary score, include every tied primary area, so the result may contain three through six codes.
- Keep a fixed primary first and permute all tied secondary areas after it. Three or more tied secondary areas therefore produce a four- or longer code.
- When primary and secondary are each fixed, treat tied tertiary areas as alternative third codes. Do not combine those tertiary alternatives into a longer code.
- Never move a lower score tier ahead of a higher score tier.

Confirmed examples:

- `R6 I6 A3 S4 E5 C2` produces `R-I-E` and `I-R-E`.
- `R6 I6 A6 S4 E3 C2` produces all six permutations of `R-I-A`.
- `R6 I6 A6 S6 E3 C2` produces all 24 four-code permutations of `R-I-A-S`.
- `R5 I4 A4 S3 E2 C1` produces `R-I-A` and `R-A-I`.
- `R5 I4 A4 S4 E3 C2` produces `R-I-A-S`, `R-I-S-A`, `R-A-I-S`, `R-A-S-I`, `R-S-I-A`, and `R-S-A-I`.
- `R5 I4 A3 S3 E2 C1` produces `R-I-A` and `R-I-S`.

The rule reference is `PROPOSED-RIASEC-TIED-TIERS-2026-11-26`.

## Implementation boundary

- Laravel generates the deterministic variants for assessment sessions/cards, Student profile and recommendations, shared results, and protected Administrator assessment responses.
- `topCode` remains the first deterministic variant for compatible consumers.
- Existing two-word profile names remain limited to valid three-code variants. Longer variants display their ordered area labels and do not invent new profile names.
- The UI keeps multiple variants behind one keyboard-operable, bounded disclosure.
- Completed assessment payloads, raw scores, recommendation snapshots, three-code programme profiles, weighted match percentages, programme ranks, and entrance guidance are not rewritten or recalculated.

## Validation evidence

- The complete Laravel suite passes: 151 tests and 1,316 assertions. Focused generator and recommendation coverage includes tied primary, secondary, and tertiary examples, mixed two-tier ties, and all 720 six-way primary permutations.
- The focused Student recommendation suite passes: 19 tests. Changed-file ESLint, Laravel Pint, the frontend architecture guard, and the production build pass.
- The targeted Student Playwright workflow passes on desktop and mobile with keyboard disclosure, four-code variants, bounded scrolling, and no horizontal overflow. The rendered result list was reviewed from both screenshots.
- Repository-wide frontend lint remains blocked by two existing Administrator Fast Refresh errors. The suite excluding the existing stale theme assertion reports 174 passing tests, 4 skipped, and one unrelated Administrator redirect failure; the isolated theme suite retains its existing background-token mismatch. The Playwright process still requires manual interruption after reporting both passing cases because its reused Vite-server session does not shut down cleanly.
