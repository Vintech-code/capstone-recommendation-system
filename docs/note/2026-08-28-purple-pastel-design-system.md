# Purple and pastel interface design system

**Status:** SUPERSEDED on 2026-08-30 by the warm coastal palette recorded in `2026-08-30-warm-coastal-color-system.md`.  
**Recorded:** 2026-08-28.  
**Authority:** Repository owner request with attached visual references.

## Decision

Replace the former corporate blue-and-orange direction with `DESIGN.md` version 2.0: a light, spacious educational interface using bundled Manrope display typography with Inter body copy, a warm off-white canvas, purple primary actions, soft pastel accents, restrained bordered surfaces, friendly flat illustrations, responsive result layouts, and restrained motion. Prefer open-canvas composition and dividers over repeating cards.

The references supply visual-language evidence only. Their branding, wording, characters, scores, programmes, and proprietary assets must not be copied. The working palette and illustration direction are not official TCC identity.

## Preserved product boundaries

- Exactly two application roles remain: Student Applicant and Administrator.
- React, Tailwind CSS v4, shadcn/ui with Radix, Lucide React, and the existing Laravel API remain the architecture.
- The current locally stored questionnaire retains its binary **Agree** and **Do not agree** contract.
- The screenshot-inspired illustrated activity comparison with **Just okay**, **Great**, and **Love it** is PROPOSED and BLOCKED until an instrument, scoring contract, mappings, and validation evidence are approved.
- Recommendation labels, qualitative thresholds, programme facts, and explanations must come from versioned stored evidence.
- The self-declared entrance-examination gate and `SELF-DECLARED-TCC-ENTRANCE-2026-01` rule remain unchanged.
- Dark-theme presentation is out of scope for the new direction; removing existing support requires a separately tested implementation slice.

## Implementation state

The Student result and assessment-session slices now use the open-canvas direction. The binary assessment presents one centered stored statement, two explicit response controls, a narrow exact progress bar, visible save state, and stable Previous/Next navigation. It intentionally does not reproduce the reference product's activity pairs, illustrations, or three-level rating scale because those would change the approved instrument and scoring contract.

The visual redesign remains **IN PROGRESS** until the affected routes receive real-browser desktop/mobile, keyboard, overflow, console, contrast, zoom, and reduced-motion verification.
