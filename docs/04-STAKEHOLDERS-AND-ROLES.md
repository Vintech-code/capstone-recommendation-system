# Stakeholders and Roles

**Purpose:** Describe users, governance responsibilities, and restricted actions.  
**Status:** APPROVED role catalogue; detailed institutional policies remain PROVISIONAL/BLOCKED.  
**Basis:** Proposal scope, roadmap Section 3, and user-confirmed interview/system role model on 2026-07-27.  
**Owner:** TCC project sponsor/adviser.  
**Last updated:** 2026-07-27.  
**Related IDs:** FR-01, FR-03, FR-09, BR-02, BR-03, D-005, D-007.  
**Open questions:** OQ-007 retains account multiplicity/approval/authentication details; OQ-010 controls report signatories.

| Implemented role | Approved capability boundary | Restrictions |
|---|---|---|
| Student applicant | Register, manage own profile, complete approved assessment, view own verified result/recommendations, record decision, download own report. | Cannot create/verify official exam results, alter rules, or access another applicant. |
| Guidance/Psychometrician/Admin | Perform all authorized institutional workflows: applicant review, official exam encoding/import/verification/correction, assessment governance, course/rule/profile governance, recommendation review, decisions, and approved reports. | Cannot alter immutable history or use unapproved rules/mappings; every privileged change is authorized and audited. |
| System Administrator (side role) | Manage technical account/role controls, admission-cycle configuration, audit/operational views, jobs, health, backup status, and approved privacy operations. | Does not own psychometric interpretation or silently change official exam, assessment, rule, or recommendation history. |

Developer/Maintainer is not an implemented application role. Development, deployment, and support remain team responsibilities governed outside the product role model.

## Approval responsibilities (PROPOSED)

- Guidance/Psychometrician/Admin: operational use of approved applicant, official exam, assessment, course/rule, recommendation, and report workflows.
- Adviser/client: scope, success criteria, report format, research and ML objectives.
- System Administrator/TCC-authorized technical owner: account/system controls, hosting operations, backups, incident handling, and release operations as approved.

Whether one account may hold multiple approved roles, account approval, Admin authentication, and named human approvers remain BLOCKED. See [Open Questions](22-OPEN-QUESTIONS.md).
