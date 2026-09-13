# Landing hero and motion refinement

**Status:** COMPLETED  
**Recorded:** 2026-09-11  
**Scope:** Public landing page presentation

## Decision

The public hero begins directly beneath the sticky header with compact top spacing and uses the supplied `assets/images/landing-image-bg.png` as its full-width background. The existing `landing-image-home.png` remains the informative foreground illustration.

The header keeps section navigation and one **Start assessment** action. Separate Student and Administrator portal shortcuts are removed. The footer's former **Access Portals** column is replaced by factual guidance principles; sign-in and registration remain available through the page's deliberate primary actions.

Landing motion uses one reusable reveal component with restrained up, left, right, and scale variants plus short staggered transitions for groups of no more than six items. The background and `landing-image-home.png` remain static with no floating or continuous animation. All new transitions are disabled under `prefers-reduced-motion: reduce` and never delay access to content.

## Boundaries

This change does not alter authentication routes, assessment behavior, RIASEC scoring, recommendation policy, or Administrator authorization.

## Validation

- Landing component tests: 2 passed.
- Frontend ESLint: passed.
- TypeScript and Vite production build: passed.
- Playwright desktop and mobile compact-layout checks: passed, including background rendering, header/footer content, horizontal overflow, serious/critical WCAG findings, console errors, static hero artwork, and the presence of multiple transition variants.
- Playwright desktop and mobile reduced-motion checks: passed.
- Generated desktop and mobile hero screenshots: visually reviewed and passed.

The in-app browser was unavailable, so rendered evidence was collected with the repository Playwright projects.
