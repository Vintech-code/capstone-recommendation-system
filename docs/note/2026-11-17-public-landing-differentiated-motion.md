# Public landing differentiated motion

**Status:** IN PROGRESS  
**Date:** 2026-11-17  
**Scope:** Public Student landing page from Home through FAQ

**Superseded motion timing:** The 700–940ms filter/clip implementation recorded below was performance-refined by [the 2026-11-18 transform-only revision](2026-11-18-public-landing-motion-performance.md). Preserve this note as historical evidence, not as the current motion specification.

## Approved change

The five public landing sections now use distinct, slower, one-time child choreography instead of sharing the same opacity fade:

- Home: vertical heading clip followed by copy, action, and PNG rise/pop, 700ms.
- What We Provide: horizontal heading opening plus alternating rotation and scale for each PNG-led item, 760ms.
- How It Works: PNG entry from the left while the text panel and numbered steps arrive from the right, 820ms.
- RIASEC: soft-focus heading settle plus a staggered six-item PNG fan, 880ms.
- FAQ: cascading question rows from the left with a separate PNG entry from the right, 940ms.

Each observer stops after its first successful reveal so scrolling does not repeatedly hide and replay content. Section-wide opacity fades and the former shared `.landing-stagger` fade are removed. Content remains in normal document flow before its observer fires, preventing recurrence of the previously recorded blank mobile region. Reduced-motion mode removes transforms, clipping, filters, and transition duration.

No continuous decorative animation was added. Authentication, assessment, recommendation, programme catalogue, and Laravel behavior are unchanged.

## Validation evidence

- Focused landing component coverage verifies the five ordered semantic variants, duration and non-fade mappings, removal of the old shared stagger, and PNG motion hooks.
- Focused ESLint passed for the landing page, extracted reveal component, component test, and public landing Playwright specification.
- Frontend architecture validation passed after the reveal behavior was extracted to its focused feature component.
- The TypeScript and Vite production build passed.
- Desktop and mobile Chrome Playwright scenarios verify all five semantic choreography variants, the 700–940ms duration mapping, non-fading content, 13 artwork motion hooks, removal of the former shared stagger, and zero horizontal overflow.
- Desktop and mobile Chrome reduced-motion scenarios verify `0s` duration, no transform, no clipping, and full opacity for animated children.
- A live Brave source review confirmed the refreshed landing page renders after the choreography revision; the automated browser scenarios provide the repeatable interaction evidence.

## Remaining review

Final keyboard-focus and complete-page rendered contrast review remain pending, so this landing-page slice remains IN PROGRESS rather than COMPLETED.
