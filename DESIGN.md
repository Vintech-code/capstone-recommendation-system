---
version: gamma
name: TCC Guidance Provisional Product System
description: A scalable UI system for the TCC Course Recommendation application. The root opens the Student sign-in portal, while the combined Admin and System Administrator use dedicated portal URLs. Manrope typography, clear role boundaries, production-style forms, high-contrast hierarchy, and responsive role workspaces create a deployment-ready frontend surface.

colors:
  primary: "#533afd"
  primary-deep: "#4434d4"
  primary-press: "#2e2b8c"
  primary-soft: "#b9b9f9"
  brand-dark: "#1c1e54"
  ink: "#0d253d"
  ink-secondary: "#273951"
  ink-muted: "#64748d"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  canvas-soft: "#f6f9fc"
  canvas-warm: "#f5e9d4"
  border: "#e3e8ee"
  input: "#a8c3de"
  ruby: "#ea2261"
  magenta: "#f96bee"
  chart-blue: "#4f8df7"
  chart-teal: "#42b8a5"
  chart-slate: "#a9b2ca"

darkColors:
  background: "#0b1220"
  surface: "#121d2d"
  surface-muted: "#172437"
  foreground: "#edf3fa"
  foreground-muted: "#a8b7ca"
  border: "#2a394d"
  input: "#40536b"
  primary: "#8b7fff"
  brand-dark: "#121d2d"
  brand-soft: "#cbc9ff"
  canvas-warm: "#172437"

typography:
  display-access:
    fontFamily: "'Manrope Variable', Manrope, system-ui, sans-serif"
    fontSize: 60px
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: -3.6px
  page-title:
    fontFamily: "'Manrope Variable', Manrope, system-ui, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: -1.8px
  card-title:
    fontFamily: "'Manrope Variable', Manrope, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.3px
  body-large:
    fontFamily: "'Manrope Variable', Manrope, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 450
    lineHeight: 1.6
    letterSpacing: 0
  body:
    fontFamily: "'Manrope Variable', Manrope, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 450
    lineHeight: 1.6
    letterSpacing: 0
  label:
    fontFamily: "'Manrope Variable', Manrope, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  micro:
    fontFamily: "'Manrope Variable', Manrope, system-ui, sans-serif"
    fontSize: 10px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 1.6px
  button:
    fontFamily: "'Manrope Variable', Manrope, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 650
    lineHeight: 1
    letterSpacing: 0

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  pill: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  panel: 40px
  page: 56px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 24px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  credential-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px 40px
  portal-identity:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.micro}"
    rounded: "{rounded.md}"
    padding: 12px
  access-brand-panel:
    backgroundColor: "{colors.brand-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-large}"
    rounded: "{rounded.sm}"
    padding: 56px
  access-form-panel:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 48px
  workspace-header:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  workspace-sidebar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 16px
  workspace-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 20px
  workspace-topbar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 12px 32px
  workflow-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  module-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 20px
---

# TCC Guidance Provisional Product System

## Status

This system is **PROVISIONAL** under D-009. It is not an approved TCC visual
identity. Official branding, authentication policy, privacy content, account
lifecycle, and production credentials remain blocked by their recorded open
questions.

The frontend now uses Laravel Sanctum cookie sessions for portal login, session
restoration, logout, and server-confirmed portal entry. Laravel role middleware
protects the Student, Admin, and System Administrator portal boundaries, while
React maps expired and forbidden responses to focused recovery screens.
Registration, recovery, approved account states, detailed feature
authorization, and protected domain data remain separate implementation work.

## Product entry model

The application root redirects directly to the Student sign-in portal. There
is no marketing homepage or public product introduction in the MVP interface.

The system exposes three dedicated portal paths:

1. Student Applicant: `/student/login`
2. Guidance / Psychometrician / Admin: `/admin/login`
3. System Administrator: `/system-admin/login`

All portals reuse the same sign-in component. Users never choose or change their
role on the sign-in form. The production backend remains authoritative for role
authorization and must reject cross-role access.

## Visual hierarchy

- Desktop uses a split screen: a dark identity panel and a focused white form
  panel.
- Mobile removes the decorative identity panel and keeps a compact wordmark
  above the form.
- The portal identity, access title, credentials, and submit action appear in
  that order.
- Workspaces use a white desktop sidebar that collapses into a persistent icon
  rail, a compact sticky top bar, a light-gray canvas, and a responsive content
  grid.
- The Admin dashboard follows the approved reference hierarchy: one
  guidance-focused hero, five compact summary cards, operational activity,
  assessment and recommendation review visualizations, recent applicants, and
  latest activity. Dashboard-only breadcrumbs, module search, module cards,
  priority cards, work queue, quick actions, and workflow-stage cards are
  excluded; module navigation remains in the persistent Sidebar/Sheet.
- Application cards are borderless. Use Tailwind `shadow-sm` as the standard
  card elevation; do not use `border`, `border-b`, or `border-r` to define card
  edges.
- Text stays concise; access screens are task interfaces, not marketing pages.

## Theme modes

Dark mode is an APPROVED provisional UI capability under D-019, not an
official TCC identity. Light mode remains the initial default when no saved
preference exists.

- Apply light and dark appearance through semantic CSS variables and the
  root `.dark` class. Feature components must not maintain separate theme
  state or duplicate palette logic.
- Provide one accessible theme toggle on every sign-in screen, authenticated
  workspace top bar, and recovery screen. Its accessible name must describe
  the resulting action, and `aria-pressed` must expose the current state.
- Persist only the non-sensitive `light` or `dark` preference in local storage.
  Apply a stored dark class before React starts to avoid a light-theme flash.
- Shared inputs, textareas, selects, cards, popovers, dialogs, charts, status
  text, and focus indicators must use semantic tokens in both themes.
- Student, Admin, and System Administrator surfaces use the same dark canvas
  palette. Role-specific layouts and content may differ, but they must not
  introduce a separate navy, violet, or warm dark-mode surface family.
- Preserve intentional dark brand panels and high-contrast white actions;
  dark mode must not flatten visual hierarchy into one undifferentiated navy
  surface.
- Theme changes may animate surface and text colors for 200ms. Do not animate
  validation, authentication, permission, or status meaning.
- Printed reports always use a white canvas and black text regardless of the
  selected screen theme.

## Typography

Manrope is bundled locally as the open-source working font.

- Access display: `{typography.display-access}`.
- Page headings: `{typography.page-title}`.
- Card headings: `{typography.card-title}`.
- Form labels: `{typography.label}`.
- Supporting content: `{typography.body}`.
- System-state labels: `{typography.micro}`.
- Do not use thin weights for form labels, controls, or status information.

## Access components

### Access shell

`access-brand-panel` occupies the left side on desktop and identifies the
system and the three approved roles. It is not a public introduction.

`access-form-panel` contains the only access interaction. Keep its content width
below 576px for scanability.

### Portal identity

`portal-identity` names the current portal above the form and in the responsive
wordmark. It is informational, not selectable. The combined Admin portal must
always remain one surface; do not create separate Guidance, Psychometrician,
Admission, or Testing portals.

The combined Admin role may be assigned to multiple authorized guidance
counselors and psychometricians. Each person signs in with an individual
account; the single portal and role type must never imply one staff member or
shared credentials.

### Credential fields

`credential-input` uses a visible label, icon, autocomplete metadata, inline
error association, and a minimum 48px control height. Password visibility is a
real keyboard-accessible button.

Only validate requirements known to the UI:

- Email is required and must be syntactically valid.
- Password is required.

Do not invent password complexity, institutional email domains, account status,
or recovery policy.

### Route behavior

The primary button says “Sign in” and authenticates against Laravel for the
current portal. No role-switching control appears on the form. Successful
submission requires a server session and a portal-matching role before the
protected workspace opens.

## Role dashboard shell

- Desktop uses a 256px expanded `workspace-sidebar` and an 80px collapsed icon
  rail. A labelled chevron control sits on the sidebar edge and switches
  between the two widths without removing navigation. Collapsed items retain
  their active state, accessible names, and right-side tooltips. Mobile uses
  the same navigation in a left-opening Sheet. The toggle must remain keyboard
  accessible and expose its expanded state.
- `workspace-topbar` contains a labelled `Search modules` control and account
  context for Student and System Administrator workspaces. In the Admin
  workspace, module search belongs within the dashboard content instead of the
  global top bar. It filters module access only; it is not a global applicant
  or record search.
- Keep the workspace chrome and feature introduction compact. The desktop top
  bar uses a 64px height, and the shared Admin page header contains one title,
  one concise description, optional actions, then its breadcrumb. Search and
  filter controls follow the breadcrumb. Do not repeat an `Admin workspace`
  eyebrow on every feature or stack large empty margins before the primary
  task surface.
- Every role dashboard, feature list, detail view, module surface, and
  breadcrumb is fluid within the available workspace rather than capped at a
  fixed desktop width. Workspace-level surfaces must continue using the
  available canvas at wide viewports and browser zoom levels without creating
  excessive outer gutters. Intentional reading-width constraints remain
  appropriate for forms, dialogs, notices, and document content.
- The workspace shell provides a semantic Breadcrumb and a Radix-based
  Dropdown Menu for account context and sign-out. On Admin landing pages the
  breadcrumb appears below the heading and above search/filter controls.
  Detail pages without search retain the breadcrumb before the record surface.
  Breadcrumb controls use distinct accessible names from sidebar navigation.
- The sidebar and quick-access cards expose only the current role's modules.
- Workspace search filters the quick-access module grid. Module cards open a
  dedicated module surface and provide a functional return to Dashboard.
- `workflow-card` shows approved process labels only. It must not imply that a
  step is complete until real status data exists.
- Select the information pattern from the task, not from CRUD convention.
  Reserve tables for dense operational comparison across stable columns.
  Use workflow lanes for lifecycle work, ranked review cards for decisions,
  catalogues for browsable entities, timelines for history, and document
  libraries for reports. Do not reuse one table shell across unrelated modules.
- Applicant Management uses a borderless `shadow-sm` toolbar, desktop table
  surface, mobile record cards, pagination surface, and record-detail cards.
  Form controls and table row separators may retain functional borders.
- Official Results Management follows the same responsive list/detail pattern
  and shows source, review state, version, and immutable history. D-015 permits
  clearly isolated synthetic score-format examples for complete prototype
  states, but they must never be represented as official values, scales,
  thresholds, correction rules, or validation evidence.
- Manual Result Entry uses a form-first three-stage workflow: enter source
  values, review the complete record, then add it to verification review.
  Inputs use accessible labels and neutral shape validation only. Do not encode
  a passing threshold or automatic verification rule in the interface.
- CSV Result Import uses a source-file panel and a horizontally scrollable
  preview table because row-by-row column comparison is the primary task.
  Import reconciliation switches to status-filtered outcome cards so errors,
  duplicates, and next actions remain readable without another dense table.
- Assessments & Questionnaires uses workflow lanes for in-progress and
  submitted sessions, with progress-focused session cards, plus separate
  questionnaire version/detail views. Prototype content is isolated synthetic
  data. Session cards use a lane-native vertical sequence for identity, status,
  progress, and an activity/action footer; fixed inner widths must not compress
  applicant metadata or cause content overlap in half-width lanes. Synthetic
  content must not be represented or reused as an official instrument or
  scoring policy.
- Recommendations Management uses a responsive review-card grid that makes the
  applicant, top course, match, status, and generated date scannable before
  opening the ranked detail view. All prototype courses, matches, factors, and
  eligibility states are isolated synthetic UI data under D-015.
- Algorithm Validation Cases uses a searchable case library and a selected-case
  comparison surface for expected and deterministic snapshots. Student Decision
  Review uses selectable decision cards and a sticky detail summary; it must
  state that a preference is not admission or enrolment.
- Courses & Rules Management uses separate catalogue and rule-version
  list/detail views with lifecycle badges, searchable course cards, program
  metadata, interest profiles, career paths, eligibility conditions, effective
  periods, and version history. All prototype catalogue and rule content is
  isolated synthetic UI data under D-015.
- Reports Management uses a visual document library with one featured report,
  responsive preview cards, report-type and lifecycle filters, document-style
  detail preview, source-version references, linked-record navigation, and a
  real print action. Print media hides the application shell and prints only
  the selected report surface. Synthetic layouts and metadata are not official
  institutional report formats.
- Stakeholder-facing prototype screens show complete mock interface states.
  Keep internal OQ identifiers and approval-blocker notices in documentation,
  not in the visible product UI.
- The Admin dashboard may use isolated synthetic counts, applicant references,
  task timestamps, activity, and workflow states under D-015. Every dashboard
  card and queue item must perform a real frontend action such as filtering,
  expanding content, or navigating to an implemented route. Synthetic content
  must never imply operational performance, validation success, admission, or
  enrolment.
- The Admin dashboard uses the provisional violet system through a
  guidance-focused hero, five summary cards with decorative sparklines,
  operational activity chart, assessment-state chart, recommendation-review
  chart, responsive recent-applicant overview, and latest activity. Recharts
  is isolated from the Admin route bundle. Charts must include visible text
  labels and legends, respond to the selected period, and collapse cleanly on
  smaller screens.
  Chart-blue, chart-teal, and chart-slate are supporting visualization tokens,
  not institutional branding.
- Summary cards, recent-applicant actions, latest-activity rows, the hero
  action, and period controls must remain functional. Detailed queues,
  workflow stages, and module actions belong to their dedicated Admin routes.
- The Student dashboard is task-oriented rather than analytical. Use one
  next-action hero, six text-labelled journey-status cards, a recommended
  next-step panel, available actions, and the guidance-not-enrolment boundary.
  Do not add vanity charts, admission likelihood, success rates, invented
  scores, or unsupported completion percentages.
- Student dashboard actions open only Student modules. Official result access
  is read-only, course guidance can show prerequisite status without implying
  admission, and Admin/System Administrator controls must never appear.
- Student profile and application work is mobile-first, not mobile-only, and
  remains intentionally different from the Admin information-dense layout.
  Use one readable column on small screens, 48px form controls, 16px mobile
  input text, full-width mobile primary actions, concise completion guidance,
  and an organized multi-column desktop composition where it improves
  scanning. Reading-width constraints may apply to form content, but the
  Student workspace shell must use the available desktop canvas.
- Student feature pages use the same compact header hierarchy as Admin feature
  pages: title and description first, then the breadcrumb directly below.
  Do not place the shell breadcrumb above the heading or repeat a separate
  Dashboard back row. Editable pages route the breadcrumb through their
  dirty-change protection.
- Profile editing uses explicit Edit, Cancel, and Save actions with inline
  labelled validation, disabled/loading feedback, dirty-change protection,
  and non-critical Sonner confirmation. Application submission uses a titled
  confirmation dialog and becomes read-only after the demonstrated submit
  transition.
- D-015 profile fields, application references, completion, and lifecycle
  states are isolated synthetic UI examples. They are not approved TCC fields,
  admission-cycle policy, submission rules, or production data.
- Student Official Result uses a read-only summary, visible verification badge,
  source/provenance details, verification history, and correction-contact
  guidance. It must never expose edit, encode, verify, reject, or replace
  actions to Students, and it must not infer pass/fail, eligibility, admission,
  or enrolment from a recorded value.
- Student assessment introductions use the shared Student feature header, one
  concise orientation surface, plain-language expectations, active-version and
  readiness context, and a separate notice surface. Beginning requires an
  explicit acknowledgement and confirmation. Keep controls at least 48px on
  mobile, stack actions on narrow screens, and provide inactive, loading,
  empty, and retryable-error states.
- D-015 assessment-introduction content may demonstrate only general
  interaction and safety boundaries. It must not present mock questions,
  response options, mappings, scoring, interpretations, or validation results
  as approved instrument content.
- Student assessment sessions use a mobile-first question flow with one prompt
  at a time, large labelled response controls, explicit answered/unanswered
  progress, direct question navigation, and full-width mobile actions. Desktop
  may place the progress navigator beside the question while preserving a
  focused reading width and the fluid application canvas.
- Assessment responses distinguish saving, saved, saved-on-device, and
  unsaved states in text. Review lists every response, incomplete submission
  remains disabled, final submission uses a titled confirmation dialog, and
  completed responses become visibly locked. Offline, loading, empty,
  retryable-error, and stale-version recovery states are required.
- D-015 session prompts and response choices must remain isolated from
  production data. Never calculate, expose, or imply RIASEC dimensions,
  mappings, scores, interpretations, validation results, or course outcomes
  until their controlling approvals exist.
- Student assessment results use a focused mobile-first summary rather than an
  Admin analytics dashboard. Show the top code, all six dimension labels and
  numeric values, accessible bars, leading-dimension order, submitted-session
  and assessment-version provenance, and a visible read-only boundary.
- Every assessment-result value must remain understandable without colour.
  Keep course rankings, eligibility, admission likelihood, enrolment actions,
  diagnosis language, and unsupported certainty out of this screen. Loading,
  empty, retryable-error, and result-preparation states are required.
- D-015 result values and ordering are isolated visualization fixtures only.
  They are not approved scoring, norms, interpretations, mappings, validation
  evidence, research findings, or production seed data.
- Student recommendation results use ranked, borderless `shadow-sm` course
  cards rather than a dense table. Each option keeps its rank, course code,
  recorded match, requirement status, explanation factors, and details
  readable without relying on colour.
- Recommendation filters, a two-to-three-course comparison flow, and focused
  course details must remain usable with 44px touch targets on mobile and a
  balanced multi-column composition on wider screens. Comparison selection is
  explicit, reversible, and preserved while viewing course details.
- Always label recommendations as guidance rather than admission or
  enrolment. D-015 ranks, courses, match values, requirement states, factors,
  and version references are isolated UI fixtures only; they are not approved
  TCC catalogue data, eligibility rules, weights, validation evidence, or
  production seed data.
- Student course details extend the recommendation card with learning areas,
  general career directions, recorded factors, and review notes. Career
  directions must be framed as discussion prompts rather than employment
  promises, and comparison remains card-based on mobile instead of forcing a
  wide table.
- Student decisions use a labelled course selector, large radio-card choices,
  a required note, review confirmation, editable current state, and visible
  local history. Preference is always described separately from application
  submission, admission, course assignment, slot reservation, and enrolment.
- Student reports use a document preview with own-record references,
  recommendation summary, current decision, limitations, and real print and
  download controls. The application shell is hidden for print. D-015 report
  content, version, layout, and text export are presentation fixtures only,
  not an approved institutional report format or signatory record.
- Show access and responsibility boundaries as text, never through colour
  alone.
- Do not present synthetic counts, names, scores, courses, alerts, or workload
  states as official or production data. Do not use vanity charts or
  unsupported success metrics.
- Provide one functional sign-out action that returns to the matching portal.
- Reusable LoadingState, EmptyState, and ErrorState surfaces use borderless
  `shadow-sm` cards. Admin routes expose consistent loading, empty, and
  retryable error boundaries. Forbidden, session-expired, and not-found routes
  use focused recovery pages with semantic heading focus.
- The Student dashboard keeps official results read-only. The combined Admin
  dashboard groups applicants, official results, assessments/questionnaires,
  recommendations, courses/rules, and reports.
- The System Administrator dashboard is visually distinct from the Admin and
  Student dashboards. Use a technical-operations hero, period-responsive
  access summaries, a ranked access-review list, text-labelled service states,
  recent audit activity, and an explicit responsibility boundary.
- System Administrator dashboard controls may open only technical account,
  role, cycle, and audit workspaces. Service, job, and backup states remain
  informational until their approved operator actions exist. Do not expose
  applicant scoring, psychometric interpretation, recommendation review,
  admission decisions, or completed-record mutation.
- D-015 System Administrator counts, tasks, events, and service states are
  isolated presentation fixtures, not production monitoring, audit evidence,
  backup evidence, or approval of account and role policy.

## Responsive behavior

- Mobile `< 768px`: one-column access form, compact brand, left-opening Sheet
  navigation, and single-column workspace cards.
- Tablet `768–1023px`: access form remains one panel; role options use three
  columns when space permits.
- Desktop `>= 1024px`: split access shell and persistent
  sidebar/topbar/content workspace layout. Student, Admin, and System
  Administrator use the same full responsive web-shell quality,
  available-canvas behavior, collapsible Sidebar, readable spacing, and
  overflow protection. Student content remains task-specific, but must not
  become a stretched mobile layout or leave excessive unused desktop space.
- No horizontal page scrolling at 320px.
- Interactive controls must meet a 44px minimum touch target on small screens.

## Motion

- Access content may enter once with the shared 700–750ms transition.
- Field and button states use 200–300ms color, border, and shadow transitions.
- Do not animate validation messages, credentials, authentication state, or
  permission meaning.
- Respect `prefers-reduced-motion: reduce`.

## Accessibility

- Every field has a persistent visible label.
- Validation messages use `aria-invalid` and `aria-describedby`.
- Password visibility has a changing accessible name.
- Focus indicators stay visible.
- Status is never conveyed through color alone.
- Workspace headings maintain a logical order.

## Content guardrails

### Do

- Use exactly the three approved role names.
- Keep official examination results read-only in Student descriptions.
- Describe Admin-controlled workflows without inventing permission details.
- Use borderless `shadow-sm` card surfaces consistently.

### Do not

- Add a role picker to a sign-in form.
- Store prototype credentials.
- Add fake forgot-password, registration, or social-login controls.
- Present synthetic dashboard or applicant data as official, measured, or
  production data.
- Add public marketing sections to the application root.

## Validation

After each access or workspace UI change:

1. Run frontend lint, tests, and the production build.
2. Run `npx @google/design.md lint DESIGN.md`.
3. Test validation, portal isolation, password visibility, workspace entry, and
   sign-out behavior.
4. Verify desktop/mobile rendering, keyboard focus, overflow, console output,
   and computed contrast in the in-app browser.
5. Keep authentication and workspace features IN PROGRESS until backend,
   authorization, stakeholder approval, and browser evidence exist.
