# Functional Requirements

**Purpose:** Define traceable product behavior without inventing institutional rules.  
**Status:** PROVISIONAL.  
**Basis:** Proposal objectives/modules; roadmap, Sections 4-5.  
**Owner:** Capstone team business analyst; approval by relevant TCC owners.  
**Last updated:** 2026-07-29.
**Related IDs:** FR-01-FR-10, US-01-US-18, BR-01-BR-12, D-020.
**Open questions:** Requirement details tied to OQ-001-OQ-012 remain BLOCKED.

| ID | Requirement | Status |
|---|---|---|
| FR-01 | Provide registration, authentication, password recovery, account status, session, and role-based access controls. | PROVISIONAL |
| FR-02 | Let applicants create and update their own profile and one application per admission cycle, subject to approved identity/application rules. | PROVISIONAL |
| FR-03 | Let authorized individual guidance counselors and psychometricians assigned the shared Guidance/Psychometrician/Admin role encode or import official exam results, verify them, and correct them with reason and history, subject to the approved action-level permission matrix. Students have read-only access. | PROVISIONAL |
| FR-04 | Publish only an approved, effective questionnaire version; autosave responses and lock immutable submitted attempts. | BLOCKED on instrument approval |
| FR-05 | Calculate and store all six RIASEC scores and interpretation using the exact approved mapping/scoring version. | BLOCKED on mapping |
| FR-06 | Manage a versioned TCC course catalogue, admission cycles, board-course flags, requirements, course RIASEC profiles, and admission rules. | BLOCKED on official data |
| FR-07 | Generate a deterministic ranked recommendation snapshot with eligibility status, score components, rule/instrument versions, and human-readable reasons. | BLOCKED on rules/weights |
| FR-08 | Let students view results, explore course details, record accept/reject/undecided/other decisions, and obtain an approved report. | PROVISIONAL |
| FR-09 | Let authorized individual users assigned the shared Guidance/Psychometrician/Admin role search/filter applicants, review recommendations, generate reports, and see correction/audit history, with every privileged action attributable to the acting account. | PROVISIONAL |
| FR-10 | Provide authorized administrative lifecycle controls, audit search, exports, operational reporting, and safe archival. | PROVISIONAL |

## Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Responsive, accessible web UI with keyboard use, clear errors, and recoverable forms. |
| NFR-02 | Server-side validation, authorization, ownership enforcement, least privilege, and CSRF/session protection. |
| NFR-03 | Versioned and reproducible recommendation behavior. |
| NFR-04 | Immutable completed assessment and recommendation records; audited corrections. |
| NFR-05 | Encryption in transit, protected secrets, secure password/session handling, and minimal sensitive logging. |
| NFR-06 | Backups, tested restores, monitoring, error handling, and documented rollback. |
| NFR-07 | Data minimization, privacy notice, profiling explanation, rights/correction process, retention, and secure deletion. |
| NFR-08 | Indexed storage and measured performance appropriate to the confirmed hosting plan. |
| NFR-09 | Separate local, staging/UAT, and production configuration with no production data in development. |
| NFR-10 | Automated tests and evidence traceable to requirements and releases. |

Related documents: [Business Rules](06-BUSINESS-RULES.md), [API Contract](10-API-CONTRACT.md), [Testing Strategy](13-TESTING-STRATEGY.md).
