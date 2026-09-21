# RIASEC result formula and PSG profile audit

**Status:** IMPLEMENTED with automated validation; direct reinspection of the currently modified workbook, a clean full-frontend lint result, and rendered browser review remain pending  
**Methodology status:** PROPOSED; not institutionally or psychometrically approved  
**Date:** 2026-09-20

## Scope and authority

This audit traced the local 42-item assessment from stored question mappings through raw scoring, result-code ordering, programme normalization, profile matching, ranking, recommendation snapshots, and Student/Admin catalogue consumers. The repository-owner-supplied `PSG_Informed_RIASEC_Classification.xlsx` remains the controlling analytical matrix. The previously reviewed extraction records 12 classified programme-major rows containing 11 distinct ordered three-code profiles because BSEd English and BSEd Filipino both use `SAI`. BS Community Development remains a thirteenth visible catalogue entry with no profile.

The workbook is modified in the current worktree. The spreadsheet artifact runtime required for a fresh workbook inspection was unavailable, and no connected Excel session was present. This implementation therefore follows the documented matrix extraction already recorded in this repository and does not claim that the modified workbook was revalidated in this turn.

## Formula audit

- The instrument stores 42 binary questions with exactly seven mappings for each of `R`, `I`, `A`, `S`, `E`, and `C`.
- `Agree` has stored value `1` and contributes one point to the question's mapped area. `Do not agree` has value `2` and contributes zero.
- Each raw area score is therefore `count(mapped answers equal to Agree)` with an inclusive range of `0..7`.
- The Student result code takes the three highest raw area scores. Exact ties retain canonical `R-I-A-S-E-C` order because the result payload is produced in that order and every result presenter preserves source order as the secondary sort key.
- Programme matching normalizes each raw area with `100 * (score - 0) / (7 - 0)` and calculates the unweighted arithmetic mean of the programme's three configured dimensions.
- Programmes are sorted by descending match. Equal means use competition ranks, with ascending programme name used only for deterministic display order. Entrance-examination group remains separate guidance and does not remove programmes from the RIASEC ranking.

The implemented formula matches the documented `binary-category-count` assessment rule and `equal_membership_profile_mean` recommendation rule. No scoring-formula change was required.

## Defect found and correction

The catalogue previously collapsed all BSEd majors into one top-level `SAI` record. Although the nested data contained Social Studies / Araling Panlipunan `SIE`, the recommendation engine only consumes top-level `riasec_profile`; consequently, `SIE` could never be ranked.

Catalogue version 4 now exposes three independently rankable BSEd entries:

- BSEd major in English: `SAI`
- BSEd major in Filipino: `SAI`
- BSEd major in Social Studies / Araling Panlipunan: `SIE`

All other documented profiles remain unchanged: BSIT `IRC`, BSBA Financial Management `ECI`, BS Criminology `IRS`, BSHM `ESC`, BEEd `SAC`, BS Midwifery `SIR`, BLIS `CIS`, BA Sociology `ISA`, and BPEd `SRE`. The 12 classified entries contain exactly 11 distinct ordered codes.

BS Community Development remains `pending_authoritative_psg_basis`, has an empty `riasec_profile`, is excluded from rank and percentage calculation with `PROFILE_UNAVAILABLE`, and remains visible under `pendingProgrammes`.

The three new BSEd records reuse the existing reviewed BSEd guidance, outlook, image, and previously published editable enrichment through explicit reference keys. Existing recommendation snapshots remain immutable. The ambiguous legacy saved-programme ID `bachelor-secondary-education` is not auto-remapped to a major and is not deleted.

## Validation

- Focused Laravel catalogue, assessment, recommendation-engine, and recommendation endpoint tests passed: 21 tests and 481 assertions. They cover the formula, seven questions per area, the 13-entry catalogue, all 12 ranked profiles, the 11 distinct ordered codes, Social Studies `SIE`, and pending Community Development.
- Full Laravel suite passed: 132 tests and 1,147 assertions. Laravel Pint passed.
- Frontend architecture checks passed. All 147 enabled unit/component tests passed and 4 were skipped. The production build passed with the existing large-chunk warning.
- Full frontend lint remains blocked by two `react-hooks/set-state-in-effect` errors in the already-modified `student-recommendation-results-page.tsx`; this audit did not introduce or alter those lines.
- The in-app browser was unavailable, so desktop/mobile, keyboard, overflow, console, and rendered-contrast evidence remains pending.
