# RIASEC result explanation and scoring audit

**Status:** UI explanation implemented; recommendation normalization requires a separate approved correction.  
**Recorded:** 2026-08-30.  
**Instrument:** `tcc-riasec-42-v1` (`researcher-questionnaire-v1`, PROPOSED).

## How the current result is produced

- Each of the 42 stored statements belongs to one Holland/RIASEC category: Realistic, Investigative, Artistic, Social, Enterprising, or Conventional.
- **Agree** adds one raw point to the statement's stored category; **Do not agree** adds zero.
- The result service orders the six raw category counts from highest to lowest and stores the first two category codes as the displayed top code. Stable R-I-A-S-E-C order resolves equal raw counts.
- Proposed, versioned category descriptions explain what activities a Student may enjoy. They do not diagnose personality, aptitude, intelligence, or likely success.
- Programme eligibility is filtered first by the separate entrance-examination group. The recommendation engine then compares RIASEC results with researcher-proposed programme profiles.

## Important scoring audit finding

After removal of source questions 1, 7, and 14, the stored questionnaire has unequal category counts:

| Category | Available statements |
| --- | ---: |
| Realistic | 4 |
| Investigative | 8 |
| Artistic | 8 |
| Social | 7 |
| Enterprising | 8 |
| Conventional | 7 |

The current programme catalogue still normalizes with the legacy 5-25 range. That range does not match the current binary-count instrument. Therefore, existing programme-match percentages remain **PROVISIONAL** and must not be described as validated Holland-model fit.

## Required next decision

A researcher or qualified reviewer must approve a versioned normalization and tie policy for the unequal category counts. Implementation must then update the catalogue matching policy, engine, stored rule reference, fixtures, tests, explanations, and historical-version handling together. Until then, the UI may explain raw recorded counts and proposed category descriptions but must not invent an archetype, personality label, trait list, or psychometric conclusion.
