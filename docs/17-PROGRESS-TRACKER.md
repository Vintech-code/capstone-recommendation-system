# Progress Tracker

**Purpose:** Report evidence-based documentation and application progress separately.  
**Status:** PLANNING.  
**Basis:** Repository inspection and documentation initialization task.  
**Owner:** Capstone project lead.  
**Last updated:** 2026-07-28.  
**Related IDs:** All active decisions, risks, and stories.  
**Open questions:** [22-OPEN-QUESTIONS.md](22-OPEN-QUESTIONS.md).

## Snapshot

| Area | Status | Evidence |
|---|---|---|
| Documentation planning baseline | APPROVED | Explicit user approval recorded on 2026-07-26; institutional rules remain open. |
| End-to-end delivery sequence | COMPLETED | Granular planning-to-launch checklist created; no application completion inferred. |
| Role-based feature roadmap | COMPLETED | All screens aligned to the approved three-role model; no feature completion inferred. |
| Mobile delivery direction | IN PROGRESS | Web-first non-native wrapper approved; method/distribution remains blocked by OQ-014. |
| Frontend UI decision | APPROVED | D-001 approves the stack; D-009 approves the `DESIGN.md` color/motion language as a provisional working direction, not official TCC branding. |
| Requirements validation | BLOCKED | Institutional decisions not yet supplied. |
| Application | IN PROGRESS - ADMIN UI | `apps/web` provides separate Student, combined Admin, and System Administrator portals. The Admin dashboard now provides a functional synthetic priority overview, filterable work queue, quick actions, activity, workflow status, and module access. Admin feature routes retain modular mock-data workflows, responsive records, borderless `shadow-sm` cards, and shared loading/empty/error recovery. D-015 keeps internal approval blockers out of stakeholder-facing prototype screens while production rules remain unresolved. |
| Laravel API | NOT STARTED | No backend project in repository. |
| Database | BLOCKED | No approved engine or migrations. |
| Recommendation engine | BLOCKED | Instrument, mapping, rules, weights, and dataset decision unresolved. |
| Testing/UAT/SUS | IN PROGRESS - UI ONLY | Frontend lint/build and 53 tests across 10 feature-focused files pass, including Admin dashboard actions, route-state recovery, applicant, result, assessment, questionnaire, recommendation, course, rule, and report navigation, filtering, detail presentation, print interaction, and cross-record linking. Browser verification remains pending because the in-app browser is unavailable. |
| Staging/production | NOT STARTED | No deployment evidence/configuration. |

Progress is never calculated from document count alone.

## Completed

- Located and preserved both reference PDFs under `docs/reference/`.
- Inspected existing repository and source documents.
- Identified source contradictions and required governance controls.
- Created the dependency-aware design, implementation, testing, deployment, review, launch, and handover checklist.
- Created the screen-by-screen role-based feature roadmap with dependencies and completion evidence rules.
- Obtained approval of the documentation planning baseline and D-001 frontend architecture; resolved OQ-013.
- Recorded D-007: exactly three application roles and no Developer/Maintainer product role.
- Recorded D-008: one web codebase with non-native mobile-wrapper delivery.
- Added mandatory `DESIGN.md` UI coding governance to root `AGENTS.md`, including precedence, provisional-branding and font-licensing limits, reusable Tailwind/shadcn rules, truthful functional controls, and required automated/browser completion evidence.
- Implemented and documented the provisional `DESIGN.md` color and motion system with semantic tokens, layered landing-page surfaces, purposeful transitions, reduced-motion behavior, and non-observer content fallback.
- Recorded D-010 and removed the public introduction from the MVP root.
- Implemented production-style separate Student, combined Admin, and System Administrator portals using one shared validated sign-in component, password visibility, portal-matched workspaces, and sign-out.
- Rebuilt the three role workspaces as clean, responsive dashboards with a
  persistent desktop sidebar, mobile Sheet, sticky top bar, labelled search,
  role-specific workflow and access boundaries, and functional module entry.
- Recorded D-012, renamed the combined role's interface and route to Admin at
  `/admin`, aligned the Admin dashboard to GP-01-GP-10 and AT-01-AT-10 feature
  groups, and placed System Administrator last in role-specific sequencing.
- Recorded D-013 and implemented the mock Admin Applicant Management list and
  detail routes.
- Recorded D-014, changed card elevation to borderless `shadow-sm`, separated
  Admin code by domain, and extracted reusable page, sort, and pagination
  controls.
- Implemented the Official Results Management UI prototype with isolated
  synthetic source/review-state/score records, list/detail routes, filtering,
  sorting, pagination, applicant linking, and version history.
- Implemented the AT-03 Manual Result Entry UI prototype with an applicant
  selector, labelled source-value fields, RHF/Zod presence validation,
  complete-record review, accessible confirmation, and a mock
  verification-queue success state.
- Implemented AT-04 CSV import preview with local file/sample reading,
  required-column and row checks, a responsive comparison table, integrated
  loading/error/empty states, and confirmation.
- Implemented AT-05 import reconciliation with batch summaries, outcome
  filters, row issue cards, missing-batch handling, and retry feedback.
- Implemented the Assessment Management UI prototype with synthetic session
  metadata, response progress, list/detail routes, filtering, sorting,
  pagination, applicant linking, questionnaire-version reference, and history.
- Recorded D-015 and replaced visible internal blocker notices with isolated
  synthetic result, session-progress, questionnaire-version, item-preview,
  response-format, lifecycle, and history UI.
- Implemented Recommendations Management with synthetic ranked-course,
  match/eligibility, explanation, input-version, list/detail, and applicant-link
  presentation.
- Implemented GP-08 validation cases with a searchable case library,
  expected/output snapshot comparison, discrepancy states, version references,
  and rerun feedback.
- Implemented GP-10 student decision review with searchable decision cards,
  selected details, recommendation linking, and a clear non-enrolment boundary.
- Implemented Courses & Rules Management with synthetic catalogue and
  admission-rule list/detail routes, lifecycle states, classifications,
  interest profiles, career paths, conditions, effective periods, and history.
- Implemented Reports Management with a synthetic searchable register,
  type/status filtering, responsive records, document preview, source-version
  traceability, cross-record navigation, and functional browser printing.
- Corrected the overused table pattern: Applicants and Official Results retain
  comparison tables, while Assessments now uses workflow lanes,
  Recommendations uses ranked review cards, and Reports uses a featured visual
  document library.
- Repaired Assessment workflow cards for half-width lanes: applicant identity
  and status now lead the card, progress uses the full card width, and activity
  plus the primary action sit in a responsive footer without fixed-width
  content collisions.
- Closed the current shared UI gaps with semantic breadcrumbs, a Radix account
  Dropdown Menu with sign-out, and delivered LoadingState, EmptyState, and
  ErrorState usage.
- Rebuilt GP-01 as a functional Admin operational dashboard with synthetic
  priority summaries, a filterable attention queue, working quick actions,
  expandable activity, workflow navigation, and module search/access.
- Added forbidden, session-expired, and not-found recovery routes plus shared
  loading, empty, and retryable error states across Admin routes.
- Split workspace definitions, navigation, breadcrumbs, dashboard presentation,
  and Admin route content into focused modules. Lazy-loaded the Admin route
  group and reduced the initial production bundle below the previous 500 kB
  warning threshold.
- Split the monolithic application test into feature-focused suites and added
  dashboard and shared-state behavior coverage.

## In progress

- Requirements-validation preparation for OQ-001-OQ-012.
- Development Slice 1: Frontend Foundation. P3-03, P3-04, P3-06, P3-07, and P3-08 have implementation and automated evidence; P3-15 browser-rendered desktop/mobile, keyboard, overflow, and contrast verification is pending.
- Admin-panel-first UI. Separate portal/workspace flows and 53 automated tests
  pass; protected Admin features remain
  BLOCKED by their listed OQs. Real-browser verification remains pending.
- Admin Applicant Management prototype. Fifty-three tests, lint, and build
  pass; browser review, approved fields,
  backend data, and authorization evidence remain pending.
- Admin Official Results Management prototype. Fifty-three tests, lint, and
  build pass. Manual and CSV entry now cover preview, validation,
  reconciliation, confirmation, and mock queue states; OQ-002, browser review,
  backend persistence/jobs, idempotency, audit, and authorization remain
  pending.
- Admin Assessment and Questionnaire Management prototype. Fifty-three tests,
  lint, and build pass; OQ-003/OQ-004, browser review, approved instrument/governance,
  backend data/actions, and authorization evidence remain pending.
- Admin Recommendations Management prototype. Fifty-three tests, lint, and
  build pass. Validation-case and student-decision review UI is present;
  browser review, approved cases/visibility, official courses/rules/weights,
  backend data/actions, and authorization remain pending.
- Admin Courses & Rules Management prototype. Fifty-three tests, lint, and
  build pass; browser review, official catalogue/rules, backend data/actions,
  and authorization evidence remain pending.
- Admin Reports Management prototype. Fifty-three tests, lint, and build pass;
  browser/print review, official format/signatories, backend generation/export,
  authorization, audit, and retention evidence remain pending.

## Blocked

- D-003 database/hosting selection
- Official exam format, thresholds, direction, and correction workflow
- Authoritative RIASEC instrument and mapping
- Official course catalogue, rules, and course profiles
- Role/office ownership and report signatories
- Mobile wrapper technology, targets, distribution, auth/download/print compatibility
- ML academic requirement and dataset path
- Privacy/retention/incident decisions
- Official TCC branding remains provisional under OQ-012; neutral provisional tokens are approved for design work.

## Next actions

1. Make an in-app browser target available and complete P3-15 responsive, keyboard, overflow, console, and rendered-contrast inspection before marking Development Slice 1 COMPLETED.
2. Conduct the requirements-validation meeting using [22-OPEN-QUESTIONS.md](22-OPEN-QUESTIONS.md).
3. Attach signed decisions/evidence and update [18-DECISION-REGISTER.md](18-DECISION-REGISTER.md).
4. Assign owners and evidence due dates for OQ-001-OQ-012.
5. Re-plan only the stories unblocked by approved decisions.
6. Execute and maintain [23-END-TO-END-DELIVERY-CHECKLIST.md](23-END-TO-END-DELIVERY-CHECKLIST.md), checking an item only when its evidence exists.
7. Validate the three-role feature allocation and maintain [24-ROLE-BASED-FEATURE-ROADMAP.md](24-ROLE-BASED-FEATURE-ROADMAP.md) as each feature is designed, implemented, tested, reviewed, and approved.
