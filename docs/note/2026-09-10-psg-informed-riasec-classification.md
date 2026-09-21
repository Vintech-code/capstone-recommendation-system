# PSG-informed three-code RIASEC classification

**Date:** 2026-09-10  
**Implementation status:** IMPLEMENTED pending rendered browser review  
**Methodology status:** PROPOSED PSG-informed analytical classification  
**Repository-owner direction:** Follow `PSG_Informed_RIASEC_Classification.xlsx`, return three leading Student RIASEC codes, and keep BS Community Development pending while its authoritative programme basis is still being processed.

## Evidence reviewed

- Visually reviewed every sheet in `PSG_Informed_RIASEC_Classification.xlsx` and extracted its cell values.
- Reviewed all eight PDFs currently stored in `docs/cmo/`. Seven scanned CMOs required page-by-page OCR; `SHS_LCS_Q3_LE1.pdf` contained extractable text.
- The available CMO set covers BSBA, Hospitality Management, Information Technology, Library and Information Science, Elementary Education, Sociology, and Midwifery. The directory does not currently contain the matrix-listed CMO No. 5, s. 2018 for Criminology, CMO No. 75, s. 2017 for BSEd, or CMO No. 80, s. 2017 for BPEd. Their classifications therefore follow the supplied workbook and retain its analytical, non-official status.
- No corresponding Community Development PSG is present. No Community Development code or percentage is inferred from other programmes or from general career-learning material.

## Versioned decision

- New Student result presentations use the three highest recorded dimensions in descending score order. Stable `R-I-A-S-E-C` order resolves equal scores. The API code remains hyphen-delimited, such as `I-C-S`.
- Classified programmes require exactly three unique valid RIASEC dimensions. The ordered matrix profiles are:
  - BS Information Technology: `IRC`
  - BS Business Administration - Financial Management: `ECI`
  - BS Criminology: `IRS`
  - BS Hospitality Management: `ESC`
  - Bachelor of Elementary Education: `SAC`
  - Bachelor of Secondary Education: separately ranked English `SAI`, Filipino `SAI`, and Social Studies / Araling Panlipunan `SIE` entries
  - BS Midwifery: `SIR`
  - Bachelor of Library and Information Science: `CIS`
  - BA Sociology: `ISA`
  - Bachelor of Physical Education: `SRE`
- BS Community Development remains in the catalogue with `pending_authoritative_psg_basis`, an empty RIASEC profile, and no rank or match. Recommendation snapshots store and expose it separately under `pendingProgrammes` so the pending state remains visible and historical runs do not gain a fabricated score.
- Current catalogue version after the 2026-09-20 major-profile correction: `TCC-AY-2026-2027-V4`.
- Matching rule: `PROPOSED-RIASEC-3-PSG-MATRIX`.
- Profile version: `PSG-MATRIX-2026-09-10`.

## Boundaries and risk

- These codes are not official CHED-issued RIASEC classifications and are not psychometrically validated.
- Programme profile order records strongest-to-supporting alignment from the workbook, but the current match calculation remains the existing equal-membership mean; it does not weight primary, secondary, and tertiary codes differently.
- Existing recommendation runs retain their stored catalogue, rule, ranked-course, and pending-programme snapshots. The new migration adds only a nullable snapshot field.
- Community Development must remain unranked until an authoritative programme standard is supplied and a new versioned classification is reviewed.

## Validation

- Laravel targeted catalogue, recommendation-engine, recommendation API, and Student profile tests: 25 passed, 410 assertions.
- Frontend targeted recommendation and dashboard tests: 25 passed, 4 skipped.
- Full Laravel suite: 111 passed, 927 assertions. Administrator workspace regression: 3 passed, 41 assertions.
- Frontend lint and production build: passed.
- Full frontend suite: 124 passed, 4 skipped, and 4 failed. The remaining failures are in pre-existing visual/theme and Administrator-history assertions outside this change; targeted recommendation and dashboard coverage passed.
- Local database migration `2026_09_10_230000_add_unranked_programmes_to_recommendation_runs` ran successfully.
- Rendered desktop/mobile browser evidence remains unavailable because the in-app browser could not start. Keep this work IN PROGRESS until that visual review is completed.
