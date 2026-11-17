# Public landing motion performance refinement

**Status:** IN PROGRESS  
**Date:** 2026-11-18  
**Scope:** Public Student landing page from Home through FAQ

## Approved change

The distinct section choreography is retained, but its implementation is reduced to compositor-friendly transforms:

- Home: 420ms.
- What We Provide: 460ms.
- How It Works: 500ms.
- RIASEC: 540ms.
- FAQ: 480ms.

Blur, CSS filters, clip-path animation, persistent `will-change`, nested PNG entrance transforms, and long travel distances are removed. Stagger delays now range from 30ms to 155ms. Section-wide opacity fades remain removed, and the content continues to occupy normal document flow before each observer fires.

Authentication, assessment, recommendation, programme catalogue, and Laravel behavior are unchanged.

## Validation evidence

- Focused landing component tests pass: 2 tests.
- Focused ESLint and frontend architecture checks pass.
- The TypeScript and Vite production build passes.
- Desktop and mobile Chrome scenarios verify all five 420–540ms mappings, transform-only child transitions, non-fading content, reduced-motion behavior, and zero horizontal overflow.
- Final keyboard-focus and complete-page contrast review remain pending before the overall landing slice can be marked COMPLETED.
