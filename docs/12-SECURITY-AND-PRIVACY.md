# Security and Privacy

**Purpose:** Establish security, privacy, profiling, and data-governance controls.  
**Status:** PROVISIONAL; legal/DPO review required.  
**Basis:** Roadmap, Section 11; Republic Act No. 10173 and NPC implementing rules.  
**Owner:** TCC personal information controller/DPO and authorized IT owner; capstone team implements approved controls.  
**Last updated:** 2026-07-29.
**Related IDs:** NFR-02, NFR-04-NFR-07, BR-02-BR-03, R-005, R-008, D-020.
**Open questions:** Lawful basis, PIC/PIP assignments, DPO contact, retention schedule, incident owner, minors, data sharing, and deletion exceptions.

## Privacy requirements

The design must follow transparency, legitimate purpose, and proportionality; collect only necessary data for declared purposes; maintain accuracy; avoid indefinite retention; and securely dispose of data. The privacy notice must explain the recommendation profiling, data sources, logic at an understandable level, significance, risks/safeguards, recipients, retention, controller/DPO contact, and how rights are exercised.

Provide a documented process for requests involving information/access, objection, correction/rectification, erasure or blocking where applicable, portability where applicable, complaints, and disputed official results. Do not delete records where a valid legal/operational exception requires retention; record the decision and applicable basis.

Primary legal references:

- [Republic Act No. 10173 - Data Privacy Act of 2012](https://privacy.gov.ph/data-privacy-act/)
- [Implementing Rules and Regulations](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/)
- [NPC data-subject rights](https://privacy.gov.ph/data-subject-rights/)

This plan is engineering guidance, not legal advice. TCC's DPO or authorized counsel must approve the final controls.

## Required controls

- Complete a data inventory, data-flow map, and privacy impact assessment before real applicant data.
- Use least privilege, server-side policies, ownership checks, Admin MFA if approved/available, account lockout/rate limiting, and secure recovery.
- Provision a separate account for every authorized guidance counselor and
  psychometrician assigned the combined Admin role. Prohibit shared staff
  credentials so privileged actions and audit events remain attributable.
- Use HTTPS, secure HTTP-only cookies, CSRF protection, restrictive CORS, validation, output encoding, dependency review, and secret management.
- Encrypt sensitive backups and storage as supported; never put production data or secrets in source control.
- Log authentication, exam verification/correction, rule/instrument lifecycle, recommendation generation, exports, role changes, and privileged access without logging secrets or unnecessary assessment content.
- Define retention per record class, legal basis, archival access, anonymization, litigation/records holds, and verified secure deletion.
- Establish incident ownership, triage, containment, evidence preservation, escalation, notification decision workflow, recovery, and post-incident review.
- Use anonymized/synthetic development and test data. Separate local, staging/UAT, and production.
- Assess vendors/hosting, subprocessors, locations, contracts, access, backup, and deletion before deployment.

Related: [Database Design](08-DATABASE-DESIGN.md), [Deployment Plan](20-DEPLOYMENT-PLAN.md), [Risk Register](19-RISK-REGISTER.md).
