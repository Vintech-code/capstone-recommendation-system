# End-to-End Delivery Checklist

**Purpose:** Provide the granular execution order from initial planning and homepage design through implementation, testing, deployment, review, launch, and handover.  
**Status:** PROVISIONAL execution plan; planning baseline, D-001, D-007, and D-008 direction are APPROVED, while dependent work remains BLOCKED by OQ-001-OQ-012 and OQ-014.  
**Basis:** [Implementation Roadmap](14-IMPLEMENTATION-ROADMAP.md), [Product Backlog](15-PRODUCT-BACKLOG.md), [UI/UX Plan](11-UI-UX-PLAN.md), and repository governance.  
**Owner:** Capstone project lead; individual steps require assigned owners.  
**Last updated:** 2026-07-29.
**Related IDs:** D-001-D-020, OQ-001-OQ-014, FR-01-FR-10, US-01-US-18, TC-01-TC-15.
**Open questions:** [22-OPEN-QUESTIONS.md](22-OPEN-QUESTIONS.md).

## How to maintain this checklist

- `[ ]` means not completed. Add `BLOCKED`, `IN PROGRESS`, `DEFERRED`, or `OUT OF SCOPE` after the item when applicable.
- `[x]` means COMPLETED and must have linked implementation plus test, review, approval, or operational evidence.
- Never check an item merely because a design was drafted, a feature was demonstrated locally, or it appears in the proposal.
- Work in order unless the project lead records why a later independent item can safely proceed.
- When completing an item, add the completion date, owner, pull request/commit, tests, screenshots/report, and approval reference in the evidence log.
- Update the [Progress Tracker](17-PROGRESS-TRACKER.md), [Current Sprint](16-CURRENT-SPRINT.md), [Product Backlog](15-PRODUCT-BACKLOG.md), and [Changelog](CHANGELOG.md) after each completed delivery slice.

## Current summary

| Phase | Status | Completion rule |
|---|---|---|
| 0. Documentation and governance | IN PROGRESS | Baseline approved; named owners/dates still required for open decisions. |
| 1. Planning and requirements | BLOCKED | OQ-001-OQ-012 and OQ-014 resolved or explicitly deferred by authorized owners. |
| 2. UX and system design | BLOCKED | Approved flows, wireframes, architecture, ERD, API, and validation cases. |
| 3. Development foundation | BLOCKED | D-001-D-003, D-007-D-008, role/auth details, and wrapper method approved. |
| 4. Public and account experience | NOT STARTED | Homepage/auth implemented and tested. |
| 5. Student application workflow | NOT STARTED | Profile/application and official-result status tested. |
| 6. Assessment workflow | BLOCKED | Instrument/mapping approved and workflow tested. |
| 7. Course and recommendation workflow | BLOCKED | Rules/profiles approved and deterministic engine validated. |
| 8. Admin, reports, and System Administrator | BLOCKED | Role/office/report rules approved and tested. |
| 9. System testing and hardening | NOT STARTED | Required suites and reviews pass with no critical defects. |
| 10. Deployment and UAT | BLOCKED | Hosting, privacy, restore, and UAT gates pass. |
| 11. Review, launch, and handover | NOT STARTED | Signed launch approval and operational acceptance. |

## Phase 0 - Documentation and governance

- [x] `P0-01` Inspect the repository and preserve the existing React/Vite scaffold. Evidence: [Progress Tracker](17-PROGRESS-TRACKER.md).
- [x] `P0-02` Place and inspect both authoritative PDFs. Evidence: [Source of Truth](02-SOURCE-OF-TRUTH.md).
- [x] `P0-03` Create the controlled documentation structure, ADRs, templates, backlog, risks, and open questions.
- [x] `P0-04` Record the PROPOSED React/Tailwind/shadcn frontend decision and approval gate. Evidence: [ADR-001](adr/ADR-001-FRONTEND.md).
- [x] `P0-05` Create this granular end-to-end checklist.
- [x] `P0-06` Obtain team/adviser review of the complete documentation baseline. Completed 2026-07-26 through explicit user approval.
- [x] `P0-07` Record approval evidence and change eligible documents/decisions from PROPOSED to APPROVED. D-001 and planning-baseline records updated.
- [ ] `P0-08` Assign named owners and target dates for every active Sprint 1 question.

## Phase 1 - Planning and requirements validation

Do not begin dependent application features until the responsible authority answers the matching question.

- [ ] `P1-01` Confirm the exact Hostinger plan and database capabilities; approve MySQL 8 or PostgreSQL. BLOCKED by OQ-001.
- [ ] `P1-02` Approve the official admission score format, scale, â€œ2.50 or betterâ€ direction/boundaries, thresholds, exceptions, source, import, verification, and correction workflow. BLOCKED by OQ-002.
- [ ] `P1-03` Select and approve the authoritative 42-item or 18-item assessment, source rights, wording, responses, instructions, and lifecycle. BLOCKED by OQ-003.
- [ ] `P1-04` Approve the RIASEC dimension mapping, scoring, normalization, ties, top-code method, missing-response rules, interpretations, and validation cases. BLOCKED by OQ-004.
- [ ] `P1-05` Obtain the official admission-cycle course catalogue, board-course flags, requirements, admission rules, RIASEC profiles, weights, rationales, and approval lifecycle. BLOCKED by OQ-005.
- [ ] `P1-06` Decide whether `applicant_no` belongs to the person or admission-cycle application. BLOCKED by OQ-006.
- [ ] `P1-07` D-020 approves multiple individual users holding the same combined Admin role. Decide whether one account may hold multiple different role types, plus account approval, action-level separation of duties, and Admin authentication. BLOCKED by OQ-007/OQ-008.
- [ ] `P1-08` Approve office ownership and the RACI/permission matrix for every protected workflow. BLOCKED by OQ-008.
- [ ] `P1-09` Approve recommendation normalization, blend, tie-breaks, eligibility display, explanations, and result count. BLOCKED by OQ-009.
- [ ] `P1-10` Approve the official report fields, layout, disclaimer, recipients, signatories, numbering, retention, correction, and reissue process. BLOCKED by OQ-010.
- [ ] `P1-11` Decide the ML academic scope; approve a valid data/evaluation plan or revise/defer the manuscript claim. BLOCKED by OQ-011.
- [ ] `P1-12` Approve privacy, profiling notice, lawful basis, retention, rights/correction, secure deletion, vendors, incident ownership, UAT/SUS sample, supported browsers, calendar, and defense date. BLOCKED by OQ-012.
- [x] `P1-13` Approve the frontend UI/styling decision and neutral provisional branding approach. D-001 approved and OQ-013 resolved on 2026-07-26.
- [x] `P1-14` Approve exactly three application roles and exclude Developer/Maintainer from the product role model. D-007 approved on 2026-07-27.
- [ ] `P1-15` Select and approve the non-native mobile wrapper method, targets, distribution, auth/file/print behavior, and build implications. D-008 direction approved; BLOCKED by OQ-014.
- [ ] `P1-16` Reconcile the approved answers across requirements, business rules, decisions, ADRs, risks, backlog, and manuscript.
- [ ] `P1-17` Freeze the approved MVP requirements baseline and record the change-control procedure.

## Phase 2 - UX and system design

### 2A. Design foundations

- [ ] `P2-01` Define neutral provisional theme tokens for color roles, typography scale, spacing, radii, shadows, focus, motion, and print; do not invent TCC branding.
- [ ] `P2-02` Define responsive breakpoints, content widths, navigation behavior, and complex-table small-screen strategy.
- [ ] `P2-03` Define accessibility acceptance rules for keyboard, focus, labels, dialogs, status, errors, headings, zoom, and semantic HTML.
- [ ] `P2-04` Inventory the approved shadcn primitives and map them to shared application components.
- [ ] `P2-05` Define loading, empty, error, blocked, permission-denied, offline, stale-conflict, success, and destructive-confirmation patterns.

### 2B. Information architecture and screen design order

- [ ] `P2-06` Approve the sitemap and role-based route map.
- [ ] `P2-07` Design the public homepage first: purpose, decision-support disclaimer, eligibility/audience explanation, privacy entry point, and login/register calls to action.
- [ ] `P2-08` Design registration, login, password recovery, verification/status, and account-blocked screens.
- [ ] `P2-09` Design the responsive application shell: desktop Sidebar, mobile Sheet, Breadcrumb, user Dropdown Menu, page header, alerts, and notification behavior.
- [ ] `P2-10` Design the student dashboard and completion checklist.
- [ ] `P2-11` Design profile and admission-cycle application forms, review, submission, and state/conflict behavior.
- [ ] `P2-12` Design the read-only official examination result/status and correction-request guidance.
- [ ] `P2-13` Design RIASEC instructions, consent/notice, assessment pagination, autosave/progress, resume, review, submit confirmation, and locked state.
- [ ] `P2-14` Design RIASEC result explanation without diagnosis or unsupported certainty.
- [ ] `P2-15` Design recommendation results, eligibility badges with text/icons, score-factor explanation, â€œwhy not,â€ course detail, comparison, and decision capture.
- [ ] `P2-16` Design the Admin dashboard, applicant search, filters, responsive data table, applicant detail, and authorized actions.
- [ ] `P2-17` Design exam encode/import preview, row errors, verification, rejection, correction reason, and history.
- [ ] `P2-18` Design questionnaire, course, admission-rule, course-profile, approval/effective-version, and validation-case governance screens.
- [ ] `P2-19` Design report preview/download/reissue and print layout from the approved report.
- [ ] `P2-20` Design user/role/cycle administration, audit search, operational status, and restricted settings.
- [ ] `P2-21` Review all wireframes with Student Applicant, Guidance/Psychometrician/Admin, System Administrator, privacy, and accessibility representatives.
- [ ] `P2-22` Incorporate findings and obtain recorded design-baseline approval.

### 2C. Technical design

- [ ] `P2-23` Approve the layered architecture and deployment topology.
- [ ] `P2-24` Finalize the role/permission matrix and server-side policy map.
- [ ] `P2-25` Finalize the ERD, data dictionary, lifecycle/status fields, immutable history, indexes, retention, and deletion behavior.
- [ ] `P2-26` Finalize versioned API/OpenAPI contracts, validation errors, pagination, idempotency, concurrency, and downloads.
- [ ] `P2-27` Specify the deterministic recommendation algorithm, pseudocode, rule precedence, snapshots, explanations, and boundary cases.
- [ ] `P2-28` Define audit events, safe payloads, retention, access, and incident correlation.
- [ ] `P2-29` Define test traceability from FR/BR/US to unit, API, component, E2E, security, performance, UAT, SUS, and algorithm cases.
- [ ] `P2-30` Obtain architecture, database, API, algorithm, privacy, and test-design approval.

## Phase 3 - Development foundation

- [ ] `P3-01` Create the approved branch/review strategy, issue workflow, coding standards, environment examples, and secret-handling rules.
- [ ] `P3-02` Configure CI for frontend type-check/build/lint/tests and backend formatting/static analysis/tests after the backend exists.
- [x] `P3-03` After D-001 approval, configure Tailwind CSS v4 with `@tailwindcss/vite`; replace the starter global styling with the approved minimal global CSS.
- [x] `P3-04` Initialize shadcn/ui/Radix and install only the approved initial primitives as they become needed.
- [ ] `P3-05` Configure Lucide React, React Router, TanStack Query, React Hook Form/Zod, and TanStack Table integration patterns.
- [x] `P3-06` Create `components/ui`, `components/shared`, and feature-module boundaries.
- [x] `P3-07` Implement and test shared `PageHeader`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmActionDialog`, `CollectionToolbar`, and `DataTableToolbar`.
- [x] `P3-08` Implement neutral provisional theme tokens, body defaults, focus treatment, responsive layout utilities, error styles, and print styles. D-019 adds automated-evidence-backed light/dark semantic tokens, persistent accessible toggles, no-flash initialization, and theme-aware shared controls; rendered contrast review remains part of P3-15.
- [ ] `P3-09` Create the Laravel API only after D-002 and hosting/PHP feasibility are approved.
- [ ] `P3-10` Configure Sanctum/session/CORS/CSRF topology, environment separation, safe error envelopes, request IDs, and health checks. IN PROGRESS: same-origin/Vite-proxied Sanctum cookie sessions, CSRF, local stateful domains, JSON auth errors, and the default health route are implemented; production topology, explicit CORS policy, request IDs, and environment/deployment review remain pending.
- [ ] `P3-11` Create approved database migrations and factories from the finalized ERD; do not copy the provisional PostgreSQL appendix blindly.
- [ ] `P3-12` Implement roles/policies, audit infrastructure, state/version conflict handling, idempotency, and test-data factories.
- [ ] `P3-13` Deploy a non-feature staging skeleton and confirm HTTPS, API connectivity, logs, storage, jobs/scheduler, and database access.
- [ ] `P3-14` After OQ-014 approval, create a wrapper proof of concept using the same web build and verify auth, navigation, deep links, downloads, printing/sharing, updates, and device behavior.
- [ ] `P3-15` Verify the frontend foundation in a real browser at desktop and mobile widths, including keyboard focus, semantic structure, horizontal overflow, console errors, and rendered color contrast.

## Phase 4 - Access and account experience

Build the shared access experience as the first visible vertical slice after the foundation.

**Implementation note (updated 2026-07-29):** D-010-D-012 place the public introduction OUT OF SCOPE, prohibit role selection on the sign-in form, and name the combined role's portal `/admin`. D-020 confirms that multiple authorized counselors and psychometricians may each use an individual account assigned to that role. The shared RHF/Zod portals now use Laravel Sanctum cookie login, session restoration, logout, CSRF protection, reusable role middleware, server-confirmed portal entry, stable `401`/`403` errors, client recovery routes, and disabled-by-default environment-backed local sign-in fixtures for each role. Twenty Laravel tests, 126 frontend tests, lint, Pint, production build, migrations, and a live proxied login/me/logout/401 flow pass. P4 items remain unchecked because registration, recovery, approved account states, detailed API policies, production topology, rendered browser evidence, and stakeholder acceptance are incomplete.

- [ ] `P4-01` Implement responsive Student, combined Admin, and System Administrator portal entry screens using one shared sign-in component and no role picker.
- [ ] `P4-02` Implement labelled credential fields, known-safe client validation, password visibility, and explicit frontend-preview boundaries.
- [ ] `P4-03` Implement portal-matched UI workspace entry/sign-out without exposing fabricated data.
- [ ] `P4-04` Add access/workspace component, accessibility, responsive, validation, and interaction tests.
- [ ] `P4-05` Implement registration with approved fields, privacy acknowledgement/lawful flow, Zod/client validation, Laravel validation, duplicate prevention, and recoverable errors.
- [ ] `P4-06` Implement login, logout, password recovery, safe session handling, rate limits, and actionable errors. IN PROGRESS: login/logout/session restoration, CSRF, session rotation/invalidation, a provisional login throttle, and credential/network errors are implemented; recovery and approved production policy remain pending.
- [ ] `P4-07` Implement pending, inactive, locked, forbidden, and expired-session experiences.
- [ ] `P4-08` Implement route guards as UX only and prove API policies remain authoritative. IN PROGRESS: client guards wait for Laravel portal authorization; reusable server role middleware independently rejects unauthenticated and wrong-role requests for all three portal boundaries. Feature/action and ownership policies remain pending.
- [ ] `P4-09` Test authentication, authorization, recovery, validation, CSRF/session, keyboard, loading, and error paths.

## Phase 5 - Application shell and student application workflow

**Implementation note (2026-07-27):** The UI-only portion of P5-01 is IN
PROGRESS: role-aware desktop Sidebar with a tested 256px-to-80px icon-rail
collapse control,
left-opening mobile Sheet, sticky top bar, responsive content layout, labelled
module search, role module navigation, Breadcrumb, user Dropdown Menu, and
server-authorized routing are implemented and component-tested. Primary
dashboard, feature, module, detail, and breadcrumb surfaces now use the full
available workspace without the former `90rem` cap. Live-browser responsive
and keyboard evidence and real feature data remain pending, so P5-01 and P5-02
stay unchecked.

- [ ] `P5-01` Implement role-aware desktop Sidebar, mobile Sheet, Breadcrumb, user Dropdown Menu, content clearance, and responsive shell tests.
- [ ] `P5-02` Implement the student dashboard with real completion/status data, no fake metrics or controls.
  - UI evidence: the D-015 `/student` prototype now provides a functional
    next-action hero, six text-labelled journey stages, recommended next
    step, Student-only quick actions, read-only official-result boundary, and
    guidance-not-enrolment notice without vanity metrics. Production status
    data, domain APIs, browser review, and stakeholder acceptance remain
    pending, so this item is not marked complete.
- [ ] `P5-03` Implement applicant profile and admission-cycle application API, migrations, policies, validation, and audit events.
- [ ] `P5-04` Implement profile/application forms with autosave or explicit save as approved, dirty-state protection, review, submit, and conflict recovery.
  - UI evidence: the D-015 Student prototype provides mobile-first editable
    RHF/Zod fields, inline validation, explicit save/loading feedback,
    completion guidance, dirty-change protection, submission review and
    confirmation, a read-only submitted state, and loading/empty/retryable
    error surfaces. Approved production fields/lifecycle, persistence,
    conflict recovery, ownership, browser review, and E2E evidence remain
    pending, so this item stays unchecked.
- [ ] `P5-05` Implement own-record ownership tests and application lifecycle/state-transition tests.
- [ ] `P5-06` Implement the read-only official result/status page with provenance/verification information approved for student display.
  - UI evidence: the D-015 Student prototype provides an aligned feature
    header, responsive strictly read-only result summary, text-labelled
    verification state, source/reference metadata, verification history,
    correction-contact guidance, and loading/empty/retryable-error states.
    It exposes no Student write or Admin verification controls and makes no
    pass/fail or admission inference. OQ-002, approved production content,
    API ownership enforcement, browser review, and E2E evidence remain
    pending, so this item stays unchecked.
- [ ] `P5-07` Implement Admin result encoding/verification only when Phase 8 permissions are ready; do not let the student workflow write official values.
- [ ] `P5-08` Complete component, API, E2E, responsive, accessibility, and failure-state tests for the student application slice.

## Phase 6 - RIASEC assessment workflow

Do not start until OQ-003 and OQ-004 are approved.

**UI-only implementation note (updated 2026-07-28):** Under D-015, the STU-05
assessment-introduction prototype demonstrates general instructions,
synthetic version/readiness context, notice acknowledgement, confirmation,
session opening, and inactive/loading/empty/error states. STU-06 adds an
isolated synthetic one-question flow, local autosave/resume, offline and
stale-version recovery, response review/editing, incomplete-submit prevention,
confirmation, and completed locking. These fixtures provide no approved
mapping, scoring, interpretation, validation, or recommendation behavior.
STU-07 adds an isolated read-only result visualization with a synthetic top
code, six labelled numeric bars, session/version provenance, and
loading/empty/error/preparing states without diagnosis, admission, enrolment,
eligibility, or recommendation claims. P6-04/P6-05/P6-06 remain unchecked
because the approved instrument/scoring/interpretation, production server
lifecycle, durable autosave/idempotency, browser evidence, and psychometrician
acceptance are incomplete.

- [ ] `P6-01` Implement questionnaire version, question, approval/effective lifecycle, assessment session, response, and score migrations.
- [ ] `P6-02` Implement server-side questionnaire governance and reject inactive/unapproved versions.
- [ ] `P6-03` Implement the exact approved scoring as a pure, versioned, deterministic service with psychometrician-approved cases.
- [ ] `P6-04` Implement assessment instructions, notice/consent, progress, autosave, resume, keyboard behavior, review, submission confirmation, and locked-completed state.
- [ ] `P6-05` Prevent duplicate submission and handle stale version/network interruption without losing saved responses.
- [ ] `P6-06` Implement the approved six-dimension/top-code result and interpretation without diagnostic language.
- [ ] `P6-07` Prove submitted responses/scores are immutable and version-linked.
- [ ] `P6-08` Complete unit, API, component, E2E, accessibility, privacy, and psychometrician validation evidence.

## Phase 7 - Course catalogue and recommendation workflow

Do not start until OQ-002, OQ-005, and OQ-009 are approved.

**UI-only implementation note (2026-07-28):** Under D-015, STU-08 through
STU-10 now demonstrate responsive recommendation results, complete course
details, two-to-three-course comparison, and editable Student preference
capture with confirmation and history. The assessment result hands off to
guidance, and guidance hands off to the decision module. Synthetic courses,
ranks, values, factors, statuses, career directions, decisions, and references
are presentation fixtures only. P7-01 through P7-09 remain unchecked because
approved catalogue/rules/weights, deterministic engine, production persistence
and authorization, browser evidence, guidance review, and end-to-end
validation are incomplete.

- [ ] `P7-01` Implement course, course-profile version, admission-rule version, approval/effective lifecycle, and validation-case storage.
- [ ] `P7-02` Implement Admin course/rule/profile management with server policies, reasoned changes, audit, and historical preservation.
- [ ] `P7-03` Implement eligibility evaluation with approved score field, direction, inclusivity, precedence, exceptions, and boundary tests.
- [ ] `P7-04` Implement RIASEC fit and academic components with approved normalization, weights, missing-data, and tie-break rules.
- [ ] `P7-05` Implement deterministic recommendation generation with idempotency and immutable input/version snapshots.
- [ ] `P7-06` Store ranks, component scores, eligibility, exclusions, explanations, and governing versions.
- [ ] `P7-07` Implement student recommendation results, course details, comparison, â€œwhy/why not,â€ and accessible non-color status.
- [ ] `P7-08` Implement accept/reject/undecided/other decision capture without treating it as enrolment.
- [ ] `P7-09` Complete approved algorithm cases, determinism, policy, component, E2E, performance, and explanation review.
- [ ] `P7-10` Keep ML DEFERRED unless the full ADR-004 gate and separate approval are satisfied.

## Phase 8 - Guidance/Psychometrician/Admin, reporting, and final System Administrator slice

**Student report UI note (2026-07-28):** STU-11 provides a D-015 own-record
document preview with assessment/recommendation/decision references, ranked
guidance, current preference, limitations, browser printing, text download,
and loading/empty/error/preparing states. It is not an approved report layout,
signatory record, secure production export, or archive format. Reporting
checklist items remain unchecked pending OQ-010, Laravel generation/storage/
authorization, browser/print evidence, and stakeholder acceptance.

**Implementation note (2026-07-28):** The UI-only portions of P8-02 through
P8-07 are IN PROGRESS under D-013-D-015. `/admin/applicants`,
`/admin/official-results`, `/admin/exam-results/new`, `/admin/imports/new`,
`/admin/imports/:id`, `/admin/assessments`,
`/admin/questionnaires`, and
`/admin/recommendations`, `/admin/validation-cases`, `/admin/decisions`,
`/admin/courses`, `/admin/rules`, and
`/admin/reports` list/detail routes
implement synthetic records, functional filtering, task-specific responsive
layouts, applicant linking, staged manual/CSV result entry and reconciliation,
validation-case comparison, decision review, result/session progress,
questionnaire-version/item preview, and history presentation with borderless
`shadow-sm` cards. Applicant and Official Result queues retain dense comparison
tables; Assessments uses workflow lanes; Recommendations uses review cards with
ranked courses, match/eligibility, explanations, version snapshots; Courses and
Rules present catalogue metadata,
classification, interest profiles, rule conditions, effective periods, and
history. Report routes use a featured document library with type/status
filtering, responsive previews, document detail,
source-version traceability, cross-record navigation, and browser print CSS.
D-015 keeps internal blockers out of the stakeholder-facing prototype;
official production fields, scoring, report layout/signatories,
governance/actions, data, authorization, browser evidence, and E2E tests remain
pending, so these checklist items stay unchecked.

The `/admin` dashboard directly follows the D-018 reference hierarchy and uses
the available wide/zoomed-out workspace instead of a fixed content cap. Shared
Admin routes support loading, empty, and retryable error states; focused
forbidden, session-expired, and not-found recovery screens are implemented.
The Admin route group is lazy-loaded and shell, definition, breadcrumb,
navigation, and feature-content responsibilities are separated. Sixty-two
automated tests are organized across 11 focused files. Production data,
authorization, browser evidence, and stakeholder approval remain pending.

- [ ] `P8-01` Implement the Guidance/Psychometrician/Admin dashboard with authorized, meaningful operational summaries only.
  - UI evidence: D-018 aligns the D-015 prototype directly with the supplied
    violet reference through a hero, five functional summaries, 7/30-day
    operational activity, assessment and recommendation-review charts,
    responsive recent applicants, and latest activity. Redundant dashboard
    breadcrumbs, module search/cards, priority cards, queue, quick actions, and
    workflow-stage cards were removed; feature workflows remain accessible
    through the Sidebar/Sheet and dedicated routes. The fluid dashboard and
    desktop sidebar icon rail address wide/zoomed-out workspace use. Unsupported
    success-rate and recommendation-accuracy claims remain excluded.
    Production data, authorization, browser review, and stakeholder acceptance
    remain pending, so this item is not marked complete.
- [ ] `P8-02` Implement applicant search/filter/sort/pagination with TanStack Table, server allowlists, and responsive small-screen behavior.
- [ ] `P8-03` Implement Admin applicant detail and recommendation review with permission-specific actions. Synthetic validation-case and student-decision review UI is IN PROGRESS; approved cases, visibility, persistence, authorization, and audit remain blocked.
- [ ] `P8-04` Implement exam manual encoding, verification/rejection, correction reason, immutable correction history, and audit. The staged manual-entry UI prototype is IN PROGRESS under D-015; production persistence, permissions, official validation, audit, and remaining actions are blocked.
- [ ] `P8-05` Implement CSV import preview, validation, row-level errors, reconciliation, idempotency, job status, and safe retry/rollback. Local preview and synthetic reconciliation UI are IN PROGRESS under D-015; the official contract, server validation, persistence, jobs, idempotency, audit, and safe retry remain blocked.
- [ ] `P8-06` Implement questionnaire/course/rule/profile governance screens from the approved lifecycles.
- [ ] `P8-07` Implement the approved report, secure generation/download, print CSS, version references, signatories, reissue/correction, and access logs.
- [ ] `P8-08` Implement notification/alert behavior only where approved; use Sonner only for non-critical feedback.
- [ ] `P8-09` Complete Admin ownership, responsive tables, imports, reports, audit, accessibility, and E2E tests.
- [ ] `P8-10` Implement the limited System Administrator user/role, admission-cycle, account-status, audit-search, job/health, backup-status, and approved operational settings as the final role-specific panel.
  - UI evidence: ADM-01 now provides a responsive technical-operations
    dashboard with functional period summaries, navigable user/role/cycle/
    audit actions, access-review work, text-labelled service states, recent
    audit activity, module search, and an explicit boundary from guidance
    workflows. D-015 counts and states are presentation fixtures only.
    Remaining System Administrator feature screens, production monitoring,
    Laravel policies/APIs, browser evidence, and stakeholder approval are
    incomplete, so this item stays unchecked.

## Phase 9 - System testing and hardening

- [ ] `P9-01` Run frontend type-check, lint, unit/component tests, and production build.
- [ ] `P9-02` Run Laravel formatting/static analysis as configured, unit/feature/API tests, and production dependency checks.
- [ ] `P9-03` Run complete Student Applicant, Guidance/Psychometrician/Admin, and System Administrator E2E/SBT workflows.
- [ ] `P9-04` Verify all protected routes with unauthenticated, wrong-role, cross-owner, inactive-account, and direct-API attempts.
- [ ] `P9-05` Test approved scoring/rule boundaries, ties, version changes, historical reproduction, and duplicate/concurrent requests.
- [ ] `P9-06` Test loading, empty, error, blocked, permission, stale, retry, and interrupted-form recovery states.
- [ ] `P9-07` Complete keyboard, focus, labels/descriptions, semantic structure, zoom/reflow, contrast, screen-reader spot checks, and responsive-table checks.
- [ ] `P9-08` Run approved browser, responsive-device, and selected-wrapper compatibility tests.
- [ ] `P9-09` Run staging performance/load tests using the approved workload and tune queries/indexes without changing rules.
- [ ] `P9-10` Complete security/privacy review: secrets, dependencies, sessions/CSRF/CORS, validation, access, logs, exports, file access, retention, and deletion.
- [ ] `P9-11` Test backup restore, file/report recovery, failed-job recovery, migration rollback/recovery, and release rollback.
- [ ] `P9-12` Fix implementation-caused failures; triage remaining defects with severity, owner, evidence, and release decision.
- [ ] `P9-13` Freeze MVP features when the approved release criteria are met.

## Phase 10 - Deployment and UAT

- [ ] `P10-01` Prepare production-like staging with separate secrets, database, storage, queues/scheduler, email if approved, and monitoring.
- [ ] `P10-02` Deploy the release candidate through the documented automated/reproducible process.
- [ ] `P10-03` Run staging migrations, seed only approved reference data, and verify counts/relationships.
- [ ] `P10-04` Run staging smoke, core E2E, security, performance, report/print, monitoring, backup, restore, and rollback checks.
- [ ] `P10-05` Prepare approved anonymized/synthetic UAT cases, participant instructions, consent/privacy handling, and support contacts.
- [ ] `P10-06` Conduct role-based UAT and record completion, assistance, failures, findings, and sign-off.
- [ ] `P10-07` Administer SUS to the approved sample without fabricating or selectively reporting results.
- [ ] `P10-08` Conduct psychometrician algorithm validation against approved cases and record agreement/discrepancies.
- [ ] `P10-09` Fix accepted findings and rerun affected regression/UAT cases.
- [ ] `P10-10` Obtain conditional or final UAT, privacy, security, algorithm, and operational approval.

## Phase 11 - Review, launch, and handover

- [ ] `P11-01` Review requirements-to-feature-to-test traceability and confirm no P0 item lacks evidence.
- [ ] `P11-02` Reconcile the application, diagrams, ERD, API, algorithm specification, screenshots, manuscript, manuals, and changelog.
- [ ] `P11-03` Prepare release notes, known limitations, support/escalation, incident procedure, retention operations, maintenance plan, and rollback plan.
- [ ] `P11-04` Prepare Student, Admin, System Administrator, installation, backup/restore, and troubleshooting documentation.
- [ ] `P11-05` Rehearse the defense demonstration and verify every claim against repository/test/approval evidence.
- [ ] `P11-06` Create and verify the final pre-production backup and restore evidence.
- [ ] `P11-07` Obtain explicit production launch approval from the authorized owner.
- [ ] `P11-08` Deploy the approved saved release, run migrations, and perform production smoke tests.
- [ ] `P11-09` Monitor authentication, core workflows, jobs, errors, performance, backups, and alerts during the launch window.
- [ ] `P11-10` Record actual launch results, incidents, fixes, release tag, environment version, and owner acceptance.
- [ ] `P11-11` Complete training and handover; verify accounts, operating procedures, support contacts, backups, and access ownership.
- [ ] `P11-12` Conduct the post-launch review, prioritize corrective work, and separate MVP fixes from Phase 2 enhancements.
- [ ] `P11-13` Mark the project launch COMPLETED only after production evidence, stakeholder acceptance, and handover are recorded.

## Deferred Phase 2 work

- [ ] `P12-01` ML experiment/model workflow. DEFERRED until OQ-011 and ADR-004 gates are fully approved.
- [ ] `P12-02` Notifications, appointment scheduling, guidance notes, external integrations, capacity awareness, advanced offline workflows, or long-term outcomes. DEFERRED pending separate scope/privacy approval.
- [ ] `P12-03` Separate native Android/iOS feature implementation. OUT OF SCOPE; a non-native wrapper of the single web codebase is governed by D-008/ADR-005.

## Completion evidence log

Add one row whenever an item is checked.

| Checklist ID | Completed date | Owner | Implementation/commit | Tests and result | Review/approval evidence | Documentation updated |
|---|---|---|---|---|---|---|
| P0-01-P0-05 | 2026-07-26 | Capstone documentation setup | Repository documentation | Link, metadata, consistency, and source review | Planning baseline approved 2026-07-26 | Index, roadmap, sprint, progress, changelog |
| P0-06-P0-07, P1-13 | 2026-07-26 | Team/adviser confirmation supplied by user | D-001 and documentation records | Documentation consistency/link validation | Explicit approval in Codex project session | ADR-001, UI/UX, architecture, decisions, open questions, sprint, progress, changelog |
| P1-14 | 2026-07-27 | Team/adviser confirmation supplied by user | D-007 and role documentation | Documentation consistency/role-count validation | Explicit approval in Codex project session | Roles, requirements, API, roadmaps, decisions, open questions, ADRs, changelog |
| D-020 clarification | 2026-07-29 | Team clarification supplied by user | Combined Admin role-holder model | Documentation consistency and existing many-user role-storage review | Explicit user clarification in Codex project session | Roles, requirements, API, security, roadmaps, decisions, open questions, sprint, progress, changelog |
| P3-03, P3-04, P3-06-P3-08 | 2026-07-27 | Frontend/QA | `apps/web` Tailwind/shadcn/Radix configuration, provisional theme, UI/shared components, providers, and feature boundary | Lint passed; 9 Vitest tests in 2 files passed; axe-core reported no detectable violations with rendered contrast excluded; production build passed; live development server returned HTTP 200 | D-001 and explicit user approval to start Development Slice 1; P3-15 remains pending | UI/UX plan, testing strategy, roadmap, backlog, sprint, progress, checklist, changelog |

Related documents: [Requirements](05-FUNCTIONAL-REQUIREMENTS.md), [Business Rules](06-BUSINESS-RULES.md), [Role-Based Feature Roadmap](24-ROLE-BASED-FEATURE-ROADMAP.md), [Testing Strategy](13-TESTING-STRATEGY.md), [Deployment Plan](20-DEPLOYMENT-PLAN.md), and [Defense Readiness](21-DEFENSE-READINESS.md).
