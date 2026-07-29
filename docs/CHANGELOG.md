# Documentation Changelog

**Purpose:** Record meaningful controlled-document changes.  
**Status:** IN PROGRESS.  
**Basis:** Repository documentation workflow.  
**Owner:** Capstone documentation lead.  
**Last updated:** 2026-07-29.
**Related IDs:** D-001-D-020.
**Open questions:** [22-OPEN-QUESTIONS.md](22-OPEN-QUESTIONS.md).

## 2026-07-29 - Multiple individual Admin role holders

### Approved

- Recorded D-020: the combined `Guidance/Psychometrician/Admin` role is one
  application-role type and portal, not one person.
- Confirmed that multiple authorized guidance counselors and psychometricians
  may each hold the role through a distinct individual account.
- Kept the application-role count at exactly three; no separate Counselor or
  Psychometrician role was added.

### Changed

- Replaced UI wording that could imply one Admin person with shared-role
  wording.
- Updated role, requirements, API, security, open-question, roadmap, sprint,
  progress, backlog, and delivery documentation.
- Clarified that shared staff credentials are prohibited and privileged work
  must remain attributable to the acting account.

### Validation

- Frontend lint and all 126 frontend tests across 22 files passed.
- Laravel Pint and all 20 Laravel tests passed.
- The existing many-to-many role storage requires no schema change and now has
  explicit coverage for two individual accounts holding the Admin role.

### Remaining blockers

- OQ-007 still controls whether one account may hold multiple different role
  types and the account approval/authentication policy.
- OQ-008 still controls action-level permission differences, approvers, and
  separation of duties among counselors and psychometricians.

## 2026-07-29 - Unified role dark palette

### Corrected

- Unified Student, Admin, and System Administrator dark surfaces on the
  Admin palette: `#0b1220` canvas, `#121d2d` cards and dark feature surfaces,
  and `#172437` muted/supporting surfaces.
- Removed the separate violet Student feature-surface and brown warm-surface
  appearance in dark mode while retaining semantic accents and status colors.
- Added a token contract test preventing role surface aliases from drifting
  away from the shared dark palette.

### Validation

- Frontend lint passed.
- All 125 frontend tests across 22 files passed.
- Frontend production build passed.
- Rendered browser contrast review remains pending.

## 2026-07-28 - System-wide dark mode

### Added

- Added D-019 and a shared theme provider with persistent `light`/`dark`
  preference, semantic root state, and pre-React dark initialization.
- Added accessible theme controls to all three portal entry screens,
  authenticated workspace top bars, and recovery routes.
- Added dark semantic tokens for canvases, surfaces, typography, controls,
  focus, brand accents, charts, and shadows while preserving white print
  output.
- Added theme-aware notification rendering and three focused tests for
  switching, persistence/restoration, and recovery-screen availability.

### Corrected

- Replaced hard-coded white and gray shared Input, Textarea, and manual-result
  Select surfaces with semantic background, input, foreground, and focus
  tokens.

### Validation

- Frontend lint passed.
- All 124 frontend tests across 22 files passed.
- Frontend production build passed.
- `DESIGN.md` lint and in-app browser light/dark responsive, keyboard,
  console, chart, print, and computed-contrast verification remain pending
  because the external linter returned no usable result and the browser target
  was unavailable.

## 2026-07-28 - System Administrator dashboard

### Added

- Replaced the generic System Administrator landing view with a distinct
  technical-operations dashboard for ADM-01.
- Added functional 24-hour/7-day summaries, user/role/cycle/audit navigation,
  ranked access-review work, text-labelled service states, recent audit
  activity, module search, and a visible technical-responsibility boundary.
- Added five focused tests for dashboard content, period changes, module
  actions, search, role isolation, and automated accessibility.

### Guardrails

- Kept psychometric interpretation, official-result work, recommendation
  review, and admission decisions out of the System Administrator workspace.
- Kept all D-015 counts and states isolated from production monitoring, audit,
  backup, policy, and validation evidence.
- ADM-01 remains IN PROGRESS - UI ONLY pending OQ-001/OQ-007/OQ-008,
  production APIs and policies, browser evidence, and stakeholder acceptance.

### Validation

- Frontend lint passed.
- All 121 frontend tests across 21 files passed.
- Frontend production build passed.
- The required `DESIGN.md` lint was attempted, but the npm-backed command
  could not produce a report in this environment.
- Rendered desktop/mobile, keyboard, overflow, and console inspection remains
  pending because the in-app browser target is unavailable.

## 2026-07-28 - Remaining Student panel UI

### Added

- Expanded the Student dashboard from four to six journey areas and added
  direct Sidebar, mobile Sheet, search, quick-access, and workflow navigation
  for My decision and My report.
- Completed STU-09 course details with program metadata, learning areas,
  general career directions, recorded factors, review notes, and responsive
  two-to-three-course comparison.
- Completed STU-10 preference capture with RHF/Zod validation, four labelled
  decisions, confirmation, editable recorded state, visible local history,
  guidance/report transitions, and integrated loading/empty/error states.
- Completed STU-11 with an own-record document preview, source references,
  ranked guidance, current decision, limitations, functional browser printing,
  text download, and loading/empty/error/preparing states.
- Added focused interaction, validation, state, role-boundary, navigation,
  print/download, and automated accessibility coverage.

### Guardrails

- D-015 course, ranking, career, decision, report, version, and identity data
  are presentation fixtures only. They do not establish official catalogue,
  eligibility, admission, employment, assignment, enrolment, report,
  signatory, validation, or production records.

### Verified

- One hundred sixteen frontend tests across 20 files, frontend lint, and
  production build pass without an oversized-chunk warning.
- The required DESIGN.md linter was attempted twice but exited without a
  report after registry/cache access failed in the restricted environment.

### Pending

- OQ-005/OQ-009/OQ-010, production Laravel domain APIs and ownership,
  deterministic recommendation logic, idempotent decision storage, secure
  report generation/download, rendered mobile/desktop/print review, guidance
  acceptance, and E2E evidence remain pending.

## 2026-07-28 - Student recommendation results

### Added

- Added a responsive Student Course guidance module with ranked recommendation
  cards, explicit requirement states, numeric match values, explanation
  factors, and recommendation provenance.
- Added functional status filters, focused course details, reversible
  comparison selection for two or three courses, and a direct handoff from
  the Student assessment result.
- Added loading, empty, retryable-error, and preparing states plus route,
  interaction, role-boundary, state, and automated accessibility coverage.

### Guardrails

- D-015 courses, ranks, match values, eligibility labels, factors, and version
  references are presentation fixtures only. They do not establish official
  TCC catalogue data, rules, thresholds, weights, validation evidence,
  admission, enrolment, or production seed data.

### Verified

- One hundred four frontend tests across 18 files, frontend lint, and
  production build pass without an oversized-chunk warning.

### Pending

- OQ-002/OQ-005/OQ-009 approval, production deterministic recommendation
  engine/API/ownership, rendered mobile/desktop review, guidance acceptance,
  and E2E evidence remain pending.

## 2026-07-28 - Student assessment result

### Added

- Added a functional handoff from the locked submitted-assessment state to a
  responsive Student Assessment Result.
- Added a focused top-code summary, six text-labelled numeric dimension bars,
  leading-dimension order, result/session/assessment-version provenance,
  read-only and guidance boundaries, and loading, empty, retryable-error, and
  preparing states.
- Added content, state, role-boundary, provenance, and automated accessibility
  coverage.

### Guardrails

- D-015 values and ordering are visualization fixtures only. The screen makes
  no approved scoring, norm, interpretation, mapping, validation,
  recommendation, eligibility, diagnosis, admission, or enrolment claim.

### Verified

- Ninety-seven frontend tests across 17 files, frontend lint, and production
  build pass.

### Pending

- OQ-004 approval, production Laravel API and ownership, psychometrician
  validation, rendered mobile/desktop review, stakeholder acceptance, and E2E
  evidence remain pending.

## 2026-07-28 - Student assessment session

### Added

- Connected the acknowledged assessment introduction directly to a responsive
  Student session with one-question mobile presentation, desktop progress
  navigation, accessible response controls, and explicit answered progress.
- Added local autosave/resume, save-and-exit, saved/offline/unsaved feedback,
  offline retry, full response review/editing, incomplete-submit prevention,
  accessible submission confirmation, stale-version recovery, and a locked
  completed state.
- Added focused component, persistence, recovery, submission-lock, role
  boundary, and automated accessibility coverage.

### Guardrails

- Session prompts and choices are isolated D-015 interaction fixtures. The UI
  calculates no RIASEC mapping, score, interpretation, validation result, or
  course outcome.

### Verified

- Ninety-one frontend tests across 16 files, frontend lint, and production
  build pass.

### Pending

- OQ-003/OQ-004 approval, production server persistence, duplicate-submit
  protection, authorization/ownership, rendered mobile/desktop review,
  psychometrician acceptance, and E2E evidence remain pending.

## 2026-07-28 - Student assessment introduction

### Added

- Added a mobile-first and desktop-responsive Student Interest Assessment
  introduction with general expectations, synthetic active-version/readiness
  context, a non-diagnostic notice, acknowledgement and confirmation gates,
  and a functional session-opening transition.
- Added inactive, loading, empty, and retryable-error states plus component,
  interaction, role-isolation, and automated accessibility coverage.

### Guardrails

- Excluded questionnaire items, response options, mappings, scoring,
  interpretations, and validation claims pending OQ-003/OQ-004 approval.

### Verified

- Eighty-four frontend tests across 15 files, frontend lint, and production
  build pass.

### Pending

- Production session APIs and ownership, approved instrument content and
  lifecycle, rendered mobile/desktop review, psychometrician acceptance, and
  end-to-end evidence remain pending.

## 2026-07-28 - Student feature header and Official Result

### Changed

- Aligned Student feature pages with the Admin header hierarchy: title and
  description first, breadcrumb underneath, and no duplicate Dashboard back
  row.
- Preserved dirty-change protection by routing the editable profile
  breadcrumb through its guarded navigation action.

### Added

- Added a responsive strictly read-only Student Official Result screen with a
  visible verification state, record/source metadata, verification history,
  correction-contact guidance, and loading/empty/retryable-error states.
- Added explicit role-boundary coverage proving the Student screen exposes no
  result editing or Admin verification controls.

### Verified

- Seventy-eight frontend tests across 14 files, frontend lint, and production
  build pass.

### Pending

- OQ-002 approval, official result format/status/correction guidance,
  production data and ownership APIs, rendered mobile/desktop review, and
  stakeholder acceptance remain pending.

## 2026-07-28 - Student responsive parity clarification

### Changed

- Clarified that Student screens are mobile-first, not mobile-only.
- Required the Student panel to retain the same responsive web-shell quality,
  available desktop canvas, collapsible navigation, spacing discipline, and
  overflow protection as the Admin panel while keeping Student-specific
  content and navigation patterns.

## 2026-07-28 - Student Panel Slice 2 profile and application

### Added

- Added a mobile-first Student Profile & application module with readable
  stacked sections, 48px controls, 16px mobile form text, explicit edit/save
  actions, and a constrained desktop reading width.
- Added RHF/Zod validation, completion guidance, saving feedback,
  dirty-change protection, a submission checklist and confirmation dialog,
  and a read-only submitted state.
- Added loading, empty, retryable-error, validation, draft, saving, and
  submitted component states using isolated D-015 mock data.

### Verified

- Added Student role-isolation, editing/validation, save/submission,
  dirty-change, shared-state, and accessibility coverage.
- Seventy-three frontend tests across 13 files, frontend lint, and production
  build pass.

### Pending

- OQ-005/OQ-006 approval, production fields and lifecycle, Laravel APIs,
  ownership, persistence, conflict recovery, rendered mobile/desktop review,
  and stakeholder acceptance remain pending.

## 2026-07-28 - Student Panel Slice 1 journey dashboard

### Added

- Replaced the generic `/student` overview with a task-oriented Student
  dashboard containing a next-action hero, four text-labelled journey stages,
  a recommended next step, Student-only quick actions, and the visible
  guidance-not-enrolment boundary.
- Added isolated synthetic Student journey state under D-015 without scores,
  thresholds, course rankings, admission likelihood, or success metrics.
- Connected every dashboard action to an existing Student module while
  preserving top-bar module search and the shared responsive shell.

### Verified

- Added Student dashboard role-isolation, next-action, read-only-result
  navigation, and automated accessibility coverage.
- Sixty-seven frontend tests across 12 files, frontend lint, and production
  build pass.

### Pending

- Production status data, approved Student workflows, domain APIs, ownership
  enforcement, browser-rendered responsive/keyboard review, and stakeholder
  acceptance remain pending.

## 2026-07-28 - Fluid width across all workspace features

### Changed

- Removed the fixed `90rem` wrapper from every Admin list and detail page,
  shared role dashboard, module view, and workspace breadcrumb.
- Standardized primary workspace surfaces on `w-full` so expanded and
  collapsed sidebar layouts continue using the available canvas at wide
  viewport and zoomed-out sizes.
- Preserved intentional reading-width constraints for forms, dialogs, notices,
  and document content.

### Verified

- Added coverage across the six primary Admin feature surfaces.
- Sixty-three frontend tests across 11 files, frontend lint, and production
  build pass.
- Source inspection confirms no `max-w-[90rem]` or equivalent `max-w-360`
  workspace wrappers remain.

### Pending

- Browser-rendered wide-screen, 75% zoom, desktop/mobile, keyboard, overflow,
  console, and contrast verification remains pending if the in-app browser is
  unavailable.

## 2026-07-28 - Admin dashboard wide-view and collapsible icon rail

### Changed

- Removed the Admin dashboard's fixed `90rem` content cap so the reference
  layout uses the available workspace at wide viewport and zoomed-out sizes.
- Added a labelled edge chevron that collapses the 256px desktop sidebar into
  an 80px icon rail instead of removing navigation; the existing mobile
  navigation Sheet remains unchanged.
- Preserved active module styling in collapsed mode and added accessible names
  plus right-side tooltips for every navigation icon and sign-out.

### Verified

- Frontend lint and production build pass.
- Sixty-two frontend tests across 11 files pass, including the desktop
  expanded/icon-rail interaction.

### Pending

- Browser-rendered 75% zoom, desktop/mobile, keyboard, overflow, console, and
  contrast verification remains pending if the in-app browser is unavailable.

## 2026-07-28 - Admin dashboard visual and operational redesign

### Added

- Rebuilt `/admin` around a compact page header, responsive violet guidance
  hero, four project-specific priority summaries, ranked work queue, quick
  actions, workflow status, activity, and module access.
- Added Recharts operational-activity and assessment-session visualizations
  using isolated D-015 mock data, explicit legends, and a functional 7/30-day
  period control.
- Added semantic chart-blue, chart-teal, and chart-slate visualization tokens.
- Recorded D-017 for Recharts-based, project-specific operational
  visualizations and explicit exclusion of unsupported performance claims.

### Changed

- Removed the reference design's unsupported success-rate, recommendation-
  accuracy, generic user, and enrollment-style metrics from the implemented
  information architecture.
- Split Recharts and `react-is` into a dedicated vendor chunk; the Admin route
  chunk is approximately 166 kB and the build no longer emits the 500 kB
  warning.

### Verified

- Sixty-one frontend tests across 11 files, frontend lint, and production
  build pass.

### Pending

- Real-browser desktop/mobile, keyboard, overflow, console, and rendered
  contrast verification remains pending because the in-app browser is
  unavailable.

## 2026-07-28 - Reference-aligned Admin dashboard simplification

### Changed

- Recorded D-018 and rebuilt `/admin` to directly follow the supplied violet
  dashboard hierarchy.
- Removed the dashboard breadcrumb/title block, module search, module cards,
  priority cards, work queue, quick actions, and workflow-stage cards.
- Kept detailed modules available through the persistent Sidebar/Sheet instead
  of duplicating navigation inside the dashboard.
- Added five compact functional summary cards with sparklines, a third
  recommendation-review visualization, responsive recent-applicant records,
  and a complete latest-activity list.

### Verified

- Sixty-one frontend tests across 11 files, frontend lint, and production build
  pass. The build has no oversized-chunk warning.

### Pending

- Real-browser desktop/mobile, keyboard, overflow, console, and rendered
  contrast verification remains pending because the in-app browser is
  unavailable.

## 2026-07-28 - Sanctum authentication foundation and Admin access

### Added

- Added Laravel Sanctum first-party SPA authentication with CSRF-cookie
  initialization, session regeneration/invalidation, and stateful API
  middleware.
- Added the approved three-role catalogue and user-role assignment migration
  without deciding the still-open account-multiplicity policy.
- Added `/api/v1/auth/login`, `/api/v1/auth/me`, and `/api/v1/auth/logout`, portal-role
  matching, guest protection, and a provisional five-attempt login throttle.
- Added `/api/v1/auth/authorize/{portal}`, reusable Laravel role middleware,
  stable API `401`/`403` codes, and tests for every approved portal boundary.
- Added a typed React auth client/context, session restoration, protected
  routes that wait for server portal authorization, expired/forbidden recovery,
  real logout, preserved server validation errors, and Vite API proxy.
- Added a local-only interactive `auth:create-local-admin` command so
  development credentials are chosen locally and never committed.
- Added disabled-by-default local authentication seed accounts for Student,
  Admin, and System Administrator. Passwords come only from the ignored local
  environment; production execution and conflicting role reassignment are
  rejected.

### Verified

- Nineteen Laravel unit/feature tests pass, including all three role boundaries,
  cross-role denial, policy-neutral multi-role membership, safe local Admin
  provisioning, and idempotent opt-in local account seeding.
- Sixty-one frontend tests across 11 files pass; frontend lint and production build
  pass; Laravel Pint passes.
- Local MySQL auth migrations and role seeding ran successfully.
- A live Vite-proxied flow verified CSRF initialization, Admin login, current
  session retrieval, logout, and a subsequent `401`.

### Pending

- Registration, password recovery, approved account states, Admin-specific
  authentication requirements, feature/action policies, and production
  topology remain governed by OQ-007/OQ-008 and related decisions.
- Real-browser desktop/mobile, keyboard, focus, overflow, console, and rendered
  contrast evidence remains pending because the in-app browser is unavailable.

## 2026-07-28 - Admin import, validation, decision, and shared-shell slices

### Added

- Added AT-04 `/admin/imports/new` with local CSV selection, sample preview,
  required-column/row validation, a task-appropriate responsive preview table,
  loading/error/empty states, and confirmation.
- Added AT-05 `/admin/imports/:id` with batch summaries, outcome filters,
  reconciliation cards, issue explanations, missing-batch handling, and retry
  feedback.
- Added GP-08 `/admin/validation-cases` with case search/filtering,
  expected-versus-output comparison, version snapshots, discrepancy states,
  and rerun feedback.
- Added GP-10 `/admin/decisions` with searchable decision cards, selected
  details, source-recommendation navigation, and a non-enrolment boundary.
- Added shadcn-aligned Breadcrumb and Radix Dropdown Menu primitives, functional
  workspace breadcrumbs, and an account menu with sign-out.

### Changed

- Integrated LoadingState, EmptyState, and ErrorState into delivered workflows
  and aligned empty/loading cards to the borderless `shadow-sm` rule.
- Updated design, UI/UX, backlog, sprint, progress, delivery checklist, and
  role-roadmap records for the five UI-only slices.

### Evidence

- Added import preview/reconciliation, validation-case, decision-review,
  breadcrumb, user-menu, shared-state, and automated accessibility coverage.
- The frontend suite contains 44 passing tests; lint and production build pass.
- Browser-rendered responsive/keyboard review remains pending.

## 2026-07-28 - Admin Manual Result Entry prototype

### Added

- Added `/admin/exam-results/new` and an Official Results action that opens the
  staged manual-entry workflow.
- Added a modular RHF/Zod form, isolated validation schema, complete-record
  review, accessible confirmation dialog, and mock verification-queue success
  state.
- Added the shared shadcn-aligned Textarea primitive used by the source note.

### Changed

- Updated the design authority, UI/UX plan, backlog, sprint, progress tracker,
  delivery checklist, and role roadmap for AT-03's UI-only status.

### Evidence

- Added route, validation, review, confirmation, success-state, and automated
  accessibility coverage. The current frontend suite contains 37 tests.
- Frontend lint and production build pass. Browser-rendered review remains
  pending.

## 2026-07-28 - Assessment workflow card responsive repair

### Changed

- Rebuilt the Admin assessment-session card around the workflow lane width:
  identity and status are separated, progress spans the card, and activity plus
  the primary action use a responsive footer.
- Removed the fixed-width inner desktop grid that compressed applicant names,
  identifiers, status badges, and progress content in two-column workflow
  lanes.
- Synchronized the UI authority, backlog, sprint, and progress records with the
  repaired lane-native card pattern.

### Evidence

- Added regression coverage for intact applicant/session metadata and the
  accessible response-progress value.
- Frontend lint passed, all 34 tests passed, and the production build passed.
- The local assessment route returned HTTP 200. Browser-rendered verification
  remains pending because the in-app browser target was unavailable.

## 2026-07-26 - PROVISIONAL baseline

### Added

- Root repository governance and project README.
- Documentation index, overview, sources, requirements, architecture, database, recommendation, API, UI/UX, security/privacy, testing, roadmap, backlog, sprint, progress, decisions, risks, deployment, defense, and open-question records.
- Architecture decision records and reusable task/test/decision/meeting templates.

### Changed

- Moved the two source PDFs from `docs/` into `docs/reference/` to match the controlled structure.

### Preserved

- Existing `apps/web` React/Vite scaffold, source, packages, and README were not modified.

### Evidence

- Both reference PDFs inspected.
- Repository application status recorded as 0%; no unsupported test, UAT, SUS, deployment, ML, or launch claims accepted.

## 2026-07-26 - Proposed frontend UI and styling decision

### Changed

- Expanded D-001 and ADR-001 to specify React/Vite/TypeScript with Tailwind CSS v4, shadcn/ui/Radix, Lucide React, React Hook Form + Zod, TanStack Query, and TanStack Table.
- Defined component ownership, initial shadcn primitives, application-shell patterns, global CSS limits, responsive-table behavior, accessibility rules, and neutral provisional branding.
- Added OQ-013 as the team/adviser approval gate and kept frontend package/source changes blocked until approval.

## 2026-07-26 - End-to-end delivery checklist

### Added

- Added a dependency-aware checklist covering planning, UX/system design, development from the public homepage through administrative workflows, testing, deployment, review, launch, and handover.
- Added completion/evidence rules so application progress is not inferred from scheduled or documentation-only work.

### Changed

- Linked the checklist from repository instructions, the README, documentation index, implementation roadmap, current sprint, and progress tracker.

## 2026-07-26 - Planning baseline and D-001 approval

### Approved

- Recorded the user's explicit approval of the documentation planning baseline.
- Changed D-001 and ADR-001 to APPROVED.
- Approved the neutral provisional branding-token approach while leaving official TCC visual identity provisional.

### Resolved

- Closed P0-06, P0-07, P1-13, and OQ-013.
- Kept OQ-001-OQ-012 open for the responsible TCC stakeholders.

## 2026-07-27 - Role-based feature roadmap

### Added

- Added a dedicated screen-by-screen roadmap for public visitors, shared authenticated behavior, Student applicants, Guidance/Psychometrician, Admission/Testing, and System Administrator roles.
- Added implementation dependencies, provisional route groups, completion criteria, role-access constraints, status totals, and an evidence log.

### Changed

- Linked the role roadmap from repository instructions, README, documentation index, implementation roadmap, current sprint, progress tracker, and end-to-end checklist.

## 2026-07-27 - Three-role and web-wrapper decisions

### Approved

- Recorded D-007: exactly three application roles - Student Applicant, Guidance/Psychometrician/Admin, and limited System Administrator side role.
- Consolidated all institutional staff workflows, including official exam processing, under Guidance/Psychometrician/Admin.
- Removed Developer/Maintainer from the application role model.
- Recorded D-008: one responsive web codebase delivered through a non-native mobile wrapper with no separate native feature implementation.

### Blocked

- Added OQ-014 to select PWA versus a thin packaged web wrapper and confirm targets, distribution, authentication, downloads, printing/sharing, permissions, signing, updates, and device tests.

### Changed

- Updated roles, requirements ownership, API consumers, architecture, UI plan, backlog, sprint, progress, risks, testing, deployment, defense readiness, end-to-end checklist, and role-based feature roadmap.
- Added ADR-005 for web/mobile delivery.

## 2026-07-27 - Frontend Foundation Slice 1 started

### Added

- Added the Tailwind CSS v4 Vite integration, shadcn-compatible configuration, unified Radix base, Lucide icons, TanStack Query provider, Sonner, source aliases, and feature-module boundary guidance.
- Added approved neutral provisional light/dark tokens and constrained global defaults.
- Added the currently needed shadcn-style UI primitives and the seven shared application components required by the UI plan.
- Added Vitest configuration, component/status-surface tests, and an automated axe-core accessibility check.

### Verified

- Frontend lint passed.
- 9 Vitest tests across 2 files passed.
- Production TypeScript/Vite build passed.
- Automated axe-core checks reported no detectable violations with rendered color contrast explicitly excluded because JSDOM cannot calculate it.
- The live development server returned HTTP 200 and served the root application document.

### Pending

- Development Slice 1 remains IN PROGRESS. Real-browser desktop/mobile rendering, keyboard focus, horizontal overflow, console, and rendered color-contrast checks could not run because no in-app browser target was available.
- Public homepage, authentication, dashboards, business workflows, Laravel/API/database work, recommendation logic, and the mobile wrapper remain unimplemented or blocked by their recorded dependencies.

## 2026-07-27 - Public landing-page UI started

### Added

- Recorded repository-root `DESIGN.md` as a PROVISIONAL visual reference subordinate to approved architecture, accessibility, and neutral-branding constraints.
- Added a responsive public landing page with a neutral organic-mesh hero, editorial hierarchy, pill actions, illustrative workflow preview, applicant/staff sections, decision-support boundaries, account-access blocker messaging, and public footer.
- Added accessible desktop navigation, skip navigation, and a Radix-based mobile Sheet.
- Added landing-page content, navigation, mobile interaction, and automated accessibility tests.

### Verified

- Frontend lint passed.
- 11 Vitest tests across 2 files passed.
- Production TypeScript/Vite build passed.
- Automated axe-core checks reported no detectable violations with rendered color contrast excluded.
- The live development server returned HTTP 200.

### Pending

- PUB-01 remains IN PROGRESS and unchecked. OQ-012 still blocks final privacy content, supported-browser approval, and official visual identity; authentication requirements block real login/register actions.
- Real-browser desktop/mobile rendering, visible-focus, horizontal-overflow, console, and computed-contrast verification remains pending because no in-app browser target was available.

## 2026-07-27 - DESIGN.md coding governance

### Changed

- Added `DESIGN.md` to the mandatory root `AGENTS.md` reading sequence for every UI/UX task.
- Defined the precedence of approved project decisions, accessibility constraints, the UI/UX plan, and the provisional visual reference.
- Required Tailwind utilities, semantic theme variables, shadcn variants, reusable components, truthful functional controls, licensed/open font usage, and synchronized design documentation.
- Required UI tests, lint, production build, and real-browser desktop/mobile, focus, overflow, console, and rendered-contrast evidence before a screen may be marked COMPLETED.
- Linked `DESIGN.md` from the documentation index and synchronized the UI backlog, current sprint, and progress tracker.

## 2026-07-27 - Professional landing-page visual refinement

### Approved

- Recorded D-009: the repository `DESIGN.md` palette and motion language are approved as the PROVISIONAL working UI direction, while official TCC branding remains blocked under OQ-012.

### Changed

- Replaced the grayscale preview palette with centralized indigo, deep-navy, cream, ruby, magenta, surface, text, border, and shadow tokens from `DESIGN.md`.
- Rebuilt the hero mesh with atmospheric color and slow drift.
- Added sticky glass navigation, layered role surfaces, richer card depth, hover/press/focus transitions, animated workflow progress, and progressive viewport reveals.
- Added reduced-motion rules and a content-visible fallback when observation APIs are unavailable.
- Extended `DESIGN.md` with the implemented motion and interaction rules.

### Verified

- Frontend lint passed.
- 12 Vitest tests across 2 files passed, including animation fallback coverage.
- Production TypeScript/Vite build passed.
- Automated axe-core checks reported no detectable violations with rendered color contrast excluded.
- The `DESIGN.md` linter reported zero errors; its pill-tag contrast warning was corrected. Remaining warnings identify currently unused design tokens.
- The live development server returned HTTP 200.

### Pending

- PUB-01 remains IN PROGRESS. Real-browser desktop/mobile animation, focus, overflow, console, and computed-contrast inspection remains pending because no in-app browser target was available.
- D-009 does not resolve OQ-012 or establish official TCC visual identity.

## 2026-07-27 - Premium public landing-page expansion

### Changed

- Expanded the original public page with reusable project-foundation, capability-bento, illustrative dashboard, benefits, FAQ, and access-status sections.
- Reworked primary navigation around the expanded page and kept the mobile Radix Sheet behavior.
- Added a reusable Radix Accordion primitive and documented its tokens, focus, motion, and content rules in `DESIGN.md`.
- Used approved architectural facts in place of fabricated statistics and added explicit no-real-data messaging to the illustrative dashboard.
- Omitted unsupported testimonials, partner-university claims, accuracy metrics, official branding, and working account controls.

### Verified

- Frontend lint passed.
- 13 Vitest tests across 2 files passed, including accessible FAQ interaction.
- Production TypeScript/Vite build passed.
- Automated axe-core checks reported no detectable violations with rendered color contrast excluded.
- The `DESIGN.md` linter reported zero errors and 11 informational unused-token warnings.
- The live development server returned HTTP 200.

### Pending

- PUB-01 remains IN PROGRESS and unchecked because OQ-012 and approved account/privacy content remain unresolved.
- Real-browser desktop/mobile visual hierarchy, keyboard focus, horizontal overflow, console, animation, and computed-contrast inspection remains pending because no in-app browser target was available.

## 2026-07-27 - Landing page rebuilt from scratch

### Changed

- Removed the previous landing-page composition and its scope-strip, capability-bento, dashboard-showcase, workflow-preview, benefits, and long FAQ sections.
- Built a new visual-first page with one dominant hero, an original illustrative guidance workspace, a compact foundation band, three-step journey, two role-audience stories, three product principles, three FAQs, and one closing access-status action.
- Replaced Inter with the bundled open-source Manrope variable font.
- Rewrote `DESIGN.md` as a scalable, project-specific provisional design system with no finance-template or proprietary-font language.
- Preserved the approved three-role model, staff ownership of official results, decision-support limits, responsive Radix navigation, reduced motion, and explicit no-real-data/account-blocker messaging.

### Verified

- Frontend lint passed.
- 13 Vitest tests across 2 files passed.
- Production TypeScript/Vite build passed and emitted bundled Manrope font assets.
- Automated axe-core coverage remains in the passing test suite.
- The rewritten `DESIGN.md` linter reported zero errors and 9 informational unused-token warnings.
- The live development server returned HTTP 200.

### Pending

- PUB-01 remains IN PROGRESS because OQ-012, approved account/privacy content, and stakeholder visual approval remain unresolved.
- Real-browser desktop/mobile hierarchy, keyboard focus, horizontal overflow, console, animation, and computed-contrast inspection remains pending because no in-app browser target was available.

## 2026-07-27 - Access-first UI replaces public landing page

### Approved

- Recorded D-010: the MVP opens on one shared access experience for the three approved roles; a public marketing/introduction homepage is OUT OF SCOPE.

### Changed

- Removed the public landing page and all public-only section components.
- Added one access form for Student Applicant, Guidance/Psychometrician/Admin, and System Administrator.
- Added React Hook Form and Zod validation for required email/password input without inventing password complexity or institutional-domain policy.
- Added native accessible role radios, password visibility, autocomplete metadata, associated inline errors, and an explicit notice that credentials are not sent, stored, or authenticated.
- Added frontend-only role workspace previews with no real data and one functional return-to-access action.
- Rewrote `DESIGN.md` for the access-first shell, form controls, role selection, preview notices, and role workspace system.

### Verified

- Frontend lint passed.
- 13 Vitest tests across 2 files passed, including role selection, validation, password visibility, Student entry/exit, combined-staff content, and automated accessibility coverage.
- Production TypeScript/Vite build passed.
- The access-first `DESIGN.md` linter reported zero errors and 9 informational unused-token warnings.
- The live development server returned HTTP 200.

### Pending

- Production authentication, server-authoritative role routing, registration, recovery, session/account states, and protected workspace data remain BLOCKED by the Laravel backend and OQ-007/OQ-008/OQ-012.
- Real-browser desktop/mobile layout, keyboard focus, overflow, console, and computed-contrast verification remains pending because no in-app browser target was available.

## 2026-07-27 - Production-style portal correction

### Approved

- Recorded D-011: users do not choose a role on one login page. Student, combined Staff, and System Administrator use dedicated portal URLs, while the future backend remains authoritative for roles.

### Changed

- Removed the three-role selection cards and all visible “UI preview,” credential-processing, and “no backend” disclaimers.
- Added `/student/login`, `/staff/login`, and `/system-admin/login` using one reusable production-style sign-in form.
- Root now redirects to the Student portal.
- Added portal-matched Student, combined Staff, and System Administrator workspace routes and functional sign-out back to the matching portal.
- Removed prototype/status language from workspace headers and module cards while continuing to avoid fabricated names, scores, courses, counts, alerts, or metrics.
- Synchronized `DESIGN.md`, coding governance, decision records, backlog, sprint, progress, testing, checklist, and role roadmap.

### Verified

- Frontend lint passed.
- 14 Vitest tests across 2 files passed, including all three portals, validation, password visibility, workspace routing, sign-out, absence of the role picker/disclaimers, and automated accessibility coverage.
- Production TypeScript/Vite build passed.
- The live development server returned HTTP 200.

### Pending

- Laravel must replace frontend-only transitions with real authentication, server role routing, sessions, authorization, rate limits, and account-state handling.
- Real-browser desktop/mobile layout, keyboard focus, overflow, console, and computed-contrast verification remains pending because no in-app browser target was available.

## 2026-07-27 - Clean role dashboard shell

### Changed

- Rebuilt the Student, combined Staff, and System Administrator workspaces
  around a clean, reference-informed application shell.
- Added a persistent white desktop sidebar, left-opening mobile Sheet, sticky
  top bar, labelled workspace search, role-specific workflows, responsibility
  boundaries, responsive quick-access cards, and functional module
  entry/return.
- Kept each role's navigation and content separate. The reference's finance
  metrics, charts, transaction data, identities, and branding were not copied.
- Updated `DESIGN.md`, the UI plan, testing strategy, backlog, sprint, progress
  tracker, delivery checklist, and role roadmap.

### Verified

- Frontend lint passed.
- 16 Vitest tests across 2 files passed, including role dashboard routing,
  workspace search/filtering, module entry/return, sign-out, and automated
  accessibility coverage.
- Production TypeScript/Vite build passed.

### Pending

- Live-server and real-browser desktop/mobile, keyboard, focus, overflow,
  console, and computed-contrast verification for this revision.
- Breadcrumb, user Dropdown Menu, backend authentication, server-authoritative
  authorization, real dashboard data, and stakeholder visual approval.

## 2026-07-27 - Admin naming and roadmap alignment

### Approved

- Recorded D-012: `Admin` is the concise interface name for the single
  Guidance/Psychometrician/Admin role, using `/admin`; System Administrator
  remains separate at `/system-admin` and is the final role-specific slice.

### Changed

- Replaced the combined-role `/staff` UI routes and labels with `/admin` and
  `Admin`.
- Replaced the incomplete four-card Admin panel with roadmap-aligned groups:
  Applicants, Official results, Assessments & questionnaires,
  Recommendations, Courses & rules, and Reports.
- Mapped those groups to GP-01-GP-10 and AT-01-AT-10 without implementing
  blocked business rules, metrics, or protected actions.
- Moved System Administrator feature routes to `/system-admin/*` in the role
  roadmap and marked them as the final role-specific slice.

### Verified

- Frontend lint passed.
- 16 Vitest tests across 2 files passed.
- Production TypeScript/Vite build passed.
- `DESIGN.md` validation reported zero errors and 9 unused-token warnings.
- `/admin/login`, `/admin`, `/student`, and `/system-admin` returned HTTP 200.

### Pending

- Admin feature data, actions, policies, and APIs remain BLOCKED by their
  recorded open questions.
- Live-browser review and stakeholder visual approval remain pending because
  the in-app browser target is unavailable.

## 2026-07-27 - Admin Applicant Management prototype

### Approved

- Recorded D-013: mock data may support frontend prototyping before backend
  integration, and application cards use borderless Tailwind `shadow-md`
  surfaces.

### Changed

- Added `/admin/applicants` and `/admin/applicants/:applicantId`.
- Added nine mock applicant records using reserved `.test` email addresses.
- Added functional search, review-area filtering, TanStack Table sorting and
  pagination, responsive desktop/mobile record layouts, empty state, and mock
  applicant details.
- Replaced card perimeter borders with `shadow-md` across the shared Card,
  DataTableToolbar, dashboard cards, module cards, and new Applicant
  Management surfaces.
- Synchronized `DESIGN.md`, repository governance, backlog, sprint, progress,
  testing, delivery checklist, decision register, and role roadmap.

### Verified

- 18 Vitest tests across 2 files passed.
- Frontend lint and the production TypeScript/Vite build passed.
- `DESIGN.md` validation reported zero errors and 9 unused-token warnings.
- `/admin`, `/admin/applicants`, and `/admin/applicants/APP-001` returned HTTP
  200.

### Pending

- Real-browser responsive, keyboard, focus, overflow, console, and
  rendered-contrast review remains pending because the in-app browser target
  is unavailable.
- OQ-006/OQ-008 approval, Laravel APIs, server filters, authorization,
  ownership, and real applicant records.

## 2026-07-27 - Admin Official Results Management prototype

### Approved

- Recorded D-014, superseding the prior card elevation with borderless
  Tailwind `shadow-sm` and requiring domain-separated Admin feature code with
  reusable controls.

### Changed

- Added `/admin/official-results` and
  `/admin/official-results/:resultId`.
- Added nine synthetic result records containing only applicant/reference
  links, source, review state, timestamps, and version metadata.
- Added functional search, source/review-state filters, TanStack Table sorting
  and pagination, responsive desktop/mobile records, empty state, applicant
  linking, and immutable version-history presentation.
- Kept score fields, scales, thresholds, correction rules, and protected
  actions out of the UI while OQ-002 remains open.
- Reorganized Admin code into Applicants and Official Results domain folders;
  extracted shared Admin page-header, sort-button, and pagination components;
  isolated Admin workspace routing from the authentication route registry.
- Changed existing application card elevation from `shadow-md` to `shadow-sm`
  and synchronized `AGENTS.md`, `DESIGN.md`, backlog, sprint, progress,
  testing, delivery checklist, decision register, and role roadmap.

### Verified

- 21 Vitest tests across 2 files passed.
- Frontend lint and the production TypeScript/Vite build passed.
- The production build emitted only the existing non-blocking warning for a
  JavaScript chunk larger than 500 kB.

### Pending

- Real-browser responsive, keyboard, focus, overflow, console, and
  rendered-contrast review remains pending. Two Playwright Chromium
  installation attempts timed out before the browser executable was
  available.
- OQ-002/OQ-008 approval, Laravel APIs, server-side validation and
  authorization, real result data, and protected verification/correction
  workflows.

## 2026-07-27 - Admin Assessment Management prototype

### Changed

- Added `/admin/assessments` and `/admin/assessments/:assessmentId`.
- Added nine synthetic assessment-session records containing only applicant
  references, session state, questionnaire-version reference, and timestamps.
- Added functional search, state filtering, TanStack Table sorting and
  pagination, responsive desktop/mobile records, empty state, applicant
  linking, and session-history presentation.
- Added explicit OQ-003/OQ-004 blocker surfaces in place of questionnaire
  configuration and assessment content.
- Kept questions, response choices, mappings, responses, scores,
  interpretations, publishing states, and protected editing actions out of the
  implementation.
- Synchronized `DESIGN.md`, UI plan, backlog, sprint, progress, testing,
  delivery checklist, and role roadmap.

### Verified

- 24 Vitest tests across 2 files passed.
- Frontend lint and the production TypeScript/Vite build passed.
- The production build emitted only the existing non-blocking warning for a
  JavaScript chunk larger than 500 kB.

### Pending

- Real-browser responsive, keyboard, focus, overflow, console, and
  rendered-contrast review remains pending because the in-app browser is
  unavailable.
- OQ-003/OQ-004/OQ-008 approval, Laravel APIs, server-side validation and
  authorization, approved instrument/version governance, real session data,
  and protected review/editing workflows.

## 2026-07-27 - Mock-first stakeholder prototype presentation

### Approved

- Recorded D-015: stakeholder-facing prototype screens use complete isolated
  synthetic data instead of displaying internal OQ or approval-blocker
  notices. Mock content remains non-official and must not become production
  seed data or validation evidence.

### Changed

- Removed visible OQ-003/OQ-004 blocker panels from Assessment Management.
- Added response progress to assessment tables, mobile records, and session
  details.
- Added `/admin/questionnaires` and
  `/admin/questionnaires/:questionnaireId`.
- Added synthetic active, draft, and retired questionnaire-version cards,
  item counts, response-format presentation, questionnaire item preview, and
  version history.
- Replaced the visible official-result score blocker with isolated synthetic
  score presentation while retaining OQ-002 as the production-rule gate.
- Updated repository governance, `DESIGN.md`, UI plan, backlog, sprint,
  progress, testing, delivery checklist, decision register, and role roadmap.

### Verified

- 25 Vitest tests across 2 files passed.
- Frontend lint and the production TypeScript/Vite build passed.
- Application source contains no `shadow-md`.

### Pending

- Browser-rendered responsive, keyboard, focus, overflow, console, and
  computed-contrast evidence because the in-app browser remains unavailable.
- Stakeholder approval and backend implementation of official instruments,
  scoring, result formats, permissions, lifecycle rules, and persistence.

## 2026-07-27 - Admin Recommendations Management prototype

### Changed

- Added `/admin/recommendations` and
  `/admin/recommendations/:recommendationId`.
- Added nine synthetic, versioned recommendation runs with Generated,
  Reviewed, and Superseded states.
- Added functional search, status filtering, TanStack Table sorting and
  pagination, responsive desktop/mobile records, empty state, and detail
  navigation.
- Added ranked course cards, numeric match bars, eligibility labels,
  explanation reasons, versioned assessment/result/rule input snapshots, and
  applicant linking.
- Kept all courses, percentages, eligibility states, explanations, and
  versions isolated as D-015 prototype data rather than official TCC rules.
- Synchronized `DESIGN.md`, UI plan, backlog, sprint, progress, testing,
  delivery checklist, and role roadmap.

### Verified

- 28 Vitest tests across 2 files passed.
- Frontend lint and the production TypeScript/Vite build passed.
- Application source contains no `shadow-md`.

### Pending

- Browser-rendered responsive, keyboard, focus, overflow, console, and
  computed-contrast evidence because the in-app browser remains unavailable.
- Approved course catalogue, eligibility rules, recommendation weights,
  explanation language, Laravel API, authorization, and persistence.

## 2026-07-28 - Admin Courses & Rules Management prototype

### Changed

- Added `/admin/courses`, `/admin/courses/:courseId`, `/admin/rules`, and
  `/admin/rules/:ruleId`; `/admin/courses-rules` opens the catalogue.
- Added six synthetic course records and three versioned synthetic admission
  rules using D-015 mock-first presentation.
- Added course search, lifecycle filtering, responsive catalogue cards,
  program details, board-course classification, interest profiles, and career
  pathways.
- Added admission-rule lifecycle cards, scopes, condition previews, effective
  periods, and version history.
- Synchronized `DESIGN.md`, UI plan, backlog, sprint, progress, testing,
  delivery checklist, and role roadmap.

### Verified

- 31 Vitest tests across 2 files passed.
- Frontend lint and the production TypeScript/Vite build passed.
- Application source contains no `shadow-md`.

### Pending

- Browser-rendered responsive, keyboard, focus, overflow, console, and
  computed-contrast evidence because the in-app browser remains unavailable.
- Official course catalogue, classifications, profiles, admission rules,
  Laravel API, authorization, audit, and persistence.

## 2026-07-28 - Admin Reports Management prototype

### Changed

- Added `/admin/reports` and `/admin/reports/:reportId` with six isolated
  synthetic report records.
- Added report search, type/status filtering, sorting, pagination, responsive
  table/mobile records, and empty-state recovery.
- Added a document-style report preview, source-version traceability, linked
  applicant/recommendation navigation, and functional browser printing.
- Added report-only print CSS without adding a non-functional download action.
- Synchronized `DESIGN.md`, UI plan, backlog, sprint, progress, testing,
  delivery checklist, and role roadmap.

### Verified

- 34 Vitest tests across 2 files passed.
- Frontend lint and the production TypeScript/Vite build passed.
- Application source contains no `shadow-md`.

### Pending

- Browser-rendered responsive, keyboard, focus, overflow, console, print, and
  computed-contrast evidence because the in-app browser remains unavailable.
- Official report fields, layout, recipients, signatories, numbering,
  retention, correction/reissue, secure export, Laravel API, authorization,
  audit, and persistence.

## 2026-07-28 - Admin information-pattern redesign

### Changed

- Established a task-based information-pattern rule: tables are reserved for
  dense column comparison, not used as the default CRUD layout.
- Kept comparison tables for Applicants and Official Results.
- Replaced the Assessment table with in-progress and submitted workflow lanes
  containing progress-focused session cards.
- Replaced the Recommendation table with a responsive ranked review-card grid.
- Replaced the Report table with a featured-report and visual document-library
  layout while preserving search, filters, detail preview, links, and printing.
- Updated UI tests and synchronized `DESIGN.md`, UI plan, backlog, sprint,
  progress, testing, delivery checklist, and role roadmap.

### Verified

- 34 Vitest tests across 2 files passed, including assertions that the three
  redesigned module landing screens no longer render tables.
- Frontend lint and the production TypeScript/Vite build passed.
- Application source contains no `shadow-md`.

### Pending

- Browser-rendered desktop/mobile, keyboard, focus, overflow, console, print,
  and computed-contrast evidence because the in-app browser remains
  unavailable.

## 2026-07-28 - Admin dashboard and shared-state finalization

### Changed

- Rebuilt `/admin` as an operational workspace with synthetic priority
  summaries, a filterable attention queue, working quick actions, expandable
  activity, workflow-stage navigation, and searchable module access.
- Added focused forbidden, session-expired, and not-found recovery screens
  with semantic heading focus and functional return actions.
- Added consistent loading, empty, and retryable error route boundaries across
  Admin features.
- Renamed the top-bar control to `Search modules` so its scope is truthful.
- Separated workspace definitions, navigation, breadcrumbs, overview
  presentation, Admin route resolution, and feature rendering.
- Lazy-loaded the Admin route group and removed the previous main-bundle size
  warning.
- Split the former monolithic application test into feature-focused suites and
  added dashboard plus shared-state behavior coverage.
- Reconciled `DESIGN.md` with D-015: synthetic prototype workflow records are
  permitted but must never be represented as official production data or
  validation evidence.

### Verified

- 53 Vitest tests across 10 files passed.
- Frontend lint and the production TypeScript/Vite build passed.
- The initial production JavaScript bundle is below 500 kB and the Admin route
  is emitted as a separate chunk.
- Application source contains no `shadow-md`.

### Pending

- Browser-rendered desktop/mobile, keyboard, focus, overflow, console, print,
  and computed-contrast evidence because the in-app browser remains
  unavailable.
- Production Laravel data, authentication, authorization, approved
  institutional rules, and stakeholder review.

## 2026-07-28 - Compact Admin feature hierarchy

### Approved

- Recorded D-016: Admin workspace chrome and feature introductions use a
  compact shared hierarchy without a repeated role eyebrow or excessive
  spacing before primary work.

### Changed

- Reduced the workspace top-bar height and content-canvas vertical padding.
- Tightened the breadcrumb-to-heading and heading-to-primary-content spacing.
- Reworked the shared Admin page header into one compact title, description,
  and optional-action row.
- Removed the repeated `Admin workspace` eyebrow from the dashboard and all
  Admin feature pages.
- Applied the compact hierarchy consistently across dashboard, applicants,
  official results, imports, assessments, questionnaires, recommendations,
  validation cases, student decisions, courses, rules, and reports.
- Placed Admin landing-page breadcrumbs below the shared heading and above
  relevant search or filter controls.
- Moved `Search modules` from the Admin global top bar into the dashboard,
  keeping global chrome focused on navigation and account context.

### Verified

- 54 Vitest tests across 10 files passed, including explicit dashboard and
  Applicants heading-breadcrumb-search DOM-order coverage.
- Frontend lint and the production TypeScript/Vite build passed.
- Application source contains no `shadow-md`.

### Pending

- Real-browser desktop/mobile, keyboard-focus, overflow, console, and computed
  contrast verification remains required before this UI work can be marked
  COMPLETED.

## 2026-07-28 - GP-01 command-center acceptance completion

### Changed

- Aligned the dashboard priority cards with the four required operational
  categories.
- Made the attention queue visibly ranked while retaining applicant or batch
  context, status text, timestamps, and direct actions.
- Added the required result, import, questionnaire, recommendation, and report
  activity event types.
- Aligned quick-action labels with the six required Admin workflows.

### Verified

- 56 Vitest tests across 10 files passed.
- Added a complete GP-01 checklist test and verified every quick-action route
  reaches its implemented workflow.
- Frontend lint and the production TypeScript/Vite build passed.

### Pending

- GP-01 remains IN PROGRESS - UI ONLY until real-browser review, production
  data minimization, Laravel authorization, and stakeholder acceptance exist.
