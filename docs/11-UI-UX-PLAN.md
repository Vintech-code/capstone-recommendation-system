# UI/UX Plan

**Purpose:** Define the responsive-web experience and accessibility baseline.  
**Status:** PROVISIONAL overall; the frontend UI/styling decision in D-001 is APPROVED.  
**Basis:** Roadmap, Section 10; MVP scope; user-supplied final frontend UI and styling decision.  
**Owner:** Capstone frontend/UI lead with stakeholder review.  
**Last updated:** 2026-07-28.  
**Related IDs:** D-001, D-016, FR-01-FR-10, NFR-01, NFR-07.
**Open questions:** Official TCC branding, language, content, report layout, accessibility review participants, and wrapper behavior remain provisional under OQ-010/OQ-012/OQ-014.

## Frontend UI and styling decision (APPROVED)

Use:

- React + Vite + TypeScript
- Tailwind CSS v4 through the official `@tailwindcss/vite` plugin
- shadcn/ui with Radix as the explicit component primitive base
- Lucide React for icons
- React Hook Form + Zod for forms and validation
- TanStack Query for API state
- TanStack Table for complex applicant and report tables
- Recharts for approved operational dashboard visualizations

Do not use Bootstrap, Material UI, Chakra UI, Ant Design, plain CSS as the primary styling system, or multiple competing component libraries.

## Component organization

| Location | Responsibility |
|---|---|
| `src/components/ui/` | Generated and customized shadcn/ui primitives. |
| `src/components/shared/` | Reusable application-level components such as `PageHeader`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmActionDialog`, `CollectionToolbar`, and `DataTableToolbar`. |
| `src/features/<feature>/components/` | Components used only by one business module. |

Use Tailwind utilities for layout, spacing, responsive behavior, typography, borders, shadows, interaction states, and focus indicators. Restrict the global CSS file to `@import "tailwindcss"`, CSS variables/theme tokens, body defaults, font declarations, print styles, and rare global rules that cannot reasonably use utilities.

## Initial shadcn/ui set

Button, Card, Input, Field, Label, Textarea, Select, Checkbox, Radio Group, Alert, Alert Dialog, Dialog, Sheet, Dropdown Menu, Badge, Breadcrumb, Progress, Separator, Skeleton, Tabs, Table, Pagination, Popover, Calendar, Command, Sidebar, Tooltip, and Sonner.

## Admin operational dashboard

- Use the supplied dashboard reference structure: guidance hero, five compact
  summary cards, three project-specific visualization panels, recent
  applicants, and latest activity.
- Do not duplicate Sidebar navigation with dashboard module cards or module
  search. Do not repeat the breadcrumb/page-title block above the dashboard
  hero. Detailed queues, quick actions, and workflow stages remain available
  inside their dedicated Admin modules instead of extending the dashboard.
- Keep the dashboard fluid within the available workspace so wide screens and
  zoomed-out views do not leave an artificial fixed-width gutter. Desktop
  users can collapse the 256px sidebar into an 80px icon rail from a labelled
  edge chevron. Icons retain active states, accessible names, and right-side
  tooltips; mobile retains the left-opening navigation Sheet.
- Apply the same fluid-width rule to every role dashboard, Admin list/detail
  page, module surface, and breadcrumb. Do not use a shared `90rem` cap around
  primary workspace content. Retain narrower widths only where scanability or
  reading length is the actual constraint, such as forms, dialogs, notices,
  and report documents.
- Use the provisional violet dashboard hero and semantic chart tokens for a
  cohesive visual hierarchy. Operational activity and assessment-session
  state are acceptable prototype visualizations when labels remain explicit,
  the period control works, and the values are isolated D-015 mock data.
- Every prototype dashboard control must perform a frontend action: filter,
  expand, or navigate to an implemented Admin route.
- D-015 permits isolated synthetic counts and work records for stakeholder UI
  review. They are not institutional metrics, validation evidence, or
  production seed data.
- Keep status readable through text and icons, not colour alone.
- Avoid unrelated financial charts, vanity analytics, or unsupported
  performance claims.

## Student journey dashboard

- Use a focused next-action hero followed by six journey stages: Profile &
  application, Official result, Interest assessment, Course guidance, My
  decision, and My report.
- Show explicit text statuses and direct module actions. The primary action
  continues the next available Student task rather than displaying vanity
  analytics or fabricated performance metrics.
- Keep official examination information read-only and state the
  guidance-not-admission-or-enrolment boundary visibly.
- D-015 permits isolated synthetic journey state for stakeholder UI review.
  It is not production status data, scoring evidence, or institutional policy.
- Retain Student-only navigation, top-bar module search, the fluid workspace,
  collapsed desktop icon rail, and mobile navigation Sheet.

## Student profile and application

- Prioritize phone use: stack profile and application sections in one
  scannable column, preserve 16px mobile form text, use at least 48px controls,
  and expand primary actions to the available mobile width.
- Mobile-first does not mean mobile-only. At desktop widths, use the same
  responsive workspace-shell quality as the Admin panel, consume the available
  canvas appropriately, and organize related Student content into balanced
  columns without sacrificing readable form widths.
- Keep this Student workflow visually distinct from the Admin dashboard. Use
  completion guidance, focused forms, checklists, and clear next actions
  instead of charts, work queues, dense tables, or administrative controls.
- Provide explicit edit, cancel, save, review, and submit interactions.
  Preserve unsaved changes until the Student confirms discarding them.
- Every input has a visible label and associated inline error. Save and submit
  actions expose loading/disabled feedback; submission uses an accessible
  confirmation dialog and the demonstrated submitted state is read-only.
- Define loading, empty, retryable error, validation, draft, saving, saved,
  submission-confirmation, and submitted states. D-015 synthetic fields and
  lifecycle examples remain UI-only until OQ-005/OQ-006 are approved.

## Student feature header and official result

- Student feature pages follow the Admin feature-header order: title,
  description, breadcrumb, then primary content. Avoid a shell breadcrumb
  above the heading and do not repeat a separate Dashboard back action.
- The Official Result screen is strictly read-only and uses a responsive
  summary, text-labelled verification state, source/reference metadata,
  chronological verification history, and plain correction-contact guidance.
- Do not expose Student edit/encode/verify/reject/replace controls or infer
  pass/fail, eligibility, admission, or enrolment from the displayed value.
- Define loading, unavailable/empty, retryable error, verified, and read-only
  states. D-015 result values and provenance are isolated UI examples until
  OQ-002 is approved.

## Shared route and data states

- Use focused, keyboard-safe recovery pages for permission denied, expired
  session, and route not found.
- Every Admin feature route can render the shared loading, empty, and
  retryable error patterns while the Laravel API is not yet connected.
- Lazy-load the Admin route group so Student and access surfaces do not
  download the full Admin panel on initial entry.

Add other components only when an approved feature needs them.

## Application shell

- Sidebar for desktop navigation
- Sheet for mobile navigation
- Breadcrumb for page location
- Dropdown Menu for the user menu
- Compact shared feature headers with one title, concise supporting text, and
  optional actions, followed by the breadcrumb and then relevant search/filter
  controls; avoid repeated role labels and excessive vertical space before the
  page's primary task
- Cards and badges for dashboard status
- Skeletons for loading states
- Alerts for errors and blockers
- Sonner for non-critical notifications

## Experience principles

- Build one mobile-first responsive web experience and reuse it unchanged inside the approved non-native mobile wrapper.
- Separate Student, combined Admin, and System Administrator navigation while
  reusing a consistent component system.
- Give every async operation a loading/disabled state, prevent duplicates, preserve failed form input, and show actionable errors.
- Provide explicit Back, Cancel, and Close controls; confirm destructive or irreversible transitions.
- Never present a recommendation as guaranteed admission, enrolment, diagnosis, or final assignment.
- Explain eligibility and rankings in plain language, including the governing version and â€œwhy notâ€ reasons where appropriate.
- Use more than color for status; support keyboard navigation, visible focus, semantic labels, error summaries, zoom, and text resizing.
- Give every form input an accessible label.
- Give every dialog an accessible title and description.
- Keep complex tables usable on smaller screens through an approved responsive strategy.
- Prefer semantic HTML before adding ARIA attributes.

## Proposed information architecture

Student:

1. Account and privacy notice
2. Profile and admission-cycle application
3. Official result status (read-only)
4. RIASEC assessment
5. Results and course comparison
6. Decision and report

Guidance/Psychometrician/Admin:

1. Operational dashboard
2. Applicant search and detail
3. Exam import/verification/corrections
4. Recommendation review and reporting
5. Controlled catalogue, rules, and assessment governance
6. Approved institutional management actions

System Administrator side role:

1. Technical account and role controls
2. Admission-cycle/system configuration
3. Audit and job/health monitoring
4. Backup status and approved privacy operations

## Required states

Every screen must define loading, empty, validation, permission-denied, stale/version-conflict, offline/network failure, success, and retry behavior. Assessment autosave must clearly distinguish saving, saved, unsaved, and submission-locked states.

Wireframes and content require stakeholder review before implementation. Related: [Functional Requirements](05-FUNCTIONAL-REQUIREMENTS.md), [Security and Privacy](12-SECURITY-AND-PRIVACY.md).

## Branding

Do not invent or claim official TCC colors, logos, or typography. D-009 approves the `DESIGN.md` palette and motion language as the PROVISIONAL working UI direction for review, superseding the earlier neutral-only preview while leaving official branding BLOCKED until TCC approves the visual identity under OQ-012.

## Light and dark appearance

- D-019 approves a provisional system-wide light/dark preference without
  approving official TCC branding.
- Light is the default when no preference is saved. The accessible toggle is
  available on all portal entry screens, authenticated workspace top bars,
  and recovery screens.
- The selected `light` or `dark` value is stored locally and applied before
  React renders to prevent a light-theme flash. No account, credential, or
  domain data is stored with this preference.
- Semantic tokens control canvas, surfaces, text, controls, focus, status, and
  charts. Shared inputs, textareas, and selects must never force a white
  surface in dark mode.
- All three roles share the Admin dark canvas family: `#0b1220` for the
  application canvas, `#121d2d` for cards and dark feature surfaces, and
  `#172437` for muted or supporting surfaces. Role identity comes from
  information architecture and content, not a separate Student dark palette.
- Print remains white with black text. Real-browser light/dark contrast,
  keyboard, mobile, and chart review remains required before completion.

## Provisional visual reference

The user selected the repository-root [DESIGN.md](../DESIGN.md) as the working visual reference on 2026-07-27. Apply its layout rhythm, spacing, light editorial hierarchy, pill controls, organic-mesh hero treatment, card geometry, responsive behavior, and product-preview composition while preserving these higher-priority project constraints:

- Treat the resulting appearance as PROVISIONAL, not official TCC branding.
- Use the documented indigo, deep-navy, cream, ruby, magenta, surface, and text tokens only as a PROVISIONAL preview palette under D-009; do not represent them as official TCC identity.
- Use the locally bundled Manrope working font documented in `DESIGN.md`; it is
  provisional and not official TCC typography.
- Adapt financial-product examples to truthful capstone content. Do not reproduce Stripe identity, financial metrics, logos, or irrelevant interface patterns.
- Accessibility, semantic structure, clear focus, minimum touch targets, and non-color communication remain mandatory.

## Frontend foundation implementation status

**Status:** IN PROGRESS as of 2026-07-27.

- Configured Tailwind CSS v4 through `@tailwindcss/vite`, the `@/*` source alias, shadcn-compatible `components.json`, unified Radix primitives, Lucide React, TanStack Query providers, and Sonner.
- Added the currently needed approved primitives: Button, Card, Input, Label, Alert, Alert Dialog, Badge, Separator, Skeleton, Tooltip, and Sonner.
- Added and component-tested `PageHeader`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmActionDialog`, and `DataTableToolbar`; added `CollectionToolbar` as the neutral search/filter shell for non-table collections.
- Added neutral light/dark provisional tokens, body defaults, focus treatments, responsive utilities, semantic state colors, and print defaults in the constrained global stylesheet.
- Automated evidence passes: lint, production build, 9 Vitest/component tests in 2 files, axe-core checks excluding color contrast because JSDOM cannot calculate rendered contrast, and a live development-server HTTP 200 response.
- Browser-rendered desktop/mobile, keyboard-focus, overflow, and computed color-contrast inspection remains PENDING because no in-app browser target was available. Development Slice 1 must remain IN PROGRESS until that evidence is recorded.

## Access-first UI implementation status

**Status:** IN PROGRESS as of 2026-07-27.

- D-010 removes the public introduction/marketing homepage from the MVP root.
- `/` redirects to `/student/login`; the combined Admin uses `/admin/login`;
  System Administrators use `/system-admin/login`. Users do not select a role
  on a login form.
- All portals reuse the same production-style sign-in component with React Hook Form/Zod required and email validation, labelled credentials, autocomplete metadata, accessible errors, password visibility, and a direct â€œSign inâ€ action. No visible prototype disclaimer or unapproved password/domain policy is shown.
- Valid frontend input routes to the portal-matched workspace and sign-out returns to the same portal. Student, combined Admin, and limited System Administrator modules are organized separately without fabricated names, scores, courses, counts, alerts, or metrics.
- The Admin panel is the first role-specific UI slice. Its navigation maps to
  the roadmap groups: Applicants, Official results, Assessments &
  questionnaires, Recommendations, Courses & rules, and Reports.
- D-013 permits mock records for UI prototyping before backend integration.
  Applicant Management uses functional search, review-area filtering, sorting,
  pagination, responsive record layouts, and record-detail navigation.
- D-014 supersedes the prior elevation rule. Cards use borderless `shadow-sm`
  surfaces. Do not add perimeter,
  `border-b`, or `border-r` utilities to card components.
- Official Results Management uses a domain-separated list/detail prototype
  with functional search, source/review-state filters, sorting, pagination,
  responsive records, applicant linking, synthetic score presentation, and
  version history. Production fields/actions remain governed by OQ-002.
- Manual Result Entry at `/admin/exam-results/new` uses a staged form instead
  of a table: labelled source fields, complete-record review, an accessible
  confirmation dialog, and a verification-queue success state. UI validation
  checks presence and input shape without inventing pass/fail rules.
- CSV import at `/admin/imports/new` uses local file reading, required-column
  validation, loading/error/empty states, and one responsive comparison table
  where row-level column review is necessary. `/admin/imports/:id` uses
  summary cards, outcome filters, and row issue cards for reconciliation.
- Information patterns are task-specific. Tables are reserved for dense,
  column-based operational comparison such as Applicants and Official Results.
  Workflow lanes, ranked review cards, catalogue grids, timelines, and document
  libraries must be used when they better match the userâ€™s decision task.
- Assessments & Questionnaires uses state-based workflow lanes and
  progress-focused session cards, plus separate questionnaire version/detail
  views with item preview, response-format presentation, and history. These are
  lane-native cards: identity/status, full-width progress, and activity/action
  are vertically sequenced so half-width desktop lanes and narrow screens do
  not squeeze or overlap record metadata. Content remains isolated synthetic UI
  data under D-015; production behavior remains governed by OQ-003/OQ-004.
- Recommendations Management uses a responsive review-card grid with search,
  status filtering, applicant context, top-course emphasis, numeric match bars,
  and direct entry to ranked detail, explanations, versioned input snapshots,
  and applicant linking. D-015 synthetic values are not production rules.
- `/admin/validation-cases` uses a case-library plus selected comparison panel
  for expected/output snapshots and rerun feedback. `/admin/decisions` uses
  decision cards plus a detail panel and explicitly separates preference from
  admission or enrolment.
- The shared workspace shell now renders semantic breadcrumbs and a Radix
  Dropdown Menu with functional sign-out. LoadingState, EmptyState, and
  ErrorState are integrated into delivered Admin workflows.
- Courses & Rules Management uses separate responsive catalogue, course-detail,
  rule-list, and rule-detail routes with search, lifecycle filtering,
  classification, interest profiles, career paths, conditions, effective
  periods, and history. D-015 synthetic content is not an official catalogue
  or admission policy.
- Reports Management uses a visual document library with a featured report,
  responsive preview cards, type/status filtering, report detail, document
  preview, source-version traceability, applicant/recommendation linking, and a
  functional browser print action. D-015 report records and layouts are
  synthetic and are not official formats, recipients, signatories, retention
  rules, or export evidence.
- The Student Interest Assessment introduction is mobile-first and
  desktop-responsive. It presents general expectations, a synthetic active
  version/readiness summary, a non-diagnostic guidance boundary, explicit
  notice acknowledgement, confirmation, and a functional session-opening
  transition. Loading, empty, retryable-error, and inactive-version states are
  defined. It intentionally excludes questionnaire items, response options,
  mappings, scoring, and interpretations until OQ-003/OQ-004 are approved.
- The UI-only Student assessment session uses isolated synthetic prompts and
  choices to demonstrate interaction, not psychometric content. It provides a
  one-question mobile flow, desktop side progress, labelled response controls,
  direct question navigation, local autosave and resume, saved/offline/unsaved
  feedback, incomplete review, response editing, submission confirmation, and
  a read-only completed state. Loading, empty, retryable-error, offline, and
  stale-version recovery are defined. No dimension mapping, score,
  interpretation, validation result, or course outcome is calculated.
- The Student Assessment Result opens from the locked submitted-session state
  and uses a focused mobile-first composition rather than dashboard analytics.
  It provides a top-code summary, six text-labelled numeric bars,
  leading-dimension order, result/session/assessment-version provenance, a
  read-only boundary, and plain-language limitations separating the result
  from diagnosis, admission, enrolment, and course recommendations. Loading,
  empty, retryable-error, and preparing states are defined. D-015 values are
  visualization fixtures, not approved scoring, norms, interpretations,
  mapping, validation evidence, or production data.
- Student Recommendation Results use a mobile-first ranked-card layout with
  explicit status text, numeric match values, explanation factors, provenance,
  status filters, focused details, and a selectable two-to-three-course
  comparison. The screen states that guidance is not admission or enrolment
  and provides loading, empty, retryable-error, and preparing states. D-015
  course names, ranks, match values, eligibility labels, factors, and version
  references are synthetic presentation fixtures, not approved catalogue,
  rules, thresholds, weights, results, or validation evidence.
- Student course detail and comparison add learning areas, general career
  directions, recorded factors, and review notes without presenting employment
  or eligibility promises. Student decisions use accessible course and
  response controls, a required explanatory note, confirmation, revision, and
  visible history while explicitly remaining separate from admission and
  enrolment. Student reports provide own-record provenance, a document preview,
  limitations, browser printing, text download, and loading/empty/error/
  preparing states. All D-015 course, decision, and report content remains
  synthetic presentation data.
- System Administrator is the final role-specific implementation slice and
  must remain distinct from the combined Admin.
- The System Administrator dashboard now uses a distinct technical-operations
  hierarchy: focused access/security hero, functional 24-hour/7-day summaries,
  navigable account/role/cycle review items, text-labelled service states,
  recent audit activity, and an explicit boundary from psychometric,
  recommendation, and admission-decision work. D-015 fixtures are UI-only and
  are not production monitoring, audit, backup, or authorization evidence.
- Reworked all three role dashboards around a clean application shell: a
  persistent white desktop sidebar, left-opening mobile Sheet, sticky top bar,
  labelled module search, role-specific workflow, responsibility boundary,
  responsive quick-access grid, and module-detail surface.
- The reference image informs layout density and hierarchy only. Finance
  metrics, charts, transaction patterns, identities, and branding were not
  copied.
- Sanctum cookie login, session restoration, logout, server-confirmed portal entry, role middleware, and protected client routes are implemented. React maps server `401` and `403` portal checks to session-expired and forbidden recovery. Registration, recovery, approved account states, detailed feature/action policies, and production authentication topology remain BLOCKED or pending under OQ-007/OQ-008.
- Current automated evidence passes: 126 frontend tests across 22 files and 20 Laravel tests, plus frontend lint/build and Laravel Pint. Routes cover the Admin dashboard, ADM-01 System Administrator dashboard presentation, and all STU-01 through STU-11 Student presentation slices; authentication coverage includes login, session restoration, logout, validation errors, guest redirects, three-role server boundaries, wrong-role denial, multiple individual users holding the shared Admin role, expired-session recovery, safe local Admin provisioning, and opt-in environment-backed three-role seed accounts. Theme coverage verifies accessible switching, persistence, authenticated-workspace restoration, and recovery-screen availability. `DESIGN.md` reflects the separate-portal, role-dashboard, borderless `shadow-sm` card system, semantic light/dark modes, task-specific information patterns, integrated shared states, and report-only white print behavior. Real-browser desktop/mobile, focus, overflow, console, print, and computed-contrast evidence remains pending because the in-app browser is unavailable.
