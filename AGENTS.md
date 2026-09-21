# Repository Instructions

**Purpose:** Govern all work on the TCC course-recommendation capstone.  
**Status:** APPROVED for repository workflow; institutional rules remain subject to recorded approval.  
**Basis:** Surviving repository authorities indexed in [docs/README.md](docs/README.md).
**Owner:** Capstone team.  
**Last updated:** 2026-09-14.
**Related approvals:** User-approved role-model replacement on 2026-08-09, purple/pastel visual-system replacement on 2026-08-28, warm coastal palette replacement on 2026-08-30, Nunito Sans/Montserrat typography replacement on 2026-09-01, white line-based Administrator layout with retained sidebar on 2026-09-01, unified reference-derived palette replacement on 2026-09-05, public Student landing page restoration on 2026-09-06, and light-green-primary pastel palette replacement on 2026-09-07.

Before any UI/UX task, read [DESIGN.md](DESIGN.md) in full before proposing or editing the interface. The former controlled `docs/` baseline was intentionally removed by the repository owner and must not be restored unless explicitly requested.

## Mandatory rules

- Treat APPROVED documents and dated decisions as the source of truth. Use `docs/README.md` to locate the surviving current references and read each dated note's status before relying on it.
- Never invent TCC policies, thresholds, course mappings, questionnaire scoring, datasets, labels, expected results, signatories, or validation evidence.
- Stop and record a BLOCKED item when an unresolved institutional decision affects implementation.
- Keep React as the presentation layer and Laravel as the REST API unless an approved ADR changes the architecture.
- Keep one responsive web codebase. Mobile delivery must wrap the web application without a separate native feature implementation; the wrapper technology and distribution method remain BLOCKED until approved.
- Implement exactly two application roles: `Student Applicant` and `Administrator`. The former staff-support role and portal are removed and must not be restored without a new approved decision.
- Every Administrator uses an individual account. Never use shared staff credentials.
- Administrators govern the programme catalogue, student and assessment monitoring, aggregate reports, and audit records.
- After D-001 is approved, use Tailwind CSS v4 through `@tailwindcss/vite`, shadcn/ui with Radix primitives, and Lucide React. Do not introduce Bootstrap, Material UI, Chakra UI, Ant Design, plain CSS as the primary styling system, or another competing component library.
- Keep generated/customized primitives in `src/components/ui`, application-level reusable components in `src/components/shared`, and feature-only components in `src/features/<feature>/components`.
- Keep global CSS limited to the Tailwind import, theme tokens/CSS variables, body defaults, fonts, print styles, and rare global rules.
- Do not invent or claim official TCC colors, logos, or typography. The repository-owner-approved 2026-09-07 `DESIGN.md` revision permits its light-green primary with softly saturated orange, blue, pink, yellow, mint, and neutral supporting colors only as the PROVISIONAL working UI direction; keep it clearly non-official until the institution approves the visual identity.
- Use `DESIGN.md` as the PROVISIONAL visual implementation reference for UI work. Approved decisions, institutional constraints, and accessibility requirements take precedence when they conflict.
- Apply the `DESIGN.md` system through Tailwind utilities, semantic CSS variables, shadcn/ui variants, and reusable React components. Do not scatter unexplained hex colors, one-off spacing values, duplicated component markup, or page-specific styling that should be a shared token or component.
- Under the repository-owner-approved 2026-09-01 Administrator direction, Admin pages use a plain continuous canvas structured by thin dividers, split regions, tables, and timelines rather than card containers. Student-facing primary cards retain the 20-28px family defined in `DESIGN.md`.
- Keep feature code separated by business domain. Extract reusable
  application-level controls instead of growing route files or duplicating
  table, pagination, and page-header logic.
- Under D-015, stakeholder-facing prototype screens use isolated synthetic
  mock data to demonstrate the intended complete UI instead of exposing
  internal OQ or approval-blocker notices. Keep unresolved decisions in the
  controlled documentation, never describe mock content as official TCC
  policy, and never reuse it as production seed data or validation evidence.
- Adapt the visual language to truthful TCC course-recommendation content. Do not copy Stripe names, logos, financial metrics, proprietary assets, or irrelevant financial-product interface patterns.
- The repository-owner-approved 2026-09-06 direction supersedes D-010's direct role-access entry and restores one public Student landing page at `/`. Keep Student and Administrator authentication on their dedicated portal URLs, and do not add role selection to the landing page or sign-in forms.
- Do not ask users to select a role on a sign-in form. Use dedicated Student and Administrator portal URLs; the backend remains authoritative for account role and cross-role authorization.
- Do not use proprietary fonts without a valid project licence. Use bundled open-source Nunito Sans Variable for headings and Montserrat Variable for paragraphs, labels, controls, and data, with system fallbacks; preserve readable weights, text resizing, and contrast.
- Do not use proprietary fonts without a valid project licence. Use bundled open-source Open Runde for headings and Montserrat Alternates for paragraphs, labels, controls, and data, with system fallbacks; preserve readable weights, text resizing, and contrast.
- Implement UI work one reviewable component or screen slice at a time. Define responsive, loading, empty, error, blocked, permission, and interaction states whenever the approved feature requires them.
- Keep all controls functional. Do not add fake links, placeholder authentication, fabricated dashboard metrics, or actions whose route/API behavior does not exist; show an explicit BLOCKED or preview state instead.
- For every UI change, add or update component/content/accessibility tests and run frontend lint, tests, and production build. Perform real-browser desktop/mobile, keyboard-focus, overflow, console, and rendered-contrast checks before marking a screen COMPLETED. If the browser or required approval is unavailable, keep the item IN PROGRESS and record the missing evidence.
- When an approved visual-system change alters tokens, typography, shapes, component rules, or responsive behavior, update `DESIGN.md`, surviving current documentation, affected components, tests, and progress records together. The deleted controlled `docs/11-UI-UX-PLAN.md` must not be restored unless explicitly requested. Do not allow implementation and design documentation to drift.
- Under the repository-owner decision of 2026-08-28, Student Applicants self-declare their entrance examination result before starting or continuing the RIASEC assessment; no Administrator verification is used. Rule `SELF-DECLARED-TCC-ENTRANCE-2026-01` classifies 1.0 through 2.5 as the board-programme group and 2.6 through 5.0 as the non-board-programme group. The repository-owner-approved 2026-09-08 ranking revision compares all configured programmes by RIASEC fit and presents the entrance group as separate guidance rather than removing programmes from the ranking. Preserve the declaration and rule snapshot used by each assessment and recommendation.
- The deterministic, versioned, explainable RIASEC plus admission-rule engine is mandatory.
- Treat Decision Tree and Random Forest as optional until an approved labelled dataset, target label, metrics, validation cases, and model card exist.
- Preserve historical questionnaire, rule, score, examination correction, and recommendation versions. Completed records are immutable; corrections create auditable history.
- Enforce server-side validation, authorization, and ownership checks for protected data.
- Write or update tests with every functional change.
- Keep surviving repository authority and implementation notes synchronized. Do not restore the intentionally deleted controlled documentation unless explicitly requested.
- Never mark work COMPLETED without test, review, or approval evidence.
- Make small, reviewable changes. Avoid destructive commands and never overwrite human work without comparison and review.
- Never commit secrets, personal production data, generated credentials, or environment files.

## Repository architecture and clean-code rules

The repository-wide implementation standard is [docs/architecture/development-standards.md](docs/architecture/development-standards.md). Apply it to every new feature, bug fix, refactor, and review.

- Preserve the framework-native monorepo boundary: `apps/web` is the React presentation application and `apps/api` is the Laravel authority. Do not add parallel `frontend`, `backend`, root `database`, root `tests`, or duplicate asset trees.
- Assign every change to one business owner before coding. Prefer a cohesive feature module over generic `misc`, `helpers`, `common`, `final`, `backup`, or version-suffixed folders.
- Keep dependency direction explicit. Application composition may depend on features; features may depend on shared components, UI primitives, and cross-feature services; shared/UI/service layers must never depend back on feature modules.
- Keep route and page components focused on composition and state coordination. Extract independently testable sections, hooks, adapters, and interaction components when a file mixes unrelated responsibilities. Do not split code only to satisfy an arbitrary file count.
- Use `apps/web/src/services/api-client.ts` for ordinary browser HTTP transport. Feature API adapters own endpoint-specific request and response types; components do not call `fetch` directly or implement authorization, scoring, eligibility, or policy.
- Keep Laravel routes declarative and controllers focused on HTTP orchestration. Use Form Requests for reusable validation, middleware and policies for access, services for workflow/domain/integration logic, models for persistence relationships/casts/scopes, and jobs for retryable asynchronous work.
- Keep one source of truth for each contract. When a payload or behavior changes, update its Laravel producer, React consumer, fixtures, tests, and documentation in the same slice.
- Reuse an existing abstraction when it genuinely matches. Do not create speculative repositories, managers, utilities, hooks, services, or wrapper components with only one unclear responsibility.
- Remove code or dependencies only after proving they have no runtime, framework-discovery, build, script, test, documentation, migration-history, or asset-pipeline role.
- Treat large-file limits as health signals. The automated architecture check prevents new oversized modules and growth in recorded legacy hotspots; exceptions require a dated rationale and a concrete follow-up split plan.
- Before completion, run `npm.cmd run check:architecture` from `apps/web` in addition to the relevant backend/frontend validation commands.

## Required implementation workflow

1. Read the applicable authority and dated decisions; identify APPROVED, PROPOSED, PROVISIONAL, BLOCKED, and OUT OF SCOPE boundaries.
2. Trace the existing route, request, service, persistence, API payload, frontend adapter, component, and test path before editing.
3. State the owning domain and place new files at the narrowest correct layer. Record a genuine unresolved policy or contract decision as BLOCKED.
4. Implement one reviewable vertical slice. Preserve authorization, validation, ownership, historical evidence, loading/error/empty states, and accessibility.
5. Add focused unit/component tests and integration/feature tests at the behavior boundary. Add Playwright coverage when a user-visible workflow or responsive interaction changes.
6. Run architecture, formatting, lint, type, test, build, and rendered-browser checks in proportion to the change. Report unavailable evidence honestly.
7. Synchronize the documentation index, architecture/API/database/design records, progress, backlog, and dated implementation note before marking the slice COMPLETED.

## Current gate

Application feature development and capstone demonstrations may proceed using the recorded versioned researcher-proposed defaults. Unresolved external-review items documented in surviving notes gate official institutional adoption, production claims, and deployment where applicable, but they do not stop local implementation or evaluation when a documented proposed default exists. Never represent a proposed default as TCC- or psychometrician-approved.
