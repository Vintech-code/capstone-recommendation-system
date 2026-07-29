# Progress Tracker

**Purpose:** Report evidence-based documentation and application progress separately.  
**Status:** PLANNING.  
**Basis:** Repository inspection and documentation initialization task.  
**Owner:** Capstone project lead.  
**Last updated:** 2026-07-29.
**Related IDs:** All active decisions, risks, and stories.  
**Open questions:** [22-OPEN-QUESTIONS.md](22-OPEN-QUESTIONS.md).

## Snapshot

| Area | Status | Evidence |
|---|---|---|
| Documentation planning baseline | APPROVED | Explicit user approval recorded on 2026-07-26; institutional rules remain open. |
| End-to-end delivery sequence | COMPLETED | Granular planning-to-launch checklist created; no application completion inferred. |
| Role-based feature roadmap | COMPLETED | All screens aligned to the approved three-role model; no feature completion inferred. |
| Mobile delivery direction | IN PROGRESS | Web-first non-native wrapper approved; method/distribution remains blocked by OQ-014. |
| Frontend UI decision | APPROVED | D-001 approves the stack; D-009 approves the `DESIGN.md` color/motion language and D-019 approves persistent light/dark appearance as provisional working directions, not official TCC branding. |
| Requirements validation | BLOCKED | Institutional decisions not yet supplied. |
| Application | IN PROGRESS - THREE ROLE UI | `apps/web` provides separate Student, combined Admin, and System Administrator portals. Under D-018, the Admin dashboard follows the supplied clean violet reference with functional workflow summaries and visualizations. The Student dashboard provides a task-oriented next-action hero and six explicit journey stages through guidance, decision, and report. ADM-01 now provides a distinct technical-operations dashboard with functional period summaries, access-review navigation, service states, audit activity, and no guidance-domain controls. Every role dashboard, Admin feature list/detail page, shared module view, and breadcrumb fills the available wide/zoomed-out workspace. A labelled edge chevron collapses the desktop sidebar into an accessible 80px icon rail with tooltips while mobile retains its Sheet. All STU-01 through STU-11 presentation slices and ADM-01 presentation are implemented with isolated D-015 data; production behavior remains blocked by recorded institutional decisions. |
| Laravel API | IN PROGRESS - AUTH FOUNDATION | `apps/api` now contains Laravel 13 with Sanctum first-party SPA authentication, three-role persistence, login/me/portal-authorization/logout endpoints, reusable role middleware, stable `401`/`403` errors, CSRF/session handling, login throttling, safe local Admin provisioning, opt-in environment-backed three-role local seed accounts, and 19 passing tests. Domain APIs, account lifecycle, detailed policies, recovery, and deployment topology remain pending/blocked. |
| Database | IN PROGRESS - PROVISIONAL LOCAL | Local MySQL migrations for Laravel defaults, Sanctum tokens, roles, and role assignments ran successfully. D-003 and the complete domain schema remain blocked; these auth migrations do not approve the final database design. |
| Recommendation engine | BLOCKED | Instrument, mapping, rules, weights, and dataset decision unresolved. |
| Testing/UAT/SUS | IN PROGRESS | Frontend lint/build and 126 tests across 22 files pass; Laravel Pint and 20 unit/feature tests pass. Frontend evidence covers all current Admin, ADM-01 System Administrator, and STU-01 through STU-11 presentation slices, shared states, route isolation, interactions, validation, theme switching/persistence/restoration, shared role-dark-palette tokens, Admin role-holder copy, print/download controls, and automated accessibility scans. Authentication evidence covers CSRF-cookie login, session restoration, logout, invalid credentials, guest rejection, all three portal-role boundaries, wrong-role denial, multiple individual accounts sharing the Admin role, `401`/`403` recovery, policy-neutral cross-role membership, local Admin provisioning, and safe opt-in local auth seeding. A live proxied HTTP flow verified login, `/me`, logout, then `401`. Browser-rendered light/dark contrast, responsive/keyboard/console/print evidence remains pending because the in-app browser is unavailable. |
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
- Recorded D-020: the combined Admin role may be held by multiple authorized
  guidance counselors and psychometricians through distinct individual
  accounts; this adds no role and does not resolve action-level permissions.
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
- Compacted the shared Admin workspace chrome and feature headers: the top bar,
  breadcrumb gap, page title/description, optional actions, and first content
  surface now form one organized hierarchy without repeated role-eyebrow text.
- Moved Admin breadcrumbs below shared page headings and above feature search
  or filters; moved Admin module search from global chrome into the dashboard.
- Closed the remaining GP-01 prototype checklist gaps with explicit priority
  labels, visible work-queue ranking, the specified activity event types, and
  verified navigation for all six quick actions.

## In progress

- Shared light/dark appearance. D-019 adds semantic dark tokens, no-flash
  initialization, local preference persistence, accessible toggles on portal,
  workspace, and recovery surfaces, theme-aware notifications, and one
  Admin-derived dark canvas, card, and muted-surface palette shared by Student,
  Admin, and System Administrator. Dark-compatible shared controls and white
  print output remain intact. Automated theme tests, the complete frontend
  suite, lint, and build pass. Real-browser light/dark contrast, keyboard,
  mobile, chart, and print review remains pending.
- System Administrator operational dashboard prototype. ADM-01 now
  demonstrates a responsive technical-operations hero, functional
  24-hour/7-day summaries, navigable user/role/cycle/audit review work,
  text-labelled service states, recent audit activity, module search, and an
  explicit responsibility boundary. D-015 counts and states are UI fixtures,
  not production monitoring, audit, backup, or authorization evidence.
  OQ-001/OQ-007/OQ-008, production APIs/policies/monitoring, browser review,
  and stakeholder acceptance remain pending.
- Authentication Slice 1. Sanctum cookie authentication, three-role
  assignments, login/session/logout APIs, React session restoration, protected
  routes, server portal authorization, reusable role middleware, stable
  `401`/`403` errors, recovery routing, role denial, throttling, tests,
  migrations, and a live HTTP flow pass.
  Registration, password recovery, account states, feature policies, approved
  production topology, and rendered browser evidence remain pending.
- Requirements-validation preparation for OQ-001-OQ-012.
- Development Slice 1: Frontend Foundation. P3-03, P3-04, P3-06, P3-07, and P3-08 have implementation and automated evidence; P3-15 browser-rendered desktop/mobile, keyboard, overflow, and contrast verification is pending.
- Student Profile & Application prototype. The Student-only module now
  demonstrates mobile-first profile editing, validation, completion guidance,
  explicit save, dirty-change protection, application review/confirmation,
  read-only submitted state, and loading/empty/retryable-error states.
  Approved fields and lifecycle, backend persistence, own-record policies,
  conflict recovery, browser review, and stakeholder acceptance remain
  pending.
- Student Official Result prototype. Student feature headers now use the
  title-description-breadcrumb hierarchy without a duplicate back row. The
  result module demonstrates a responsive read-only summary, verification
  state, provenance details, history, correction-contact guidance, and shared
  loading/empty/error states without Student write controls or result
  interpretation. OQ-002, production data/API ownership, browser review, and
  stakeholder acceptance remain pending.
- Student Interest Assessment introduction prototype. The Student module now
  demonstrates a responsive orientation flow, general expectations, synthetic
  active-version/readiness context, non-diagnostic notice, required
  acknowledgement and confirmation, session-opening feedback, and
  loading/empty/error/inactive states. It does not expose invented
  questionnaire items, scoring, mappings, interpretations, or validation
  claims. OQ-003/OQ-004, production session behavior, browser review,
  psychometrician review, and stakeholder acceptance remain pending.
- Student assessment session prototype. The acknowledged introduction now
  opens a responsive one-question flow with answered progress, direct
  navigation, labelled choices, local autosave/resume, save-and-exit, offline
  recovery, response review/editing, incomplete-submit prevention, final
  confirmation, stale-version recovery, and a locked completed state. Isolated
  D-015 fixtures are not an approved instrument and produce no mapping, score,
  interpretation, validation result, or recommendation. OQ-003/OQ-004,
  production persistence/idempotency/ownership, browser review,
  psychometrician review, and stakeholder acceptance remain pending.
- Student Assessment Result prototype. A locked submitted session now opens a
  responsive read-only result with a top-code summary, all six labelled
  numeric dimension bars, leading-dimension order, result/session/version
  provenance, guidance limitations, and loading/empty/error/preparing states.
  D-015 visualization values are not approved scoring, norms,
  interpretations, mappings, validation evidence, or production data, and the
  screen makes no recommendation, eligibility, diagnosis, admission, or
  enrolment claim. OQ-004, production ownership/API, browser review,
  psychometrician review, and stakeholder acceptance remain pending.
- Student Recommendation Results prototype. The Course guidance module now
  presents responsive ranked course cards with explicit requirement states,
  numeric match values, explanation factors, status filters, result
  provenance, focused course details, and a functional two-to-three-course
  comparison. The assessment result can open this module directly. D-015
  course, rank, match, factor, status, and reference values are presentation
  fixtures only and do not establish approved catalogue, eligibility,
  weighting, validation, admission, or enrolment meaning. OQ-002/OQ-005/OQ-009,
  production engine/API ownership, browser review, guidance acceptance, and
  E2E evidence remain pending.
- Student Course Detail and Comparison prototype. Recommendation details add
  program metadata, learning areas, general career directions, recorded
  factors, and review notes. Comparison selection remains preserved and two or
  three options reflow as cards on smaller screens instead of forcing a wide
  table. D-015 content is not approved catalogue, requirement, eligibility, or
  career-outcome evidence. OQ-005, production API ownership, browser review,
  guidance acceptance, and E2E evidence remain pending.
- Student Decision prototype. My decision provides an accessible course
  selector, four preference responses, required-note validation, confirmation,
  revision, visible history, guidance/report navigation, and loading/empty/
  retryable-error states. Preference remains explicitly separate from
  application submission, admission, course assignment, slot reservation, and
  enrolment. OQ-009, production persistence/idempotency/ownership, browser
  review, and stakeholder acceptance remain pending.
- Student Report prototype. My report provides own-record references, a
  responsive document preview, ranked guidance, current preference,
  limitations, functional browser printing and text download, and loading/
  empty/retryable-error/preparing states. The D-015 layout and export are not
  an approved report or secure production document. OQ-010, production
  generation/storage/authorization, browser/print review, and stakeholder
  acceptance remain pending.
- Admin-panel-first UI. Separate portal/workspace flows and 104 automated tests
  pass; protected Admin features remain
  BLOCKED by their listed OQs. Real-browser verification remains pending.
- Admin Applicant Management prototype. One hundred four frontend tests, lint, and build
  pass; browser review, approved fields,
  backend data, and authorization evidence remain pending.
- Admin Official Results Management prototype. One hundred four frontend tests, lint, and
  build pass. Manual and CSV entry now cover preview, validation,
  reconciliation, confirmation, and mock queue states; OQ-002, browser review,
  backend persistence/jobs, idempotency, audit, and authorization remain
  pending.
- Admin Assessment and Questionnaire Management prototype. One hundred four frontend tests,
  lint, and build pass; OQ-003/OQ-004, browser review, approved instrument/governance,
  backend data/actions, and authorization evidence remain pending.
- Admin Recommendations Management prototype. One hundred four frontend tests, lint, and
  build pass. Validation-case and student-decision review UI is present;
  browser review, approved cases/visibility, official courses/rules/weights,
  backend data/actions, and authorization remain pending.
- Admin Courses & Rules Management prototype. One hundred four frontend tests, lint, and
  build pass; browser review, official catalogue/rules, backend data/actions,
  and authorization evidence remain pending.
- Admin Reports Management prototype. One hundred four frontend tests, lint, and build pass;
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
