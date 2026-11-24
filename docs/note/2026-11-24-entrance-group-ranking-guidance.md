# Entrance-group guidance on ranked programmes

**Status:** COMPLETED with focused automated and rendered validation.
**Date:** 2026-11-24.
**Owner:** Recommendation presentation domain.

## Approved direction

The repository owner identified that a Student in the non-board entrance group can receive a board programme as a top RIASEC interest match. The existing approved ranking rule remains unchanged: all configured programmes stay visible in exact RIASEC order, and entrance grouping remains separate guidance rather than a scoring input or filter.

When the backend-recorded `eligibleForDeclaredGroup` flag is false, the Student interface must label the programme even at ranks 1–3. The owner-approved plain-language copy uses **Board/Non-board programme · admission review needed**, states that the entrance-exam result belongs to a different programme group, explains that the course remains visible because it matches the Student's interests, and directs the Student to check TCC admission requirements before choosing it. The interface must not describe the Student as failed or present the guidance as an admission rejection.

## Implementation boundary

- The ranked recommendation card keeps the programme's exact rank, match percentage, top-rank treatment, detail action, and feedback control.
- A semantic warning badge and explanation appear inside the ranked card when `eligibleForDeclaredGroup` is false.
- The same guidance appears in programme detail so it remains visible after navigation.
- The browser does not calculate entrance compatibility. It renders the existing authoritative API flag and recorded programme group.
- No recommendation score, ranking rule, entrance classification, admission rule, snapshot, or database record changes in this slice.

## Validation evidence

- Focused Student recommendation component suite passed: 17 tests.
- Changed-file ESLint and frontend architecture validation passed.
- Frontend production build passed.
- The focused Student workflow passed in desktop and mobile Chromium with the mismatched board programme retained at rank 1 and the guidance shown on the result card and programme detail.
- Responsive, keyboard, horizontal-overflow, console, light/dark contrast, and printable-page smoke checks passed in desktop and mobile Chromium. The warning badge was strengthened to use the semantic foreground colour after the first contrast run identified insufficient amber text contrast over a ranked-card background.
- Desktop and mobile screenshots were reviewed for wrapping and readability.
