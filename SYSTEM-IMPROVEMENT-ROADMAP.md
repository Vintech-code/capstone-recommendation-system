# System Improvement Roadmap

**Status:** UPDATED for the approved entrance-examination gate and visual-system replacement on 2026-08-28.

## Product roles

### Student Applicant

Students create and own their account, self-declare their entrance examination result, complete the locally stored RIASEC assessment, review immutable results, explore and save programmes, compare recommendations, manage their self-report profile, and make the final course decision.

### Administrator

Administrators govern programme content and media, review catalogue source evidence, monitor Student and assessment records, generate aggregate reports, and review audit activity. Administrators cannot rewrite completed assessment evidence or historical recommendations.

## Priority workstreams

### Warm coastal interface migration

- Treat `DESIGN.md` version 2.0 as the approved working visual specification and keep it clearly non-official as TCC branding.
- Migrate semantic tokens and shared primitives before feature screens; do not apply isolated page-specific restyles.
- Use the warm oat canvas, Nunito Sans headings, Montserrat body typography, deep-teal primary actions, restrained coral and earth-tone accents, and subtle bordered 20-28px surfaces.
- Preserve the current binary assessment contract. The illustrated two-activity, three-level rating pattern remains proposed and blocked until its instrument and scoring contract are approved.
- Replace photographic presentation assets with original or properly licensed flat educational illustrations in separately tested screen slices.
- Keep the interface light-only and retire existing dark-theme presentation only through a reviewed implementation change.
- Keep application shells free of a repeated global footer so page content and primary actions remain focused.
- Require component/accessibility tests, lint, build, and real-browser desktop/mobile evidence for each migrated slice.

### Local assessment and explainable recommendations

- Require the Student Applicant's self-declared entrance examination result before an assessment starts or continues.
- Under `SELF-DECLARED-TCC-ENTRANCE-2026-01`, route 1.0-2.5 to the board-programme group and 2.6-5.0 to the non-board-programme group before RIASEC ranking.
- Snapshot the declaration and rule with each assessment and recommendation; an attached declaration is immutable.
- Keep the questionnaire, scoring inputs, rule versions, and programme profiles locally controlled and versioned.
- Preserve completed attempt history and the recommendation snapshot generated for each attempt.
- Explain recommendations only from recorded scores and configured programme evidence.
- Do not claim institutional or psychometric approval without evidence.

### Student journey

- Keep assessment, result, history, programme exploration, saved programmes, and profile actions accessible on desktop and mobile.
- Prefer persistent result and history actions over redundant completed-state cards.
- Use authenticated profile data and truthful empty, loading, processing, and failure states.

### Administrator governance

- Keep Students and assessment monitoring consolidated in one protected record workflow.
- Use the authoritative entrance declaration, current assessment lifecycle, recommendation availability, and saved-programme counts in the server-paginated Student directory.
- Present each attempt as immutable evidence with its entrance rule, instrument, raw RIASEC scores, catalogue and recommendation versions, ranked snapshot, and processing or retake context.
- Keep the dashboard operational: show the Student funnel and actionable failure, source-review, and draft queues instead of decorative or inferred readiness metrics.
- Read programme eligibility only from the versioned backend catalogue; never infer board or non-board classification in the browser.
- Support versioned programme drafts, locked API-controlled facts, source review, preview, publication, and audit history.
- Keep reports aggregate and privacy-aware across entrance declarations, eligibility, assessment lifecycle, recommendations, saves, and catalogue governance; identifiable exports remain disabled.
- Filter audit records by individual Administrator, action, record type, and date, and expose safe version/change summaries without unrestricted metadata.

### Authentication and authorization

- Maintain dedicated Student and Administrator portal URLs without role selection.
- Keep Google sign-in Student-only during development and testing.
- Require individual Administrator accounts and enforce role checks, suspension, session revocation, and ownership on the server.

### Quality and release evidence

- Run Laravel tests and formatting after backend changes.
- Run frontend lint, tests, and production build after UI or contract changes.
- Perform real-browser desktop/mobile, keyboard, overflow, console, and contrast checks separately from automated validation.
- Keep ERD, routes, schema, tests, and current documentation synchronized.

## Current risks

- Institutional adoption remains gated by external approval of proposed questionnaire and programme-matching defaults.
- The current 42-statement binary instrument has unequal RIASEC category counts while the catalogue still uses the legacy 5-25 normalization range. Match percentages remain PROVISIONAL until a versioned normalization and tie policy is approved and implemented.
- Removing legacy workflow tables deletes their stored records; production execution requires a verified backup and rollback plan.
- Browser-rendered evidence must be recorded independently of unit tests and builds.
