# Testing Strategy

**Purpose:** Define test levels, evidence, and release gates.  
**Status:** PROPOSED.  
**Basis:** Proposal testing objective; roadmap, Section 12 and Appendix C.  
**Owner:** Capstone QA lead; acceptance by authorized stakeholders.  
**Last updated:** 2026-07-27.  
**Related IDs:** TC-01-TC-15, SBT-01-SBT-05, FR-01-FR-10, NFR-01-NFR-10.  
**Open questions:** UAT participants, SUS target/sample, performance load, supported browsers/devices/wrapper targets, and algorithm agreement target.

## Test layers

| Level | Minimum coverage |
|---|---|
| Static | Type checking, lint, formatting, dependency/config review. |
| Unit | RIASEC scoring after approval, normalization, eligibility boundaries, ranking, tie-breaks, state transitions. |
| API/feature | Validation, role policies, ownership, lifecycle conflicts, idempotency, audit creation, imports, reports. |
| Component | Forms, errors, loading/disabled states, assessment progress, explanations, shadcn/Radix interactions, and accessible behavior. |
| Integration | Database transactions, queues, file/report storage, email if approved, backup/restore. |
| End-to-end/SBT | Complete Student/Admin workflows with approved synthetic cases. |
| Non-functional | Accessibility, security, privacy, performance, concurrency, recovery, compatibility. |
| UAT/SUS | Intended-user evaluation against approved tasks and instrument. |

## Core traceability

| ID | Scenario | Required evidence |
|---|---|---|
| TC-01 | Student cannot read another applicant's record. | Automated API policy test. |
| TC-02 | Student cannot create/verify/correct official results. | API/UI authorization tests. |
| TC-03 | Admin correction preserves previous result, reason, actor, and time. | Feature test and audit record. |
| TC-04 | Inactive questionnaire cannot start a new session. | State/feature test. |
| TC-05 | Submitted session cannot be changed in place. | API/database test. |
| TC-06 | Boundary cases follow approved comparison direction exactly. | Psychometrician/Admission-approved cases. |
| TC-07 | Same input/version snapshot yields identical rankings. | Determinism test. |
| TC-08 | Recommendation records all governing versions and explanations. | Feature/schema assertion. |
| TC-09 | Duplicate submit/generate requests do not duplicate records. | Idempotency/concurrency test. |
| TC-10 | Interrupted form can recover without losing saved answers. | Component/E2E test. |
| TC-11 | Backup restores counts, relationships, files, and access. | Dated restore report. |
| TC-12 | Logs/exports do not leak secrets or unauthorized data. | Security review evidence. |
| TC-13 | Application-shell navigation, dialogs, menus, tooltips, and forms are keyboard operable with visible focus and accessible names/descriptions. | Component/accessibility evidence. |
| TC-14 | Dense operational tables and alternative workflow/card/library patterns remain understandable and operable at approved small-screen breakpoints. | Responsive component/E2E evidence. |
| TC-15 | The same approved web build works in supported browsers and the selected mobile wrapper without role, auth, navigation, form, download, or print regressions. | Browser/wrapper integration evidence. |

Current automated evidence as of 2026-07-29 includes 126 Vitest/component tests across 22 focused files plus 20 passing Laravel unit/feature tests. Frontend coverage includes the Admin feature workflows, ADM-01 System Administrator dashboard presentation and role-boundary checks, all STU-01 through STU-11 Student presentation slices, shared states, route isolation, form validation, decision history, report print/download controls, automated accessibility scans, and accessible light/dark switching, local preference persistence, authenticated-workspace restoration, and recovery-screen availability, plus server-backed sign-in, server-confirmed portal entry, preserved validation errors, guest redirects, wrong-role denial, Admin role-holder messaging, and `401`/`403` recovery routing. Laravel coverage verifies successful Admin login, session restoration, logout, invalid credentials, required input, guest rejection, all three role boundaries, cross-portal denial, policy-neutral multi-role membership, multiple individual accounts holding the shared Admin role, safe error codes, local Admin provisioning, and opt-in local seed accounts that are idempotent, password-configured, role-isolated, production-rejected, and disabled by default. Frontend lint/build and Laravel Pint pass. A live Vite-proxied HTTP flow previously verified CSRF-cookie initialization, Admin login, `/api/v1/auth/me`, logout, then `401`. This evidence does not prove registration, recovery, approved account states, feature/action policies, production topology, official domain rules/data, UAT, SUS, performance, wrapper, or launch results. Browser-rendered light/dark contrast, responsive, keyboard, overflow, console, print, and computed-contrast checks remain PENDING because the in-app browser is unavailable.

Use [TEST-CASE-TEMPLATE.md](templates/TEST-CASE-TEMPLATE.md). A story is COMPLETED only when its criteria and relevant checks pass with linked evidence.
