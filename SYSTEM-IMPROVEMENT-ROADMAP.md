# System Improvement Roadmap

**Status:** UPDATED for Google account-selection hardening on 2026-09-19.

## Product roles

### Student Applicant

Students create and own their account, self-declare their entrance examination result, complete the locally stored RIASEC assessment, review immutable results, explore and save programmes, compare recommendations, manage their personal and academic profile, and make the final course decision.

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

**Progress / sprint: IMPLEMENTED with automated validation.** The former product label was removed case-insensitively from repository source paths and contents. Visible copy now uses factual TCC course-recommendation language; transactional account-email classes, configuration keys, environment examples, backup identifiers, anchors, tests, and documentation use neutral replacements. Existing legacy environment settings and encrypted backups remain compatible without retaining the former literal label in source.

**Remaining evidence:** The build, backend suite, focused frontend coverage, lint, and Laravel formatting pass. Full frontend validation retains three unrelated existing failures recorded in the dated implementation note; rendered browser review remains pending.

### In-app notification removal — 2026-09-30

**Progress / sprint: IMPLEMENTED with automated validation; migration application and rendered browser review remain pending.** The Student and Administrator notification bell/feed, frontend feature module, authenticated notification endpoints, assessment-result and programme-update producers, scheduled dispatcher, dispatch model/configuration, and active notification schema were removed. Transactional password-reset, Administrator invitation, and Administrator security emails remain because they are account-security delivery rather than panel notifications.

**Remaining evidence:** Apply `2026_09_30_000000_remove_in_app_notifications` through Artisan after the target environment's required backup; it is currently pending locally. The full Laravel suite and frontend production build pass. Focused shell tests and changed-file lint pass. Full frontend tests retain three unrelated failures, full lint retains two unrelated Fast Refresh violations, the architecture check remains blocked by the unresolved `api`/`web` to `backend`/`frontend` relocation, and the in-app browser was unavailable.

### Public Student entry

- Open `/` at the approved Student-oriented landing page while retaining dedicated `/student/login` and `/admin/login` portals.
- Use the supplied `assets/images/landing-image-bg.png` as decorative hero artwork beside original project-specific decision-support copy.
- Present factual RIASEC area descriptions, the implemented Student journey, explainable recommendation boundaries, and deliberate assessment/sign-in actions without repeating portal shortcuts in the header or footer.
- Keep landing calls to action fully rounded and preserve the light-green-primary pastel system.
- Keep the public hero close beneath the header, use the supplied `landing-image-bg.png`, keep the hero artwork static, and vary restrained reveal transitions with complete reduced-motion support.
- Preserve the public header's scroll-to-floating transition; keep its initial mobile state flush with the viewport, use a separately animated overlay burger menu without a mobile header assessment action, show the PNG-led RIASEC set in two columns below `lg`, and close the page with the bounded dark-green footer whose compact information row sits above the oversized bold `TCCHOICE` text wordmark approved on 2026-11-17.
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
- **Progress / sprint: IN PROGRESS for skipped-question recovery on 2026-11-16.** Auto-advance now permits only one pending transition, preventing rapid answer taps from jumping over multiple questions. A compact alert exposes unanswered question numbers behind the current position, and final submission routes the Student to the first missing answer. Focused component tests pass; rendered desktop/mobile, keyboard, overflow, and console validation remain pending.
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
- Present all 120 valid ordered Student result codes through `PSG-PROFILE-NAMES-2026-09-21-V2`: preserve the 11 repository-owner-approved PSG-matrix presentation overrides and derive unique two-word names and two-sentence descriptions for the other 109 combinations. Keep this presentation layer separate from scoring and programme classification, and never present the names as personality diagnoses.
- Preserve completed attempt history and the recommendation snapshot generated for each attempt.
- Explain recommendations only from recorded scores and configured programme evidence.
- Show multiple catalogue career directions per recommended programme. Treat Administrator-selected ESCO occupations as versioned external enrichment, never as an independent Student-career score or employment prediction.
- Do not claim institutional or psychometric approval without evidence.

### Student journey

- **Progress / sprint: COMPLETED for the dedicated Administrator Feedback page on 2026-11-23.** Repository-owner direction separates Student recommendation feedback from System Reports. The new protected `/admin/feedback` destination and API publish programme-level interest-match averages and 1â€“5 distributions beginning with one saved response. Each Student contributes only their latest response per programme; nonblank comments are shown with programme, rating, and saved date, while Student names and account identifiers stay out of the response. Reports remains limited to assessment and engagement metrics. Focused backend/frontend validation, formatting, architecture, production build, and desktop/mobile browser evidence are recorded in the dated implementation note.
- **Progress / sprint: COMPLETED for private per-programme recommendation feedback on 2026-11-23.** Every ranked programme row now exposes an accessible 1â€“5-star interest-match control that asks **How well does this recommendation match your interests?**, gives each star a match-level accessible name without a separate visible scale-label line, and keeps the optional comment editor on demand. Laravel enforces ownership, programme membership, rating range, comment length, and one editable response per Student/run/programme while keeping the recommendation snapshot immutable. Focused backend/frontend tests, formatting, changed-file lint, architecture, production build, and desktop/mobile Playwright validation pass. The owner-approved Administrator aggregate from the first response is tracked separately; public ratings, research export, moderation, and automatic ranking changes remain deferred.
- **Progress / sprint: COMPLETED for expandable programme-match explanations on 2026-11-23.** The detailed **Why this fits you** section now keeps every configured programme RIASEC area collapsed by default. Each keyboard-operable disclosure shows the exact recorded score and expands to explain the assessment count, the stored versioned area guidance, and why that area contributes to the selected programme match. Focused component, changed-file lint, architecture, production-build, and desktop/mobile browser validation pass, including keyboard activation, overflow, console, and rendered contrast checks.
- **Progress / sprint: COMPLETED for recommendation-result explanation hierarchy on 2026-11-22, browser-revalidated on 2026-11-23.** **Why it fits you** now labels the existing RIASEC profile explanation instead of a career-catalogue disclaimer, and the former disclaimer block is removed from **Recommended career paths**. Focused component, changed-file lint, architecture, production-build, and desktop/mobile browser validation pass.
- **Progress / sprint: IN PROGRESS for the application recovery open-canvas presentation on 2026-11-18.** The shared unexpected-error screen no longer places its illustration, copy, reference, and actions inside an outer background card. Recovery behavior, focus management, responsive spacing, and Student/Administrator dashboard routing remain unchanged. The focused component suite, changed-file lint, architecture check, and production build pass; rendered desktop/mobile, keyboard-focus, overflow, console, and contrast review remain pending because browser access was unavailable.
- **Progress / sprint: IN PROGRESS for public landing mobile guidance presentation on 2026-11-17.** The What We Provide section now renders statically instead of reserving a blank mobile region while waiting for its scroll-reveal observer, and its former cards use the repository-owner-supplied compass, clipboard, chart, and document PNGs in the same open, image-led pattern as RIASEC. Focused component, lint, architecture, build, and mobile browser validation pass; final keyboard and contrast review remains pending.
- **Progress / sprint: IN PROGRESS for the public landing ready CTA on 2026-11-17.** The former rounded image-balanced banner no longer shows the two-Student avatar artwork. It now uses a centered, full-width pale-green guidance band with the existing sign-in and registration actions. Focused component, lint, architecture, build, and desktop/mobile browser validation pass; final keyboard and contrast review remains pending.
- **Progress / sprint: IN PROGRESS for the public landing footer wordmark on 2026-11-17.** The former giant low-opacity logo watermark is replaced by an oversized, bold native-text `TCCHOICE` wordmark beneath the compact factual footer columns. Focused component, lint, architecture, build, and desktop/mobile browser validation pass; final keyboard-focus and complete-page contrast review remain pending.
- **Progress / sprint: IN PROGRESS for differentiated public landing motion, performance-refined on 2026-11-18.** Home, What We Provide, How It Works, RIASEC, and FAQ retain distinct rise/scale, alternating rotation, opposing lateral entry, fan, and cascade treatments, now using transform-only 420–540ms transitions and 30–155ms staggers. Blur, filter, clip-path, persistent `will-change`, nested PNG entrance transforms, long travel distances, and section-wide opacity fades are removed to reduce mobile rendering cost. Focused component, ESLint, architecture, production build, desktop/mobile Chrome choreography, transform-only implementation, reduced-motion, and horizontal-overflow checks pass; final keyboard-focus and complete-page contrast review remain pending.
- **Progress / sprint: IN PROGRESS for Student sign-in subtitle alignment on 2026-11-16.** The public Student sign-in modal now uses the single centered supporting line `Sign in to access your`; the former `assessment & recommendations.` line is removed by repository-owner direction. Focused component validation passes; rendered desktop/mobile review remains pending.
- Keep assessment, result, history, programme exploration, saved programmes, and profile actions accessible on desktop and mobile.
- **Progress / sprint: IMPLEMENTED with browser validation for the shared assessment result card on 2026-11-16.** Student and Administrator dialogs now scroll within the viewport, expose the same clearer recorded-result layout, and download the complete card as a high-resolution PNG instead of opening a PDF/print flow. The separate interpretation and version-details panel is intentionally omitted by repository-owner direction.
- **Progress / sprint: IN PROGRESS for protected Student browser history on 2026-11-04.** Route My Matches, Explore Programs, My Profile, and History through protected Student URLs so browser Back returns to the preceding Student section without ending the session. Google authorization now runs separately and returns through a flow-scoped same-origin completion channel, keeping provider pages out of the main tab's history without `window.closed` polling. Focused frontend and backend tests, lint, architecture, build, and desktop/mobile Student-route assertions pass; a clean browser-runner exit and live Google-provider check remain pending.
- Keep My Matches, Explore Programs, and My Profile loading skeletons aligned with the final page geometry across desktop and mobile, including restoration of the matching loader after a page refresh.
- **Progress / sprint: IMPLEMENTED with automated validation for Student profile simplification on 2026-11-16; clean Playwright exit remains pending.** The optional LRN contract is replaced by a required unique eight-digit ID number across Student and Administrator views. The separate Learning Profile & Strengths step, its API payload/response fields, stored strengths/growth/preferences, derived summary, and active schema columns are removed. The local MySQL migration was applied only after an encrypted backup passed restore verification. Historical assessment and recommendation evidence is unchanged. See the dated implementation record for migration and validation boundaries.
- **Progress / sprint: IN PROGRESS for editable Student account names on 2026-11-16.** Authenticated Students, including Google-created accounts, can edit required first and last names in My Profile. Laravel validates and atomically synchronizes the split names, compatibility display name, and profile details, while the frontend refreshes authenticated shell identity after saving. Email remains read-only and historical completed-result evidence is not rewritten. Backend, focused component, architecture, build, and desktop/mobile Playwright evidence pass; manual keyboard-focus, console, and rendered-contrast review remains pending.
- **Progress / sprint: IN PROGRESS for shared toast feedback and Student header identity on 2026-11-16.** Profile and photo success feedback now use the same reusable application toast contract as Administrator actions and result-card sharing/download feedback. The toast keeps a light project surface across workspace themes. The former inline profile success banner is removed, the current Student name appears beside the header profile control and refreshes after saving, and desktop profile spacing keeps the complete editor card within the standard 1440 by 900 review viewport. Focused component and desktop/mobile browser evidence are recorded in the dated implementation note; manual rendered review remains pending.
- Keep the Student Personal & Academic editor balanced across both desktop columns while preserving one logical, overflow-free mobile sequence.
- Open a selected recommendation's programme detail at the top of the document instead of retaining the ranked-list scroll position.
- Prefer persistent result and history actions over redundant completed-state cards.
- Use authenticated profile data and truthful empty, loading, processing, and failure states.
- Present the top three ranked programme matches with compact descending-width pastel fields and an exact recorded-match rail; keep later ranks plain and move detailed RIASEC evidence to the programme detail flow.
- **Progress / sprint: IN PROGRESS for dense programme tie ranks on 2026-11-16.** Exact programme matches share one displayed rank and the next distinct match uses the next consecutive position (`1, 2, 3, 3, 4`). New recommendation snapshots store dense ranks under `PROPOSED-RIASEC-5-DENSE-RANKS`; existing immutable snapshots retain their data and receive the same display convention through the Student and Administrator API presenters. Focused automated validation is recorded in the dated implementation note; rendered desktop/mobile review remains pending.

### Administrator governance

- **Progress / sprint: IN PROGRESS for selected recommendation programme routing on 2026-11-17.** Each curriculum-review action in an Administrator Student evidence record now preserves its programme identifier, routes to that exact Programme monitoring record, and opens the selected detail sheet instead of stopping at the general catalogue. Focused component and desktop/mobile browser evidence are recorded in the dated implementation note; final manual rendered review remains pending.

- Keep Students and assessment monitoring consolidated in one protected record workflow.
- Use the authoritative entrance declaration, current assessment lifecycle, recommendation availability, and saved-programme counts in the server-paginated Student directory.
- Preserve each attempt and its versioned evidence in the authoritative records. The separate Assessment history and evidence section is removed from Administrator Student detail by owner request on 2026-09-07.
- Structure Student detail as one résumé-style profile and assessment surface followed by ranked programme recommendations. The separate Assessment context surface was removed by owner request on 2026-09-07.
- Use the same shared, scrollable assessment result card as the Student flow; do not maintain a separate Administrator card or export format.
- Keep the dashboard operational: show the Student funnel and actionable failure, source-review, and draft queues instead of decorative or inferred readiness metrics.
- Keep the redesigned dashboard palette tied to meaning: green for the primary journey, violet for assessment records, yellow for available results, and pink for recommendation runs. Preserve the joined data-strip and exact stage-flow treatment without adding fabricated indicators.
- Read programme eligibility only from the versioned backend catalogue; never infer board or non-board classification in the browser.
- Support versioned programme drafts, locked API-controlled facts, source review, preview, publication, and audit history.
- Support authenticated, rate-limited ESCO occupation search in Laravel and require deliberate Administrator selection plus catalogue publication before an ESCO reference appears to Students.
- Keep reports aggregate and privacy-aware across entrance declarations, eligibility, assessment lifecycle, recommendations, saves, and catalogue governance; identifiable exports remain disabled.
- Filter audit records by individual Administrator, action, record type, and date, and expose safe version/change summaries without unrestricted metadata.

### Authentication and authorization

- Maintain dedicated Student and Administrator portal URLs without role selection.
- Keep browser navigation separate from authentication state: Student Back/Forward navigation must not call logout, and session termination remains an explicit Sign out action or a server-authoritative expiry/revocation.
- Keep third-party OAuth pages outside the main application tab's browser history. Match popup completion to the session-bound flow and portal before restoring the protected route.
- Keep Google Student self-onboarding role-safe. Administrator Google sign-in is limited to a matching, already-provisioned active Administrator account; it must never create an Administrator or grant that role. Always request Google's account chooser so a rejected browser account can be changed on retry.
- **Progress / sprint: IN PROGRESS for split-name registration and email ownership verification on 2026-11-16.** Local Student registration stores first and last names separately, sends a signed verification link, provides non-enumerating resend, and blocks unverified login and protected APIs. The verification message now uses the provisional green-neutral product direction, personalized ownership copy, an accessible primary action, a security/expiry notice, a visible fallback URL, and a plain-text alternative instead of Laravel's default branding. Focused backend/frontend tests and the production frontend build pass; rendered mail-client coverage and live SMTP delivery evidence remain pending.
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
- The current 42-statement binary instrument has seven questions in each RIASEC category and uses the matching 0-7 normalization range. New runs apply the researcher-proposed ordered programme-profile weights 50% / 30% / 20%; this methodology remains PROPOSED pending external review. Equal Student dimension scores use competition ranks with deterministic source order. Exact programme percentages use dense ranks with alphabetical display fallback inside a tie. Community Development remains unclassified.
- SHS school, strand/track, graduation-year, recommended-strand, and strand-guidance fields have been removed from active Student and Administrator workflows and contracts. Existing assessment and recommendation snapshots remain immutable.
- The local development database was reset to the approved four-migration baseline on 2026-09-16 after an encrypted backup passed restore verification. Any future non-local baseline adoption still requires an environment-specific verified backup and rollback plan.
- The local `db_psychometric` database was reset again on 2026-09-18 for start-to-finish retesting. A new encrypted backup passed restore verification before deletion; the four migrations, two roles, local sign-in seeds, and PSGC locations were restored. See [reset record](docs/note/2026-09-18-local-database-reset.md). Any non-local reset still requires its own authorization, verified backup, and rollback plan.
- Browser-rendered evidence must be recorded independently of unit tests and builds.


## Philippine location selection ? 2026-09-07

**Decision: APPROVED** by the repository owner: use PSGC Cloud v2 as the location source, sync into MySQL, expose Laravel-only location APIs, and replace the existing profile address-name inputs with cascading selections. No recommendation or admission behavior changes.

**Progress / sprint: COMPLETED.** Schema, atomic sync, cached read API, hierarchy validation, profile selection, and the initial live MySQL catalogue import are implemented. Automated and browser location checks passed. See [implementation record](docs/note/2026-09-07-psgc-locations.md) for final validation evidence and changed files.

**Backlog:** Keep the documented region-scoped barangay sync because the global v2 endpoint silently caps results at 100 and ignores the tested pagination parameters. Monitor PSGC Cloud for correction of its NCR/Sarangani labels; the guarded normalization can be removed after the upstream hierarchy is consistent. Resolve the independent existing theme-test mismatch separately from this feature.
