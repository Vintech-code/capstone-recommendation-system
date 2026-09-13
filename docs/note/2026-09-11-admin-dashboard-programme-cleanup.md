# Administrator dashboard and programme-media cleanup

**Status:** COMPLETED  
**Recorded:** 2026-09-11  
**Scope:** Administrator overview and programme monitoring presentation

## Decision

The Administrator overview removes the duplicate **Open student directory** header action and the **Needs attention** total. The fourth total now uses the existing authoritative `recommendations` count and is labelled **Recommendation runs**; no new metric or backend rule is introduced.

Programme monitoring cards and the programme detail sheet show their recorded or fallback cover images without a colored gradient overlay. Programme content, images, filters, editing, publishing, and source status remain unchanged.

## Admin implementation audit

The current Admin routes cover Dashboard, Students, Programmes, Reports, and Activity. The following gaps remain outside this visual slice:

1. **PROPOSED — Operational follow-up:** failed result records are discoverable through the Student ledger, but there is no Admin-owned retry or resolution workflow. Any Admin recovery action requires an approved authorization and audit policy because the existing retry endpoint is Student-owned.
2. **PROPOSED — Programme source-review UI:** Laravel exposes source-registry review data and verification endpoints, but the current Admin frontend does not provide the source-review queue or verification controls.
3. **PROPOSED — Audit completeness:** Laravel accepts a record-type filter and returns safe event summaries, subject types, and references. The Activity frontend currently exposes only Administrator, action, and date filters and renders only action, actor, and date.
4. **PROPOSED — Administrator account governance:** individual Admin accounts can be created locally and server middleware enforces active status, but no Admin account-management screen exists for authorized provisioning, suspension, or session review.
5. **DEFERRED — Strong Admin authentication:** MFA or passkeys are not implemented. This should be completed before a production-security claim.
6. **IN PROGRESS — Release evidence:** several broader visual-system notes still record incomplete route-by-route keyboard, zoom, reduced-motion, and rendered-contrast evidence. These should be closed before deployment readiness is claimed.

## Validation

- Focused Administrator Vitest suite: 8 tests passed.
- Targeted ESLint for the changed Admin dashboard, programme screen, component test, and Playwright specification: passed.
- TypeScript and Vite production build: passed before unrelated concurrent authentication edits introduced new parse errors.
- Focused Playwright Chrome run: desktop and Pixel 7 cases both reported `ok` after asserting the removed dashboard content, replacement recommendation metric, absence of programme gradients, route overflow, serious/critical accessibility findings, and console errors. The known post-run shutdown hang required manual interruption after both cases passed.
- The in-app browser connection was unavailable. A later attempt to generate dedicated screenshots was blocked by unrelated syntax errors that appeared concurrently in `sign-in-form.tsx` and `student-auth-modal.tsx`; those user-owned files were not modified as part of this task.
- `git diff --check`: passed with existing line-ending conversion warnings only.
