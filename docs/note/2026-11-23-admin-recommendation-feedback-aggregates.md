# Administrator recommendation-feedback page

**Status:** IN PROGRESS for the owner-approved dedicated Feedback page.  
**Date:** 2026-11-23.  
**Owner:** Administrator reporting and Recommendation domains.

## Approved rule

The repository owner initially approved a five-Student publication minimum, then explicitly replaced it on 2026-11-23 with first-response visibility: a programme-level aggregate appears as soon as one Student response exists. For Students with feedback across multiple recommendation runs, only their latest response for that programme contributes to the aggregate. This prevents retakes from giving one Student additional weight.

The selected report dates apply to the feedback's latest saved date. The report returns respondent counts, averages, and distributions from the first response onward. The repository owner then explicitly required submitted comments to be visible to Administrators. Each nonblank latest comment is therefore returned with its programme, rating, and saved date, but without the Student's name, email, ID, or account identifier.

## Implemented presentation

The repository owner subsequently directed that Student feedback must not remain inside **System reports**. The protected `/admin/feedback` route now has its own **Feedback** navigation item, date filter, loading/error flow, and open-canvas **Recommendation interest-match feedback** section. It shows response and respondent totals, the number of programmes with feedback, and one divided row per programme with the distinct respondent count, one-decimal average, and exact 1â€“5 distribution. A separate divided **Student comments** subsection shows every nonblank latest comment with programme, rating, and saved date. It remains visible even when only one response exists.

**System reports** remains focused on assessment, recommendation-run, and programme-save activity and no longer receives or renders recommendation feedback.

The copy describes the measure as perceived interest match. It does not call the aggregate model validation, predict Student success, expose public ratings, or automatically modify recommendation scores, weights, or ranks.

## Contract and privacy boundaries

- Laravel exposes feedback through the dedicated protected `GET /api/v1/admin/feedback` contract and returns nonblank comment text without any Student identifier. `GET /api/v1/admin/reports` no longer contains feedback.
- One latest response per Student/programme is included, even when the Student has multiple recommendation runs.
- One saved Student response is sufficient to publish a programme row.
- Because a Student may type identifying details into free text, the Student form warns against personal information and the Admin report marks comments for authorized review only.
- Research export, public ratings, moderation, and automatic recommendation tuning remain **DEFERRED**.

## Validation evidence

- Focused Admin backend tests passed: 5 tests and 69 assertions cover the dedicated endpoint, first-response publication, truthful no-feedback state, latest-response de-duplication, rating distributions, visible latest comments, report-payload separation, authorization, and absence of Student identifiers.
- The complete backend suite passed: 143 tests and 1,265 assertions.
- Focused Admin workspace and access-route tests passed: 17 tests cover the separate Feedback route and navigation item, the absence of feedback from Reports, visible aggregate and comment content, and protected Admin workspace access.
- Changed-file ESLint, focused Pint formatting, frontend architecture validation, and the production build passed.
- The focused Playwright case passed separately in desktop and mobile Chrome with assertions for the dedicated page, comment content, first-response visibility, privacy copy, horizontal containment, feature-section WCAG checks, and console errors. Focused desktop and mobile captures were visually reviewed.
- The full frontend lint command retains the pre-existing Fast Refresh violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`; changed-file lint passes.
- The full frontend lint command remains blocked by the pre-existing Fast Refresh violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`; changed-file lint passes.
- The older broad Admin Playwright scenario remains blocked before reaching Reports by its unrelated stale **Journey stage detail** dashboard expectation.
