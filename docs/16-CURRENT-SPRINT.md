# Current Sprint

**Purpose:** Define the active two-week planning sprint and evidence required to exit it.  
**Status:** IN PROGRESS; dates PROVISIONAL.  
**Basis:** Documentation brief and Sprint 1 in [14-IMPLEMENTATION-ROADMAP.md](14-IMPLEMENTATION-ROADMAP.md).  
**Owner:** Capstone project lead.  
**Last updated:** 2026-07-28.  
**Related IDs:** D-001-D-008, OQ-001-OQ-012, OQ-014; OQ-013 resolved.  
**Open questions:** All Sprint 1 validation questions in [22-OPEN-QUESTIONS.md](22-OPEN-QUESTIONS.md).

## Sprint 1 goal

Establish a reviewable documentation baseline and obtain authoritative institutional decisions before feature implementation.

## Work

| Task | Owner | Status | Evidence/exit condition |
|---|---|---|---|
| Initialize controlled documentation and source references | Capstone team | COMPLETED | Planning baseline approved by user on 2026-07-26. |
| Establish the end-to-end delivery checklist | Capstone team | COMPLETED | `23-END-TO-END-DELIVERY-CHECKLIST.md` created and linked; implementation items remain unchecked. |
| Establish the role-based feature roadmap | Capstone team | COMPLETED | `24-ROLE-BASED-FEATURE-ROADMAP.md` aligned to D-007's three roles; all application features remain unchecked. |
| Confirm the React/Tailwind/shadcn frontend UI decision and provisional branding approach | Team/adviser | COMPLETED | D-001 approved and OQ-013 resolved by explicit user confirmation on 2026-07-26. |
| Confirm the three-role application model | Team/adviser | COMPLETED | D-007 approved by explicit user confirmation on 2026-07-27. |
| Confirm web-first delivery with a non-native mobile wrapper | Team/adviser | IN PROGRESS | Direction approved as D-008; wrapper method/distribution BLOCKED by OQ-014. |
| Development Slice 1: Frontend Foundation | Frontend/QA | IN PROGRESS | P3-03, P3-04, P3-06, P3-07, and P3-08 implemented; lint, 9 tests, production build, automated accessibility scan, and live HTTP response pass. P3-15 browser-rendered verification remains pending because no in-app browser target was available. |
| Admin-panel-first UI slice | Frontend/QA | IN PROGRESS | D-010-D-012 remove the public introduction and role picker, use `/admin` for the combined Guidance/Psychometrician/Admin role, and reserve System Administrator for the final role-specific slice. GP-01 now provides a functional synthetic operational dashboard; shared loading/empty/error and forbidden/session/not-found recovery are implemented; Admin routing is lazy-loaded and modularized. Lint, 53 tests across 10 focused files, build, and automated accessibility checks pass. Production auth, approved feature rules/data, and browser verification remain pending. |
| Admin Applicant Management prototype | Frontend/QA | IN PROGRESS - UI ONLY | D-013-D-015 permit complete mock presentation with borderless `shadow-sm` cards and modular feature code. `/admin/applicants` provides functional search, filtering, sorting, pagination, responsive records, empty state, and details. Fifty-three tests, lint, and build pass. Browser verification, approved production fields, backend data, and authorization remain pending. |
| Admin Official Results Management prototype | Frontend/QA | IN PROGRESS - UI ONLY | Official Results provides queue/list/detail/history, staged manual entry, local CSV upload/sample preview, required-column and row validation, reconciliation summaries, outcome filters, issue cards, and retry feedback. Fifty-three tests, lint, and build pass; browser verification, official import format/rules, persistence, idempotency, jobs, authorization, audit, and API integration remain pending. |
| Admin Assessment and Questionnaire Management prototype | Frontend/QA | IN PROGRESS - UI ONLY | Assessment routes use search/state filtering and separate in-progress/submitted workflow lanes with repaired lane-native progress cards that preserve readable identity, progress, activity, and actions without overlap; questionnaire routes retain version cards, item/response preview, lifecycle states, and history. Fifty-three tests, lint, and build pass; browser verification, approved instrument/scoring/governance, authorization, and API integration remain pending. |
| Admin Recommendations Management prototype | Frontend/QA | IN PROGRESS - UI ONLY | Recommendations uses a searchable review-card grid/detail and now includes algorithm validation case comparison/rerun feedback plus student decision card/detail review with a non-enrolment boundary and recommendation linking. Fifty-three tests, lint, and build pass; browser verification, approved cases/decision visibility, official catalogue/rules/weights, authorization, and API integration remain pending. |
| Shared Admin UI gaps | Frontend/QA | IN PROGRESS - UI ONLY | Semantic Breadcrumb, Radix user Dropdown Menu with sign-out, module-only search, route-level lazy loading, integrated LoadingState/EmptyState/ErrorState surfaces, and focused forbidden/session-expired/not-found recovery are implemented and covered. Browser responsive/keyboard evidence, backend session behavior, and global API-state integration remain pending. |
| Admin Courses & Rules Management prototype | Frontend/QA | IN PROGRESS - UI ONLY | Course and admission-rule routes provide synthetic catalogue/rule records, search, lifecycle filtering, responsive list/detail layouts, course classification, interest profiles, career paths, rule conditions, effective periods, and version history. Fifty-three tests, lint, and build pass; browser verification, official catalogue/rules, authorization, and API integration remain pending. |
| Admin Reports Management prototype | Frontend/QA | IN PROGRESS - UI ONLY | `/admin/reports` uses a visual document library with a featured report, search, type/status filtering, responsive preview cards, document-style detail, source-version references, linked applicant/recommendation navigation, and browser printing. Fifty-three tests, lint, and build pass; browser/print verification, official layout/signatories, secure exports, authorization, audit, and API integration remain pending. |
| Refine provisional landing-page visual system | Frontend/QA | COMPLETED | Centralized `DESIGN.md` palette/shadows, motion primitives, reduced-motion/fallback behavior, and richer interactive surfaces implemented; automated gates pass. This task completion does not complete PUB-01. |
| Add DESIGN.md UI coding governance | Capstone team | COMPLETED | Root `AGENTS.md` now requires DESIGN.md review, establishes source precedence and licensing/content limits, requires reusable Tailwind/shadcn implementation, prohibits fake controls/metrics, and defines automated plus real-browser completion evidence. |
| Confirm exact Hostinger plan and database | Technical lead/TCC IT | BLOCKED | Written plan capabilities and D-003 decision. |
| Obtain official course catalogue and board-course rules | Admission | BLOCKED | Approved cycle-specific catalogue/rules. |
| Confirm official exam score format and correction workflow | Guidance/Psychometrician/Admin | BLOCKED | Examples, boundaries, ownership, approved import format. |
| Approve RIASEC instrument, mapping, scoring, and rights | Psychometrician | BLOCKED | Signed version specification and validation cases. |
| Confirm remaining account/permission details and named owners | TCC owners | BLOCKED | D-007 role catalogue approved; account multiplicity, approvals, authentication, and named owners remain open. |
| Approve report format and signatories | Guidance/Admission | BLOCKED | Sample report and sign-off requirements. |
| Decide ML academic scope | Adviser/Psychometrician | BLOCKED | Approved dataset plan or manuscript revision. |
| Approve privacy, retention, correction, and incident ownership | DPO/TCC owner | BLOCKED | DPIA inputs and written policies. |

## Sprint exit

Do not begin features that depend on an unresolved item. At sprint review, update the decision register, open questions, backlog, roadmap, progress tracker, and changelog with links to evidence.
