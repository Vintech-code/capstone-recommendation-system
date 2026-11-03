# Ordered RIASEC weights and SHS removal

**Date:** 2026-11-03  
**Implementation status:** IN PROGRESS pending repair of unrelated pre-existing frontend baseline failures and external methodology review  
**Methodology status:** PROVISIONAL researcher-proposed default; not TCC-, adviser-, or psychometrician-approved  
**Scope status:** Repository-owner-directed for local implementation and evaluation

## Decisions

- Keep a deterministic, versioned, explainable rule engine.
- Treat each ordered programme profile as primary, secondary, and tertiary. New runs normalize each Student area to 0-100 and calculate `primary * 0.50 + secondary * 0.30 + tertiary * 0.20` under `PROPOSED-RIASEC-4-ORDERED-WEIGHTS`.
- The 50% / 30% / 20% values are a researcher-proposed default invented for local implementation because the adviser did not provide exact weights. They require external review before institutional adoption.
- Present equal Student RIASEC scores as shared competition ranks. Deterministic source order may organize tied entries, but the interface must not describe one tied area as strictly higher than another.
- Keep the self-declared entrance-examination board/non-board result as separate guidance. It does not alter the RIASEC match percentage or remove programmes from ranking.
- Remove SHS school, strand/track, graduation-year, recommended-strand, and strand-guidance fields from active Student and Administrator interfaces, API contracts, editable catalogue enrichment, and current guidance data.

## Historical-data boundary

Completed assessment results and recommendation snapshots remain immutable. Existing configuration payloads may retain historical keys in stored records, but active catalogue overlays ignore them and newly submitted configuration payloads strip them. A forward migration removes legacy SHS profile columns for upgraded installations.

## Formula example

For programme profile `I-R-C` with normalized Student scores `85.71`, `71.43`, and `71.43`:

`(85.71 * 0.50) + (71.43 * 0.30) + (71.43 * 0.20) = 78.57%`

## Validation

Evidence recorded on 2026-11-04:

- Backend: 132 tests passed with 1,146 assertions. The focused PHP formatting check passed.
- The forward migration was validated in pretend mode and emits one `student_profiles` alteration that drops the three legacy SHS columns; it was not applied to the developer's working database because that permanently deletes existing SHS values.
- Frontend affected area: 22 focused component tests passed. The production build and architecture check passed.
- Rendered browser: the Student profile SHS-removal workflow passed in desktop and mobile Chrome. The Administrator programme-governance and Student-detail workflows also passed in desktop and mobile Chrome (six focused Playwright checks total).
- The full frontend test run initially reported 147 passed, 4 skipped, and 6 failed. Three stale SHS expectations were corrected and their focused suite passed. Three unrelated baseline failures remain in theme-token and Administrator authentication-route tests.
- Full lint remains blocked by two existing React Fast Refresh export violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`; neither violation was introduced by this methodology slice.
- The in-app browser controller was unavailable, so rendered evidence used the repository's Playwright desktop/mobile projects.

The implementation therefore remains IN PROGRESS rather than COMPLETED. The proposed weights must also be reviewed before any claim of institutional or psychometric approval.
