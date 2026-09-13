# Balanced RGB light color system

**Status:** SUPERSEDED by the 2026-09-11 minimalist clay green design system; retained as historical context.  
**Recorded:** 2026-09-07.  
**Authority:** Repository owner request to eliminate dark-looking colors and retain green, rather than blue, as the light primary.

## Decision

Replace dark navy, dark green, and saturated blue dominance with a pastel-balanced light system:

- warm off-white `#FFFEF9` and white for all large surfaces;
- neutral green-gray `#40534A` for readable text without near-black visual weight;
- clear light green `#51B885` for primary controls, progress, and active navigation;
- readable green ink `#3F7D57` for links and icons only, never large fills;
- softly saturated orange `#E9966A`, blue `#79B4DC`, pink `#D889AE`, green `#69B98A`, and yellow `#E2B34F` for RIASEC bars and charts.

Dark navy, dark green, black, and near-black are not permitted as page, sidebar, card, hero, or other large-area backgrounds. Deeper colors remain allowed for text, icons, accessible solid controls, and hover or pressed states where contrast requires them.

The palette is a provisional project presentation system, not official Tagoloan Community College branding.

## Implementation boundary

`DESIGN.md` version 3.3 is the current visual authority. The shared, Student, authentication, and Administrator CSS token scopes use the light-green-primary palette. Existing semantic utility names such as `brand-dark` and `chart-teal` remain temporarily for component compatibility, but their values now resolve to light fills.

The Explore Programmes cover retains its source photograph without the former green directional and bottom gradient overlays.

The recommendation result places career-path guidance in a full-width open-canvas section beneath the result profile. Opportunity rows use dividers and a light-green marker rather than an outer card or nested chips, so the content occupies the available desktop width and stacks without horizontal overflow on smaller screens.

## Validation boundary

Automated validation does not provide rendered UI evidence. The token migration requires focused WCAG contrast tests, frontend lint, the production build, and desktop/mobile browser checks before completion.

## Validation evidence

- Focused palette, programme-catalogue, and application-state tests passed: 16 of 16.
- Full frontend test suite passed: 114 passed and 4 skipped.
- Frontend ESLint passed.
- TypeScript/Vite production build passed.
- Desktop/mobile rendered verification remains unavailable because the in-app browser could not be started during this change.

### Career-path open-canvas follow-up

- Focused recommendation-result tests passed: 10 of 10.
- Frontend ESLint and the TypeScript/Vite production build passed.
- The concurrent full frontend run reported 113 passed, 4 skipped, and one authentication redirect timing failure. The affected authentication file then passed independently: 10 of 10. This layout change does not modify authentication code.
- Desktop/mobile rendered verification remains pending because the in-app browser was unavailable.
