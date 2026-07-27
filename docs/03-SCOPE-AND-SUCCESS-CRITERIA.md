# Scope and Success Criteria

**Purpose:** Define MVP boundaries and evidence-based completion criteria.  
**Status:** PROVISIONAL.  
**Basis:** Proposal, Chapter 1; roadmap, Sections 2 and 17.  
**Owner:** Product owner/adviser; capstone team implements.  
**Last updated:** 2026-07-27.  
**Related IDs:** FR-01-FR-10, NFR-01-NFR-10, US-01-US-18.  
**Open questions:** Course catalogue, rule thresholds, output count, report form, mobile-wrapper method, and dates remain open.

## MVP scope

- Responsive React web interface and Laravel REST API
- Non-native mobile delivery that wraps the same web codebase, using an approved wrapper/distribution method
- Account lifecycle and server-enforced role access
- Applicant profile and admission-cycle application record
- Admin-controlled official examination result with verification and correction history
- Versioned RIASEC instrument, responses, scores, and submission lifecycle
- Approved TCC course catalogue and versioned admission/course-fit rules
- Deterministic, explainable, versioned recommendation runs
- Student results, decision capture, Admin review, and printable report
- Search, filters, reporting, audit logs, backups, monitoring, and recovery procedures

## Out of scope

- A separate native Android/iOS feature codebase or platform-specific business logic
- Automatic enrolment or final course assignment
- Recommendations for non-TCC programs
- Psychological diagnosis or treatment
- Generative-AI recommendations
- Long-term outcome prediction in the MVP
- Unvalidated ML presented as production logic

## Success criteria

Targets are PROVISIONAL until accepted:

| Area | Criterion |
|---|---|
| Functional | 100% of APPROVED P0 stories implemented; at least 95% of approved cases pass before UAT, with no open critical defects. |
| Reproducibility | Identical verified inputs and rule/version snapshots yield identical rankings. |
| Validity | Psychometrician-approved validation cases show acceptable recommendation agreement; numeric target is BLOCKED. |
| Security | Ownership and role tests prove students cannot access other applicants or modify official results/rules. |
| Usability | SUS is administered to intended users; target remains PROPOSED until adviser approval. |
| Performance | Staging targets: ordinary API requests p95 under 2 seconds and recommendation generation under 3 seconds; confirm against hosting capacity. |
| Reliability | Interrupted forms are recoverable and duplicate submissions are prevented. |
| Operations | HTTPS, monitoring, backup, restore evidence, rollback plan, manuals, and approved launch checklist exist. |

No UAT, SUS score, deployment, or launch is currently claimed. See [Testing Strategy](13-TESTING-STRATEGY.md) and [Defense Readiness](21-DEFENSE-READINESS.md).
