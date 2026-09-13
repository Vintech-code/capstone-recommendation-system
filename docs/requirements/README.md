# Product requirements

**Status:** APPROVED repository scope; institutional adoption remains subject to external review.

TCC Pathways is a decision-support application for incoming Student Applicants. It records a self-declared entrance examination result, administers a locally stored versioned RIASEC instrument, and presents explainable programme matches. It does not enrol students, guarantee admission, diagnose personality or ability, or make a final course assignment.

## Implemented roles

- **Student Applicant:** owns a personal account, profile, entrance declaration, assessment attempts, recommendation history, saved programmes, and notification records.
- **Administrator:** uses an individual account to monitor students and assessments, govern programme enrichment and media, view aggregate reports, and review audit activity.

No role-selection form, shared Administrator credentials, counselor portal, or separate native feature implementation is in scope.

## Authoritative boundaries

- Laravel owns authentication, authorization, validation, scoring, admission-group classification, recommendation generation, persistence, and audit records.
- React presents server-owned state and does not invent thresholds, mappings, policy, or results.
- Completed assessments and recommendation snapshots are immutable. Corrections and retakes create auditable history.
- `SELF-DECLARED-TCC-ENTRANCE-2026-01` records 1.0–2.5 as the board-programme guidance group and 2.6–5.0 as the non-board group. The group does not filter the all-programme RIASEC ranking.
- The current 42-item binary instrument is `tcc-uhcc-riasec-42-v1`; each RIASEC area has seven stored questions.
- The PSG-informed three-code programme matrix remains **PROPOSED**. BS Community Development remains visible but unranked while its authoritative basis is pending.
- CMO-grounded programme facts are source-controlled. Administrators may manage proposed SHS guidance, reviewed ESCO mappings, and programme media through the ordinary editor.

See dated records under `docs/note/` for approval history and validation evidence.
