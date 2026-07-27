# UI/UX Plan

**Purpose:** Define the responsive-web experience and accessibility baseline.  
**Status:** PROVISIONAL overall; the frontend UI/styling decision in D-001 is APPROVED.  
**Basis:** Roadmap, Section 10; MVP scope; user-supplied final frontend UI and styling decision.  
**Owner:** Capstone frontend/UI lead with stakeholder review.  
**Last updated:** 2026-07-28.  
**Related IDs:** D-001, FR-01-FR-10, NFR-01, NFR-07.  
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

- Use a priority overview, filterable attention queue, quick actions, recent
  activity, workflow status, and module catalogue in that order.
- Every prototype dashboard control must perform a frontend action: filter,
  expand, or navigate to an implemented Admin route.
- D-015 permits isolated synthetic counts and work records for stakeholder UI
  review. They are not institutional metrics, validation evidence, or
  production seed data.
- Keep status readable through text and icons, not colour alone.
- Avoid unrelated financial charts, vanity analytics, or unsupported
  performance claims.

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
- Explain eligibility and rankings in plain language, including the governing version and “why not” reasons where appropriate.
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
- All portals reuse the same production-style sign-in component with React Hook Form/Zod required and email validation, labelled credentials, autocomplete metadata, accessible errors, password visibility, and a direct “Sign in” action. No visible prototype disclaimer or unapproved password/domain policy is shown.
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
  libraries must be used when they better match the user’s decision task.
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
- System Administrator is the final role-specific implementation slice and
  must remain distinct from the combined Admin.
- Reworked all three role dashboards around a clean application shell: a
  persistent white desktop sidebar, left-opening mobile Sheet, sticky top bar,
  labelled module search, role-specific workflow, responsibility boundary,
  responsive quick-access grid, and module-detail surface.
- The reference image informs layout density and hierarchy only. Finance
  metrics, charts, transaction patterns, identities, and branding were not
  copied.
- Production authentication, server-authoritative role routing, route guards, policies, account states, registration, and recovery remain BLOCKED even though the visible UI is production styled.
- Current automated evidence passes: 44 tests across 2 files, lint, production build, and automated accessibility checks. Routes cover the Admin dashboard; Applicant, Official Result, Assessment Session, Questionnaire Version, Recommendation, Course, Admission Rule, and Report list/detail slices; manual result entry; CSV preview/reconciliation; algorithm validation cases; and student decision review. `DESIGN.md` reflects the separate-portal, role-dashboard, borderless `shadow-sm` card system, task-specific information patterns, integrated shared states, and report-only print behavior. Real-browser desktop/mobile, focus, overflow, console, print, and computed-contrast evidence remains pending because the in-app browser is unavailable.
