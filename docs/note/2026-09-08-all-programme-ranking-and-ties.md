# All-programme ranking and tie handling

**Date:** 2026-09-08  
**Implementation status:** IMPLEMENTED pending rendered browser review
**Methodology status:** PROPOSED  
**Repository-owner direction:** Show every configured programme from highest to lowest recorded RIASEC match and correct misleading tie presentation.

**2026-09-10 superseding classification boundary:** Ten programmes now have the required three-code PSG-informed analytical profile and remain ranked. BS Community Development stays visible separately as classification pending and receives no fabricated rank or percentage until its authoritative programme basis is available. New runs use `PROPOSED-RIASEC-3-PSG-MATRIX`; see `2026-09-10-psg-informed-riasec-classification.md`.

## Decision

- Rank all 11 programmes in the current catalogue. The self-declared entrance examination group remains recorded and visible as separate guidance; it no longer removes the other group from the RIASEC ranking.
- Keep the current versioned equal-membership mean. Every current RIASEC category has seven binary questions, so each raw category score is normalized with `100 * raw_score / 7` before the programme profile mean is calculated.
- Equal percentages are valid when two programme profiles have the same mean. Uniform Student scores, including seven Agree answers in every area, necessarily give every programme the same percentage.
- Use competition ranks for exact ties: two equal leaders are both rank 1 and the next programme is rank 3. Sort names alphabetically only to make the display order deterministic inside the tie.
- Show `Strong match`, `Good match`, or `Explore match` for the displayed percentage using the existing presentation bands: 80-100, 60-79.99, and below 60. The exact percentage remains visible beside the label.
- Show the exact stored percentage to at most two decimal places rather than rounding every value to a whole number.

## Historical evidence boundary

Existing recommendation runs remain immutable. The all-programme rule reference is `PROPOSED-RIASEC-2-ALL-PROGRAMMES` for newly generated runs; older snapshots retain their recorded rule and programme set.

## Validation

- Laravel focused tests pass: 13 tests and 111 assertions, including fresh all-programme output and competition-rank tie handling.
- Frontend recommendation tests pass: 12 tests.
- Frontend lint passes.
- Frontend production build passes.
- The current catalogue contains 11 programmes; newly generated recommendation runs persist all 11 valid programme profiles in descending raw match order.
- Existing recommendation runs remain immutable. A historical run generated before this change can still contain its earlier programme set by design; it must not be silently rewritten.
- Real-browser desktop/mobile review remains outstanding.
