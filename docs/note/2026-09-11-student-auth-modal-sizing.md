# Student authentication modal sizing

**Status:** COMPLETED  
**Recorded:** 2026-09-11  
**Scope:** Public landing-page Student authentication modal

## Decision

The segmented **Sign in / Create account** control is removed. The existing contextual action below each form remains the mode-change control, so Student sign-in and registration are still both accessible without duplicating navigation.

The modal maximum width increases from 390px to 500px, its padding and control spacing increase, and the modal surface uses `rounded-sm`. Headings, descriptions, fields, helper text, separators, and secondary actions use a larger text hierarchy. Authentication behavior, validation, Google authentication, password recovery, and dedicated portal URLs remain unchanged.

## Validation

- Focused authentication Vitest suite: 8 tests passed.
- Targeted ESLint for the modal, route test, and Playwright specification: passed.
- TypeScript and Vite production build: passed.
- Focused Playwright Chrome test: desktop and Pixel 7 cases both reported `ok` after verifying the removed tablist, 500px maximum surface, larger heading, `rounded-sm`, mode-switch action, and horizontal containment. The known post-run shutdown hang required manual interruption after both cases passed.
- Generated desktop and mobile screenshots were visually reviewed. The larger card and type hierarchy remain contained and readable at both viewport sizes.
- The in-app browser connection was unavailable; repository Playwright Chrome supplied the rendered evidence.
