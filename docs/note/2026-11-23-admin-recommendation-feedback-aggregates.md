# Administrator recommendation-feedback page

**Status:** IN PROGRESS for the owner-approved anonymous respondent table; clean browser-runner exit remains pending.
**Date:** 2026-11-24.
**Owner:** Administrator reporting and Recommendation domains.

## Approved rule

The repository owner initially approved a five-Student publication minimum, then explicitly replaced it on 2026-11-23 with first-response visibility: feedback appears as soon as one Student response exists. For Students with feedback across multiple recommendation runs, only their latest response for that programme contributes. This prevents retakes from giving one Student additional weight.

The selected dates apply to each feedback record's latest saved date. The repository owner explicitly required submitted comments to be visible to Administrators and, on 2026-11-24, required the page to group each Student's programme responses into a numbered anonymous row whose complete feedback can be opened. The owner then approved showing every programme from each relevant recorded recommendation result—not only programmes that received feedback. The Admin contract and interface still exclude the Student's name, email, Student ID, account identifier, recommendation-run ID, and assessment reference.

## Implemented presentation

Student feedback does not appear inside **System reports**. The protected `/admin/feedback` route has its own **Feedback** navigation item, date filter, loading/error flow, and open-canvas **Feedback respondents** section. It shows compact response totals and a semantic table with one current-view numbered **Anonymous respondent** row per Student.

Selecting **View feedback** opens a right-side sheet grouped by relevant recorded result. Each group lists every programme from the immutable recommendation snapshot with its stored dense display rank and exact match. The latest published rating and optional comment appear beside the matching programme; programmes without published feedback remain visible with an explicit **No feedback submitted** state. Rating-only entries use a separate **No comment submitted** state. The table remains available when only one response exists.

**System reports** remains focused on assessment, recommendation-run, and programme-save activity. Feedback copy describes perceived interest match; it does not claim outcome validation, predict success, expose public ratings, or automatically modify recommendation scores, weights, or ranks.

## Contract and privacy boundaries

- Laravel exposes feedback through protected `GET /api/v1/admin/feedback`. The `respondents` collection groups latest programme responses by the internal owner only long enough to create a temporary sequence number and never serializes that owner key.
- One latest response per Student/programme is included, even when the Student has multiple recommendation runs.
- One saved Student response is sufficient to publish a row.
- Anonymous numbers are regenerated for the current filtered result and are not Student numbers, stable pseudonyms, or account identifiers.
- Result-set numbers are also presentation-only. The API does not return recommendation-run IDs or assessment references.
- Complete rankings come directly from stored immutable `ranked_courses` evidence and are presented through the existing dense-rank presenter; the feedback service does not recalculate matches or rewrite ranks.
- Because a Student may type identifying details into free text, the Student form warns against personal information and the Admin detail sheet marks comments for authorized review only.
- Existing programme aggregates and flat nonblank comments remain in the response for compatible aggregate consumers; the Admin page uses the grouped respondent view.
- Research export, public ratings, moderation, and automatic recommendation tuning remain **DEFERRED**.

## Validation evidence

- Focused Admin backend tests passed: 5 tests and 93 assertions cover the dedicated endpoint, first-response publication, truthful no-feedback state, latest-response de-duplication, anonymous respondent grouping, complete immutable ranking rows, exact stored matches, unrated programmes, nullable comments, authorization, and absence of Student names, emails, and owner keys.
- The updated focused Admin workspace test now covers complete ranking, exact matches, rated/commented, rated/no-comment, and unrated programme states. Its current Vitest run is **BLOCKED** before test import because the fork worker times out during startup; no frontend assertion executed in that attempt.
- Focused Pint, changed-file ESLint, frontend architecture validation, and the production build passed.
- The focused Playwright case reported passing assertions in desktop and mobile Chrome for the anonymous table, detail sheet, two programme entries, comment and no-comment states, horizontal containment, detail-sheet WCAG checks, and console errors. Both captures were visually reviewed. The runner retained its known clean-exit hang after both passes and was manually terminated, so this slice remains **IN PROGRESS**.
- The complete backend suite and full frontend lint were not rerun for this slice. The last full frontend lint retained pre-existing Fast Refresh violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`.
- The older broad Admin Playwright scenario remains blocked before reaching Reports by its unrelated stale **Journey stage detail** dashboard expectation.
