# Repository Instructions

**Purpose:** Govern all work on the TCC course-recommendation capstone.  
**Status:** APPROVED for repository workflow; institutional rules remain subject to recorded approval.  
**Basis:** Documentation initialization brief and source precedence in [docs/02-SOURCE-OF-TRUTH.md](docs/02-SOURCE-OF-TRUTH.md).  
**Owner:** Capstone team.  
**Last updated:** 2026-07-27.  
**Related IDs:** D-001-D-015, R-001-R-013.  
**Open questions:** See [docs/22-OPEN-QUESTIONS.md](docs/22-OPEN-QUESTIONS.md).

Before any task, read:

1. [docs/00-INDEX.md](docs/00-INDEX.md)
2. [docs/17-PROGRESS-TRACKER.md](docs/17-PROGRESS-TRACKER.md)
3. [docs/18-DECISION-REGISTER.md](docs/18-DECISION-REGISTER.md)
4. [docs/22-OPEN-QUESTIONS.md](docs/22-OPEN-QUESTIONS.md)
5. [docs/23-END-TO-END-DELIVERY-CHECKLIST.md](docs/23-END-TO-END-DELIVERY-CHECKLIST.md)
6. [docs/24-ROLE-BASED-FEATURE-ROADMAP.md](docs/24-ROLE-BASED-FEATURE-ROADMAP.md)
7. For every UI/UX task, read [DESIGN.md](DESIGN.md) in full before proposing or editing the interface.

## Mandatory rules

- Treat APPROVED documents and decisions as the source of truth. Respect the source precedence defined in `docs/02-SOURCE-OF-TRUTH.md`.
- Never invent TCC policies, thresholds, course mappings, questionnaire scoring, datasets, labels, expected results, signatories, or validation evidence.
- Stop and record a BLOCKED item when an unresolved institutional decision affects implementation.
- Keep React as the presentation layer and Laravel as the REST API unless an approved ADR changes the architecture.
- Keep one responsive web codebase. Mobile delivery must wrap the web application without a separate native feature implementation; the wrapper technology and distribution method remain BLOCKED until approved.
- Implement exactly three application roles: `Student Applicant`, `Guidance/Psychometrician/Admin`, and the limited side role `System Administrator`. Do not implement separate Guidance, Psychometrician, Admission, Testing, or Developer/Maintainer roles.
- After D-001 is approved, use Tailwind CSS v4 through `@tailwindcss/vite`, shadcn/ui with Radix primitives, and Lucide React. Do not introduce Bootstrap, Material UI, Chakra UI, Ant Design, plain CSS as the primary styling system, or another competing component library.
- Keep generated/customized primitives in `src/components/ui`, application-level reusable components in `src/components/shared`, and feature-only components in `src/features/<feature>/components`.
- Keep global CSS limited to the Tailwind import, theme tokens/CSS variables, body defaults, fonts, print styles, and rare global rules.
- Do not invent or claim official TCC colors, logos, or typography. D-009 permits the `DESIGN.md` palette and motion language only as the PROVISIONAL working UI direction; keep it clearly non-official until the visual identity is approved under OQ-012.
- Use `DESIGN.md` as the PROVISIONAL visual implementation reference for UI work. Approved decisions, institutional constraints, accessibility requirements, and `docs/11-UI-UX-PLAN.md` take precedence when they conflict.
- Apply the `DESIGN.md` system through Tailwind utilities, semantic CSS variables, shadcn/ui variants, and reusable React components. Do not scatter unexplained hex colors, one-off spacing values, duplicated component markup, or page-specific styling that should be a shared token or component.
- Under D-014, application cards are borderless surfaces with Tailwind
  `shadow-sm`. Do not add `border`, `border-b`, `border-r`, or other perimeter
  borders to cards; reserve borders for controls, table separators, and
  non-card structural elements when needed.
- Keep feature code separated by business domain. Extract reusable
  application-level controls instead of growing route files or duplicating
  table, pagination, and page-header logic.
- Under D-015, stakeholder-facing prototype screens use isolated synthetic
  mock data to demonstrate the intended complete UI instead of exposing
  internal OQ or approval-blocker notices. Keep unresolved decisions in the
  controlled documentation, never describe mock content as official TCC
  policy, and never reuse it as production seed data or validation evidence.
- Adapt the visual language to truthful TCC course-recommendation content. Do not copy Stripe names, logos, financial metrics, proprietary assets, or irrelevant financial-product interface patterns.
- Under D-010, open the MVP at the shared role-access experience. Do not add a public marketing or introduction homepage unless a later approved decision restores one.
- Under D-011 and D-012, do not ask users to select a role on a sign-in form. Use dedicated Student, combined Admin, and System Administrator portal URLs; the future backend remains authoritative for account role and cross-role authorization.
- Do not use proprietary fonts without a valid project licence. Use the bundled open-source Manrope variable font with system fallbacks for the provisional interface, and preserve readable weights, text resizing, and contrast.
- Implement UI work one reviewable component or screen slice at a time. Define responsive, loading, empty, error, blocked, permission, and interaction states whenever the approved feature requires them.
- Keep all controls functional. Do not add fake links, placeholder authentication, fabricated dashboard metrics, or actions whose route/API behavior does not exist; show an explicit BLOCKED or preview state instead.
- For every UI change, add or update component/content/accessibility tests and run frontend lint, tests, and production build. Perform real-browser desktop/mobile, keyboard-focus, overflow, console, and rendered-contrast checks before marking a screen COMPLETED. If the browser or required approval is unavailable, keep the item IN PROGRESS and record the missing evidence.
- When an approved visual-system change alters tokens, typography, shapes, component rules, or responsive behavior, update `DESIGN.md`, `docs/11-UI-UX-PLAN.md`, affected components, tests, and progress records together. Do not allow implementation and design documentation to drift.
- Official admission examination data is controlled by the authorized `Guidance/Psychometrician/Admin` role. Students may view their verified result but may not create or verify it.
- The deterministic, versioned, explainable RIASEC plus admission-rule engine is mandatory.
- Treat Decision Tree and Random Forest as optional until an approved labelled dataset, target label, metrics, validation cases, and model card exist.
- Preserve historical questionnaire, rule, score, examination correction, and recommendation versions. Completed records are immutable; corrections create auditable history.
- Enforce server-side validation, authorization, and ownership checks for protected data.
- Write or update tests with every functional change.
- Update the progress tracker, backlog, current sprint, changelog, and affected architecture documents after each completed task.
- Never mark work COMPLETED without test, review, or approval evidence.
- Make small, reviewable changes. Avoid destructive commands and never overwrite human work without comparison and review.
- Never commit secrets, personal production data, generated credentials, or environment files.

## Current gate

Application feature development is BLOCKED until the documentation baseline and the institutional decisions identified in `docs/22-OPEN-QUESTIONS.md` are reviewed. Work that does not depend on those decisions may proceed only after explicit approval.
