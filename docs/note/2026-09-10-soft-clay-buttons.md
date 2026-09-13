# Soft-clay shared buttons — 2026-09-10

**Decision: SUPERSEDED** by the 2026-09-11 minimalist clay system, which limits all elevation to `shadow-sm`.

**Scope:** Apply a restrained claymorphism treatment to the shared button primitive without changing button labels, actions, routing, authorization, or application data.

## Implementation

- Solid, outlined, and secondary buttons use a paired inset highlight and diffuse lower shadow.
- Hover raises the control by no more than 2px; active state visually compresses it with a shallow inset shadow.
- Disabled controls remove elevation. Reduced-motion preferences remove transforms and transitions.
- Ghost and link variants remain flat to preserve action hierarchy.
- The treatment uses semantic CSS shadow tokens and the shared button variants rather than page-specific styles.

## Status

**IN PROGRESS.** The focused button test, frontend lint, and production build pass. The complete frontend suite reports four existing failures in theme-token, Admin assessment-reference, and dashboard-radius expectation checks outside this button slice. The in-app browser was unavailable, so desktop and mobile review for focus visibility, contrast, overflow, pressed feedback, and reduced motion remains pending.
