# Public landing ready CTA redesign

**Status:** IN PROGRESS  
**Date:** 2026-11-17  
**Scope:** Public Student landing page only

## Approved change

The closing **When you are ready** call to action removes the two-Student avatar artwork and the former rounded, image-balanced banner. It now uses a centered, full-width pale-green guidance band with a restrained overline divider, one concise heading, factual supporting copy, and the existing **Start assessment** and **Get started now** actions.

The actions retain their real Student sign-in and registration modal behavior. On mobile, both actions use the available width; from the small breakpoint they return to a compact centered row.

No authentication, assessment, recommendation, programme catalogue, or Laravel behavior changed.

## Validation evidence

- Focused landing component coverage passed: 2 tests, including the image-free CTA boundary and retained heading.
- Focused ESLint passed for the landing component, its component test, and the public landing Playwright specification.
- Frontend architecture validation passed.
- The TypeScript and Vite production build passed.
- The dedicated CTA Playwright scenario passed in desktop and mobile Chrome: 2 tests. It confirmed that the avatar is absent, both real actions remain visible, and no horizontal overflow is introduced.
- Captured desktop and mobile CTA screenshots were visually reviewed; the centered hierarchy, responsive action layout, section spacing, and image-free composition matched the requested direction.

## Remaining review

Final manual keyboard-focus and rendered-contrast review remains pending. The existing white-on-primary action contrast issue is tracked independently from this image-removal and layout slice.
