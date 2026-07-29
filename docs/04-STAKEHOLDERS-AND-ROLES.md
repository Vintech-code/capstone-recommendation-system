# Stakeholders and Roles

**Purpose:** Describe users, governance responsibilities, and restricted actions.  
**Status:** APPROVED role catalogue; detailed institutional policies remain PROVISIONAL/BLOCKED.  
**Basis:** Proposal scope, roadmap Section 3, and user-confirmed interview/system role model on 2026-07-27.  
**Owner:** TCC project sponsor/adviser.  
**Last updated:** 2026-07-29.
**Related IDs:** FR-01, FR-03, FR-09, BR-02, BR-03, D-005, D-007, D-020.
**Open questions:** OQ-007 retains account multiplicity/approval/authentication details; OQ-010 controls report signatories.

| Implemented role | Approved capability boundary | Restrictions |
|---|---|---|
| Student applicant | Register, manage own profile, complete approved assessment, view own verified result/recommendations, record decision, download own report. | Cannot create/verify official exam results, alter rules, or access another applicant. |
| Guidance/Psychometrician/Admin | One shared application-role type that may be assigned to multiple authorized individual guidance counselors and psychometricians. Role holders perform permitted institutional workflows: applicant review, official exam encoding/import/verification/correction, assessment governance, course/rule/profile governance, recommendation review, decisions, and approved reports. | Every staff member uses an individual account. Shared credentials are prohibited. Role holders cannot alter immutable history or use unapproved rules/mappings; every privileged change is attributable, authorized, and audited. |
| System Administrator (side role) | Manage technical account/role controls, admission-cycle configuration, audit/operational views, jobs, health, backup status, and approved privacy operations. | Does not own psychometric interpretation or silently change official exam, assessment, rule, or recommendation history. |

Developer/Maintainer is not an implemented application role. Development, deployment, and support remain team responsibilities governed outside the product role model.

## Combined Admin staffing model

- `Guidance/Psychometrician/Admin` is one application-role type and one portal,
  not one person.
- Multiple authorized guidance counselors and psychometricians may each be
  assigned this same role.
- Every role holder must use a distinct individual account so authentication,
  actions, corrections, approvals, and audit history remain attributable.
- Counselor and Psychometrician job titles do not create additional
  application roles. Any action-level differences between personnel remain
  BLOCKED pending the OQ-008 permission and separation-of-duty decision.

## Approval responsibilities (PROPOSED)

- Guidance/Psychometrician/Admin: operational use of approved applicant, official exam, assessment, course/rule, recommendation, and report workflows.
- Adviser/client: scope, success criteria, report format, research and ML objectives.
- System Administrator/TCC-authorized technical owner: account/system controls, hosting operations, backups, incident handling, and release operations as approved.

Whether one account may hold multiple approved role types, account approval,
Admin authentication, named human approvers, and action-level differences
among Admin role holders remain BLOCKED. The ability for multiple distinct
people to hold the same combined Admin role is APPROVED under D-020. See
[Open Questions](22-OPEN-QUESTIONS.md).
