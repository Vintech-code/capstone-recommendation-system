# Open Questions

**Purpose:** Centralize every decision that blocks safe or defensible implementation.  
**Status:** BLOCKED pending human confirmation.  
**Basis:** Proposal/roadmap conflicts, database corrections, and documentation brief.  
**Owner:** Capstone project lead coordinates; named authority answers.  
**Last updated:** 2026-07-27.  
**Related IDs:** OQ-001-OQ-014, D-001, D-003-D-009, R-001-R-013.  
**Open questions:** This document is the authoritative open-question list.

| ID | Question / required evidence | Decision owner | Blocks |
|---|---|---|---|
| OQ-001 | What exact Hostinger plan, runtime, database versions/extensions, storage, queue/cron, TLS, backup, and access are available? Select MySQL 8 for ordinary shared/cloud or PostgreSQL only for confirmed compatible VPS/managed hosting. | TCC IT/technical lead | D-003, schema, deployment |
| OQ-002 | What is the official exam score field/format/scale; what does “2.50 or better” mean, including direction, inclusivity, board/course thresholds, exceptions, provenance, verifier, import format, and correction process? | Guidance/Psychometrician/Admin with institutional approval | Exam and eligibility features |
| OQ-003 | Is the authoritative instrument the 42-item binary RIASEC worksheet or separate 18-item Career Assessment? Provide approved source/rights, wording, options, instructions, lifecycle, and interpretations. | Psychometrician | Assessment |
| OQ-004 | What is the approved question-to-dimension mapping, scoring, normalization, ties/top-code method, missing-response behavior, and validation case set? | Psychometrician | Scoring/recommendations |
| OQ-005 | What is the official cycle-specific course catalogue, board-course classification, requirements, approved RIASEC profiles/weights/rationale, and effective approval lifecycle? | Admission/Psychometrician | Catalogue/recommendations |
| OQ-006 | Is `applicant_no` permanent to a person or unique per admission cycle? What other official identifiers are required? | Admission | Data model |
| OQ-007 | The role catalogue is fixed at exactly three roles under D-007. Can one account hold more than one of those roles, and what are the role-assignment, account-approval, separation-of-duty, and Admin-authentication requirements? | TCC owner/IT | Auth/data model |
| OQ-008 | D-007 assigns institutional domain workflows to Guidance/Psychometrician/Admin and technical controls to the System Administrator side role. Confirm the named human approvers, escalation path, and any action-level separation of duties within those boundaries. | TCC sponsor | Authorization/operations |
| OQ-009 | Approve the blend/normalization/tie-break policy, conditional eligibility behavior, explanation language, and number of displayed recommendations. Is the proposed 70/30 formula acceptable? | Psychometrician/Admission | Recommendation engine |
| OQ-010 | What is the official report layout, fields, disclaimers, recipients, signatories, file format, numbering, retention, and correction/reissue process? | Guidance/Admission | Reports |
| OQ-011 | Is ML an academic requirement? If yes, provide lawful approved labelled data, target label, feature schema, sample size, metrics, validation method, fairness review, and model approver; otherwise approve manuscript revision/deferment. | Adviser/Psychometrician | ML claim |
| OQ-012 | Approve privacy notice/lawful basis, data inventory, profiling explanation, minors handling if applicable, data-subject request/correction procedure, retention schedule, secure deletion, sharing/vendors, DPO/PIC/PIP, incident owner, supported browsers, UAT/SUS sample, calendar, and defense date. | DPO/adviser/TCC owner | Privacy, QA, schedule, launch |
| OQ-014 | Select the non-native mobile delivery method: installable PWA or thin packaged web wrapper (for example Capacitor). Confirm Android/iOS targets, app-store requirement, offline expectations, authentication/cookies, deep links, downloads, printing/sharing, notifications, update strategy, permissions, signing, test devices, and whether native build tooling is acceptable. | Team/adviser/technical lead | Mobile packaging, deployment, wrapper testing |
Record answers as signed evidence, then update the [Decision Register](18-DECISION-REGISTER.md), affected ADRs, requirements, backlog, roadmap, risks, and changelog. Never answer these by assumption.

## Resolved questions

| ID | Resolution | Evidence |
|---|---|---|
| OQ-013 | APPROVED D-001 frontend architecture and neutral provisional branding-token approach. Official TCC visual identity remains open under OQ-012. | Explicit user confirmation in the Codex project session, 2026-07-26; [D-001](18-DECISION-REGISTER.md), [ADR-001](adr/ADR-001-FRONTEND.md). |
| Working visual direction | APPROVED D-009 for provisional implementation using `DESIGN.md` color/motion language. This supersedes the neutral-only preview but does not approve official TCC branding. | Explicit user direction in the Codex project session, 2026-07-27; [D-009](18-DECISION-REGISTER.md). |
| Role catalogue | APPROVED exactly three application roles under D-007; Developer/Maintainer excluded as a product role. | Explicit user confirmation in the Codex project session, 2026-07-27; [D-007](18-DECISION-REGISTER.md). |
