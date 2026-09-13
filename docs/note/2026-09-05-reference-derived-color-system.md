# Reference-derived color system

**Status:** SUPERSEDED on 2026-09-07 by `2026-09-07-balanced-rgb-light-color-system.md`.  
**Recorded:** 2026-09-05.  
**Authority:** Repository owner request to replace the complete product palette using the supplied educational reference image.

## Decision

Replace the warm coastal Student/authentication palette and the separate black/neon Administrator palette with one original semantic system:

- navy `#123B5D` for primary text and structural emphasis;
- accessible teal `#087F6A` for primary controls, focus, progress, and active navigation;
- bright teal `#2DAF88` and fresh green `#65C96B` for decorative emphasis where contrast does not depend on white text;
- sky blue `#32759F` for information and analytical data;
- warm yellow `#F2C94C` for restrained attention accents;
- cool off-white `#F8FBF7`, white, mint, and soft green for canvases and surfaces.

The palette adapts color relationships from the supplied reference without copying its logo, product identity, characters, wording, or artwork. It is not official Tagoloan Community College branding.

## Implementation boundary

- Student, authentication, and Administrator themes share the same semantic palette.
- The Administrator retains its approved white continuous canvas, divider-led hierarchy, and sidebar.
- RIASEC colors remain stable and distinct, and always appear with text labels and exact values.
- Google icon colors remain Google's recognizable provider colors and are not application theme tokens.
- Existing photographic and catalogue imagery is source content rather than interface chrome and is not recolored by the token migration.

## Validation boundary

Automated theme/component tests, lint, and the production build are required. The migration remains **IN PROGRESS** until desktop/mobile browser checks confirm rendered contrast, focus, overflow, zoom, reduced motion, and consistency across Student, authentication, and Administrator routes.

## Validation evidence

- Focused theme tests passed: 3 of 3, including WCAG AA contrast assertions for core text and solid semantic controls.
- Focused theme and Student dashboard tests passed before the final metadata-only adjustment: 14 passed and 4 skipped.
- Frontend ESLint passed.
- TypeScript/Vite production build passed.
- The serial full frontend suite reached 108 passed and 4 skipped, with one unrelated authentication-route expectation still failing: the legacy `/admin/applicants` test expected `/admin/login` but the application redirected to `/admin/students`.
- Browser rendering remains unverified because the in-app browser was unavailable during this change.
