# UHCC RIASEC questionnaire replacement

**Date:** 2026-09-08  
**Implementation status:** IN PROGRESS pending rendered browser verification  
**Institutional/psychometric status:** PROPOSED  
**Repository-owner direction:** Replace the previous locally authored questionnaire with the 42-item RIASEC checklist shown in the repository asset and follow its checkbox-count scoring rule.

## Source and version

- Active instrument code: `tcc-uhcc-riasec-42-v1`
- Content version: `riasec-assessment-asset-v1`
- Local reference asset: `apps/web/src/assets/questionnaires/riasec-assessment.png`
- Source: [University of Hawaii Community Colleges Career Explorer RIASEC assessment](https://careerexplorer.hawaii.edu/assessments/riasec_multiLang.php)
- Accessed: 2026-09-08
- Status stored with the instrument: `proposed`

The source selection is a repository implementation decision. It is not evidence of TCC approval, local validation, psychometric validation, or permission to make institutional adoption claims. Source/licensing review remains required before production publication.

## Fresh-database replacement boundary

The repository owner explicitly directed a fresh local-database reset. The baseline assessment migration now stores only the 42 statements from `riasec-assessment.png`, in source order. The earlier `tcc-riasec-42-v1` and `onet-mini-ip-30` assessment instruments are removed from the fresh database and are no longer supported by the active application contract. All prior local users, attempts, answers, results, recommendations, and other application rows were deleted by `php artisan migrate:fresh --seed --force`.

## Formula

For every question:

- `Agree` = 1 point in the question's server-stored RIASEC category.
- `Do not agree` = 0 points.
- Client requests contain response values only; they never contain category mappings.

For each category `d` in `R, I, A, S, E, C`:

`raw_score(d) = count of questions mapped to d whose response is Agree`

Every category has exactly seven questions. Therefore each raw category score ranges from 0 through 7. The proposed programme-matching normalization is:

`normalized_score(d) = 100 * raw_score(d) / 7`

Programme eligibility filtering remains separate and runs before the existing proposed, equal-membership RIASEC programme-profile comparison.

## Implementation record

- Consolidated the selected instrument into the baseline questionnaire migration so a fresh database contains no old assessment instrument rows.
- Stored local-asset and upstream-source provenance plus scoring configuration with the assessment instrument.
- Updated the active Laravel assessment contract and server-side scoring result metadata.
- Updated recommendation normalization for the new 0-7 range and removed old assessment-instrument compatibility.
- Added visible questionnaire-source attribution to the Student assessment flow.
- Updated backend, frontend, and end-to-end fixtures for the single current instrument.

## Validation evidence

- Laravel assessment, persistence, recommendation, Student profile, Administrator workspace, notification, entrance-result, and catalogue tests: 51 passed (579 assertions).
- Student assessment component tests: 16 passed.
- Frontend ESLint: passed.
- Frontend production build: passed.
- Laravel Pint on affected PHP files: passed.
- Local MySQL `db_psychometric` was reset with `php artisan migrate:fresh --seed --force`.
- Post-reset counts: one assessment instrument, 42 assessment questions, zero assessment sessions, and zero recommendation runs. The seed restored two individual development accounts and the two approved application roles.

## Remaining evidence

- Real-browser verification is still required at desktop and mobile widths, including keyboard focus, overflow, source link, saving states, and the result transition. The in-app browser was unavailable during this task.
