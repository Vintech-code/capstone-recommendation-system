# Documentation Changelog

**Purpose:** Record meaningful controlled-document changes.  
**Status:** IN PROGRESS.  
**Basis:** Repository documentation workflow.  
**Owner:** Capstone documentation lead.  
**Last updated:** 2026-07-28.  
**Related IDs:** D-001-D-008.  
**Open questions:** [22-OPEN-QUESTIONS.md](22-OPEN-QUESTIONS.md).

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
