# Risk Register

**Purpose:** Track threats to validity, delivery, security, and defensibility.  
**Status:** PROVISIONAL.  
**Basis:** Roadmap, Section 16, plus source/repository review.  
**Owner:** Capstone project lead; risk owners listed below.  
**Last updated:** 2026-07-27.  
**Related IDs:** R-001-R-013.  
**Open questions:** Each risk tied to an OQ remains active.

| ID | Risk | Likelihood | Impact | Owner | Response |
|---|---|---|---|---|---|
| R-001 | Score direction/thresholds unconfirmed. | High | High | Admission | Resolve OQ-002; configurable versioned rules and boundary cases. |
| R-002 | No valid ML labels/dataset. | High | High | Adviser | Rules baseline; resolve OQ-011; defer or revise manuscript. |
| R-003 | MySQL/PostgreSQL/hosting mismatch. | High | High | Technical lead | Resolve OQ-001 before migrations; hosting proof. |
| R-004 | Instrument or scoring changes without approval. | Medium | High | Psychometrician | Version/approval lifecycle; immutable sessions. |
| R-005 | Inaccurate/self-entered official scores. | High | High | Guidance/Psychometrician/Admin | Authorized Admin-only verification, provenance, correction audit. |
| R-006 | Subjective/incomplete course mappings. | High | High | Psychometrician | Approved rationale/weights and validation cases. |
| R-007 | Scope expands to mobile/enrolment. | Medium | High | Product owner | Enforce responsive-web MVP and change control. |
| R-008 | Broken access control exposes applicant data. | Medium | Critical | Backend/security | Policies, ownership tests, least privilege, security review. |
| R-009 | Host limits or deployment failure. | Medium | High | Operations | Early feasibility, staging, backups, alternate approved host. |
| R-010 | Merge conflicts/uneven workload/document drift. | Medium | Medium | Project lead | Small reviews, ownership, CI, synchronized docs. |
| R-011 | Insufficient UAT/SUS time or sample. | Medium | High | QA/adviser | Confirm schedule/sample early; reserve Sprints 8-9. |
| R-012 | Proposal claims exceed implementation evidence. | High | High | Documentation lead | Evidence register, accurate statuses, manuscript corrections. |
| R-013 | Mobile wrapper choice breaks cookies, downloads, printing, deep links, or platform distribution. | Medium | High | Technical lead | Resolve OQ-014 early; prove one web build in browser and wrapper; avoid native-only feature forks. |

Review risks at every sprint review. Escalate changes in probability/impact and link mitigation evidence. Related: [Open Questions](22-OPEN-QUESTIONS.md), [Current Sprint](16-CURRENT-SPRINT.md).
