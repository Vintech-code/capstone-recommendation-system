# Public Student landing page

**Status:** APPROVED direction; implementation IN PROGRESS pending rendered browser evidence.
**Recorded:** 2026-09-06.
**Authority:** Repository owner request to restore a public landing page using the supplied `bg-landing.png` artwork and the current project palette.

## Decision

Supersede D-010's direct role-access entry. The root `/` route now presents one Student-oriented public introduction while `/student/login` and `/admin/login` remain separate portals without role selection.

The page adapts the supplied reference's broad educational pacing without replicating its identity or content. It includes:

- an original two-column hero with project copy and the supplied transparent artwork;
- full-pill primary and secondary Student actions;
- stable system highlights without fabricated time, price, validation, or privacy claims;
- neutral descriptions of the six RIASEC interest areas;
- the implemented account, entrance-declaration, assessment, and recommendation journey;
- evidence and guidance boundaries grounded in current project contracts;
- an accessible FAQ and a compact public portal-link footer.

The page must not describe a recommendation as an admission decision, diagnosis, guarantee, or promise of programme success. Its palette and product presentation remain provisional institutional identity.

## Validation boundary

Component/content tests, frontend lint, production build, and real-browser desktop/mobile checks are required. Keep this work **IN PROGRESS** until keyboard focus, anchor navigation, overflow, console output, rendered contrast, zoom, and reduced motion are verified in a browser.

## Validation evidence

- Landing-page content and route tests passed: 2 of 2.
- Full frontend suite passed serially: 112 passed and 4 skipped.
- Frontend ESLint passed.
- TypeScript/Vite production build passed.
- Rendered browser verification remains unavailable because the in-app browser could not be started during this change.
