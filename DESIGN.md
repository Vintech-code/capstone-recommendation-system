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

The frontend currently demonstrates form validation, portal routing, screen
transitions, and workspace organization. Backend authentication and protected
data remain separate implementation work and must not be inferred from the UI.

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
- Workspaces use a persistent white desktop sidebar, a compact sticky top bar,
  a light-gray canvas, and a responsive content grid.
- The Admin dashboard is an operational command centre: priority overview,
  filterable attention queue, quick actions, recent activity, workflow status,
  then module access. Student and System Administrator dashboards retain their
  role-appropriate hierarchy. Do not copy finance-dashboard metrics, charts,
  cards, or content into the guidance system.
- Application cards are borderless. Use Tailwind `shadow-sm` as the standard
  card elevation; do not use `border`, `border-b`, or `border-r` to define card
  edges.
- Text stays concise; access screens are task interfaces, not marketing pages.

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

The primary button says “Sign in” and routes within the frontend to the
workspace associated with the current portal. No role-switching control appears
on the form. Production integration will replace this transition with
server-authenticated, policy-checked routing.

## Role dashboard shell

- Desktop uses a 256px `workspace-sidebar`; mobile replaces it with a
  left-opening Sheet.
- `workspace-topbar` contains a labelled `Search modules` control and account
  context. The control filters module access only; it is not a global applicant
  or record search.
- The workspace shell provides a semantic Breadcrumb below the top bar and a
  Radix-based Dropdown Menu for account context and sign-out. Breadcrumb
  controls use distinct accessible names from sidebar navigation.
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
  The System Administrator dashboard remains limited to technical access,
  roles, cycles, and audit-oriented controls and is implemented last among the
  three role-specific panels.

## Responsive behavior

- Mobile `< 768px`: one-column access form, compact brand, left-opening Sheet
  navigation, and single-column workspace cards.
- Tablet `768–1023px`: access form remains one panel; role options use three
  columns when space permits.
- Desktop `>= 1024px`: split access shell and persistent
  sidebar/topbar/content workspace layout.
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
