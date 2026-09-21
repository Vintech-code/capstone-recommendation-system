# System Improvement Roadmap

**Status:** UPDATED for Google account-selection hardening on 2026-09-19.

## Product roles

### Student Applicant

Students create and own their account, self-declare their entrance examination result, complete the locally stored RIASEC assessment, review immutable results, explore and save programmes, compare recommendations, manage their self-report profile, and make the final course decision.

### Administrator

Administrators govern programme content and media, review catalogue source evidence, monitor Student and assessment records, generate aggregate reports, and review audit activity. Administrators cannot rewrite completed assessment evidence or historical recommendations.

## Priority workstreams

### Repository maintainability — 2026-09-13

**Progress / sprint: COMPLETED.** The repository-wide audit is recorded in `docs/architecture/codebase-audit-2026-09-13.md`. The completed slice preserves the `apps/web` and `apps/api` application boundary, introduces current documentation categories, centralizes frontend API transport, extracts Administrator reporting/presentation services, removes verified unreachable code and assets, retires the unused Laravel Vite welcome scaffold, and aligns stale tests with approved policy. Laravel formatting and all 116 backend tests pass; frontend lint, all 135 enabled unit/component tests, the production build, and all 28 desktop/mobile Playwright cases pass. Detailed evidence is recorded in `docs/note/2026-09-13-codebase-refactor.md`.

**Backlog:** Split the largest page modules only in dedicated UI slices with automated and rendered browser evidence. Review legacy compatibility selectors in `index.css` separately. Optimize multi-megabyte landing and assessment illustrations only with visual QA. The historical-migration preservation guidance was superseded by the approved 2026-09-16 clean baseline and verified local reset; do not restore the intentionally removed numbered documentation baseline.

### Architecture and design governance — 2026-09-14

**Progress / sprint: COMPLETED.** `AGENTS.md`, `DESIGN.md` version 4.4, and `docs/architecture/development-standards.md` now define the mandatory framework-native layout, dependency direction, frontend and backend responsibilities, end-to-end contract workflow, extraction signals, exception process, and required evidence for future work. The frontend `check:architecture` command enforces the boundaries that can be checked safely against the current repository and caps growth in recorded legacy hotspots.

**Backlog:** Reduce each recorded large-file cap through dedicated behavior-preserving slices rather than weakening the guard. Candidate order remains Student dashboard, Admin Student detail, public landing, assessment session, Student profile, and programme catalogue. Every reduction requires focused tests and rendered evidence when presentation changes.

### Product-name removal — 2026-09-21

**Progress / sprint: IMPLEMENTED with automated validation.** The former product label was removed case-insensitively from repository source paths and contents. Visible copy now uses factual TCC course-recommendation language; internal notification classes, frontend types, configuration keys, environment examples, backup identifiers, anchors, tests, and documentation use neutral replacements. Existing legacy environment settings and encrypted backups remain compatible without retaining the former literal label in source.

**Remaining evidence:** The build, backend suite, focused frontend coverage, lint, and Laravel formatting pass. Full frontend validation retains three unrelated existing failures recorded in the dated implementation note; rendered browser review remains pending.

### Public Student entry

- Open `/` at the approved Student-oriented landing page while retaining dedicated `/student/login` and `/admin/login` portals.
- Use the supplied `assets/images/landing-image-bg.png` as decorative hero artwork beside original project-specific decision-support copy.
- Present factual RIASEC area descriptions, the implemented Student journey, explainable recommendation boundaries, and deliberate assessment/sign-in actions without repeating portal shortcuts in the header or footer.
- Keep landing calls to action fully rounded and preserve the light-green-primary pastel system.
- Keep the public hero close beneath the header, use the supplied `landing-image-bg.png`, keep the hero artwork static, and vary restrained reveal transitions with complete reduced-motion support.
- Preserve the public header's scroll-to-floating transition; keep its initial mobile state flush with the viewport, use a separately animated overlay burger menu without a mobile header assessment action, show the PNG-led RIASEC set in two columns below `lg`, and close the page with the bounded dark-green logo-watermark footer recorded on 2026-09-12.
- Do not copy reference branding, wording, claims, metrics, or supporting artwork, and do not describe proposed defaults as institutionally approved.

### Minimalist clay design-system migration

- Treat `DESIGN.md` version 4.0 as the approved working visual specification and keep it clearly non-official as TCC branding.
- Migrate semantic tokens and shared primitives before feature screens; do not apply isolated page-specific restyles.
- Use the green-neutral canvas, neutral text, Open Runde headings, Montserrat Alternates body typography, `#7ED321` primary actions, and softly saturated orange/violet/pink/yellow/olive accents. Do not use blue UI surfaces or semantic product tokens; existing project imagery may retain its source colors without defining the theme.
- Keep Administrator pages compact: 20–24px page titles, 18–20px section titles, 12–14px operational text, tighter 12–24px layout rhythm, and `rounded-xs` routine controls and data surfaces. Render the desktop Student ledger with Grid.js while retaining Laravel-owned filtering, sorting, and pagination.
- Use minimalist claymorphism on existing surfaces and controls through tone, border, one inset highlight, and `shadow-sm` maximum elevation. Keep ghost and link actions flat and do not add card hover lift.
- Keep page, sidebar, card, and hero surfaces light. Reserve deeper values for readable text, icons, and accessible hover or pressed states rather than large dark areas.
- Preserve the current binary assessment contract. The illustrated two-activity, three-level rating pattern remains proposed and blocked until its instrument and scoring contract are approved.
- Keep the active assessment controls visible with a compact open-canvas progress strip and sticky bottom navigation. Answers auto-advance, while an answered question revisited through Previous exposes an explicit Next action.
- Present the current Agree and Do not agree radio controls with the shared minimalist clay treatment while preserving accessible selection and focus states.
- Replace photographic presentation assets with original or properly licensed flat educational illustrations in separately tested screen slices.
- Keep the interface light-only and retire existing dark-theme presentation only through a reviewed implementation change.
- Keep application shells free of a repeated global footer so page content and primary actions remain focused.
- Require component/accessibility tests, lint, build, and real-browser desktop/mobile evidence for each migrated slice.

### Local assessment and explainable recommendations

- Require the Student Applicant's self-declared entrance examination result before an assessment starts or continues.
- Under `SELF-DECLARED-TCC-ENTRANCE-2026-01`, record 1.0-2.5 as the board-programme group and 2.6-5.0 as the non-board-programme group. Keep this as separate guidance while ranking all configured programmes by RIASEC fit.
- Snapshot the declaration and rule with each assessment and recommendation; an attached declaration is immutable.
- Keep the questionnaire, scoring inputs, rule versions, and programme profiles locally controlled and versioned.
- Return the Student's three leading recorded RIASEC dimensions and require exactly three ordered dimensions for every classified programme profile.
- Use the PSG-informed analytical matrix under `PROPOSED-RIASEC-3-PSG-MATRIX`. Keep BS Community Development visible as classification pending, with no rank or match percentage, until an authoritative programme standard is supplied.
- Keep all 12 classified programme-major entries independently rankable across the matrix's 11 distinct ordered three-code profiles; in particular, do not collapse BSEd Social Studies `SIE` into the English/Filipino `SAI` profile.
- Present the 11 classified codes through the repository-owner-approved `PSG-PROFILE-NAMES-2026-09-21` two-word interest-profile names and two-sentence descriptions. Preserve a factual leading-area fallback for every other valid Student result code and never present the names as personality diagnoses.
- Preserve completed attempt history and the recommendation snapshot generated for each attempt.
- Explain recommendations only from recorded scores and configured programme evidence.
- Show multiple catalogue career directions per recommended programme. Treat Administrator-selected ESCO occupations as versioned external enrichment, never as an independent Student-career score or employment prediction.
- Do not claim institutional or psychometric approval without evidence.

### Student journey

- Keep assessment, result, history, programme exploration, saved programmes, and profile actions accessible on desktop and mobile.
- Prefer persistent result and history actions over redundant completed-state cards.
- Use authenticated profile data and truthful empty, loading, processing, and failure states.
- Present the top three ranked programme matches with compact descending-width pastel fields and an exact recorded-match rail; keep later ranks plain and move detailed RIASEC evidence to the programme detail flow.

### Administrator governance

- Keep Students and assessment monitoring consolidated in one protected record workflow.
- Use the authoritative entrance declaration, current assessment lifecycle, recommendation availability, and saved-programme counts in the server-paginated Student directory.
- Preserve each attempt and its versioned evidence in the authoritative records. The separate Assessment history and evidence section is removed from Administrator Student detail by owner request on 2026-09-07.
- Structure Student detail as one résumé-style profile and assessment surface followed by ranked programme recommendations. The separate Assessment context surface was removed by owner request on 2026-09-07.
- Keep the dashboard operational: show the Student funnel and actionable failure, source-review, and draft queues instead of decorative or inferred readiness metrics.
- Keep the redesigned dashboard palette tied to meaning: green for the primary journey, violet for assessment records, yellow for available results, and pink for recommendation runs. Preserve the joined data-strip and exact stage-flow treatment without adding fabricated indicators.
- Read programme eligibility only from the versioned backend catalogue; never infer board or non-board classification in the browser.
- Support versioned programme drafts, locked API-controlled facts, source review, preview, publication, and audit history.
- Support authenticated, rate-limited ESCO occupation search in Laravel and require deliberate Administrator selection plus catalogue publication before an ESCO reference appears to Students.
- Keep reports aggregate and privacy-aware across entrance declarations, eligibility, assessment lifecycle, recommendations, saves, and catalogue governance; identifiable exports remain disabled.
- Filter audit records by individual Administrator, action, record type, and date, and expose safe version/change summaries without unrestricted metadata.

### Authentication and authorization

- Maintain dedicated Student and Administrator portal URLs without role selection.
- Keep Google Student self-onboarding role-safe. Administrator Google sign-in is limited to a matching, already-provisioned active Administrator account; it must never create an Administrator or grant that role. Always request Google's account chooser so a rejected browser account can be changed on retry.
- **Progress / sprint: COMPLETED for Administrator account governance on 2026-09-14.** Authorized account managers can issue 15-minute single-use invitations, review invitation history, resend or revoke invitations, suspend/reactivate accounts, grant/remove the management capability while preserving a last-active-manager safeguard, and revoke sessions. Sensitive mutations require the acting Administrator's password and create audit events.
- **Progress / sprint: COMPLETED for password recovery hardening on 2026-09-14.** Reset emails preserve the account's dedicated Student or Administrator portal, successful reset navigation returns to that portal, and every user-created password path shares the Laravel-authoritative 12-to-255-character mixed-case, number, and symbol policy.
- Require individual Administrator accounts and enforce role checks, capability checks, suspension, session revocation, and ownership on the server.
- **DEFERRED:** Require MFA or passkeys and approve the corresponding recovery policy before making a production-security claim.

### Quality and release evidence

- Run Laravel tests and formatting after backend changes.
- Run frontend lint, tests, and production build after UI or contract changes.
- Perform real-browser desktop/mobile, keyboard, overflow, console, and contrast checks separately from automated validation.
- Keep ERD, routes, schema, tests, and current documentation synchronized.

## Current risks

- Institutional adoption remains gated by external approval of proposed questionnaire and programme-matching defaults.
- The current 42-statement binary instrument has seven questions in each RIASEC category and uses the matching 0-7 normalization range. Exact equal means use competition ranking with an alphabetical display fallback. The PSG-informed three-code profiles and equal-membership matching methodology remain PROPOSED pending external review; Community Development remains unclassified.
- The local development database was reset to the approved four-migration baseline on 2026-09-16 after an encrypted backup passed restore verification. Any future non-local baseline adoption still requires an environment-specific verified backup and rollback plan.
- The local `db_psychometric` database was reset again on 2026-09-18 for start-to-finish retesting. A new encrypted backup passed restore verification before deletion; the four migrations, two roles, local sign-in seeds, and PSGC locations were restored. See [reset record](docs/note/2026-09-18-local-database-reset.md). Any non-local reset still requires its own authorization, verified backup, and rollback plan.
- Browser-rendered evidence must be recorded independently of unit tests and builds.


## Philippine location selection ? 2026-09-07

**Decision: APPROVED** by the repository owner: use PSGC Cloud v2 as the location source, sync into MySQL, expose Laravel-only location APIs, and replace the existing profile address-name inputs with cascading selections. No recommendation or admission behavior changes.

**Progress / sprint: COMPLETED.** Schema, atomic sync, cached read API, hierarchy validation, profile selection, and the initial live MySQL catalogue import are implemented. Automated and browser location checks passed. See [implementation record](docs/note/2026-09-07-psgc-locations.md) for final validation evidence and changed files.

**Backlog:** Keep the documented region-scoped barangay sync because the global v2 endpoint silently caps results at 100 and ignores the tested pagination parameters. Monitor PSGC Cloud for correction of its NCR/Sarangani labels; the guarded normalization can be removed after the upstream hierarchy is consistent. Resolve the independent existing theme-test mismatch separately from this feature.
