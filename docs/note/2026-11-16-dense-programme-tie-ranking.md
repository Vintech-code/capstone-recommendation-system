# Dense programme tie ranking

**Date:** 2026-11-16  
**Implementation status:** IN PROGRESS pending rendered browser review  
**Methodology status:** PROPOSED; external review of the weighted recommendation method remains pending  
**Repository-owner direction:** Exact programme ties share a rank, and the next distinct match uses the next consecutive rank instead of skipping positions.

## Decision

- Use dense ranks for programme recommendation matches. For example, two programmes tied at rank 3 are followed by rank 4: `1, 2, 3, 3, 4`.
- Continue to show the explicit `Tied at #n` label and exact recorded percentage for every tied programme.
- Keep alphabetical programme ordering only as the deterministic display fallback inside an exact tie.
- Record new recommendation runs under `PROPOSED-RIASEC-5-DENSE-RANKS`, preserving the proposed ordered 50% / 30% / 20% matching formula.
- Do not rewrite completed recommendation snapshots. Student and Administrator API presentation derives dense positions from each snapshot's stored rank groups, leaving the stored match evidence and historical rule reference unchanged.
- Keep the separate Student RIASEC-dimension tie convention unchanged; this decision applies only to programme recommendation positions.

## Implementation

- The Laravel recommendation engine now increments the rank only when it encounters the next distinct match group.
- A shared recommendation presenter converts legacy stored competition-rank groups to consecutive display positions for both Student and Administrator views.
- The catalogue tie policy, API contract, UI authority, requirements, roadmap, and regression expectations now describe dense programme ranks.

## Validation

- Focused Laravel unit tests cover new-run dense ranks and legacy snapshot presentation without mutation.
- The focused Laravel recommendation feature test covers the API rank immediately following a tied group.
- The focused frontend recommendation component test covers the next consecutive visible rank.
- Backend formatting, frontend lint, architecture validation, production build, and rendered desktop/mobile review are recorded separately after execution.

## Remaining evidence

- Real-browser desktop/mobile, keyboard-focus, overflow, console, and rendered-contrast review remains pending. The slice remains IN PROGRESS until that evidence is available.
