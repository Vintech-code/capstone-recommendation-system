# Public landing mobile navigation and footer

**Status:** COMPLETED  
**Date:** 2026-09-12  
**Scope:** Public Student landing page only

## Approved change

- Removed the Student sign-in action from the public landing page.
- Kept the desktop Start assessment header action and the existing scroll-to-floating header transition, while replacing mobile header navigation with an accessible burger menu whose own transition overlays content without changing the hero position.
- Set the six PNG-led RIASEC items to two columns on phones and tablets and three columns from the large breakpoint.
- Reworked the public footer as the sole bounded dark `primary-ink` surface, using factual internal navigation, guidance boundaries, and the real TCCence logo as the oversized low-opacity watermark.
- Removed the institutional copyright and the former deterministic-guidance footer statement requested by the repository owner.
- Added transition-only opening behavior to the mobile navigation and FAQ disclosures, with reduced-motion handling retained.

## Evidence

- Focused landing component tests cover the removed sign-in action, mobile menu semantics, RIASEC grid classes, footer watermark, and removed footer copy.
- Public landing Playwright coverage checks desktop/mobile header behavior, overlay stability, two RIASEC columns, no horizontal overflow, footer content, FAQ/menu transitions, accessibility, and reduced motion.
- Frontend lint and production build are required before final handoff.

## Boundaries

- No authentication, assessment, recommendation, programme catalogue, or Laravel business behavior changed.
- The dark footer is a narrow public-page exception and does not introduce a dark application theme.
- No contact details, social links, legal links, or institutional claims were invented to imitate the supplied reference.
