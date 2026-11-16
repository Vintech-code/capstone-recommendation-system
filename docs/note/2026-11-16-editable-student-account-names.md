# Editable Student account names

**Date:** 2026-11-16  
**Implementation status:** IN PROGRESS pending rendered browser review  
**Decision status:** APPROVED by the repository owner  
**Owning domain:** Authentication and Student identity

## Decision

- Allow authenticated Students to edit required first and last names through My Profile.
- Apply the same behavior to locally registered and Google-created Student accounts. Google supplies the initial names but does not permanently lock them.
- Keep account email read-only in the ordinary profile editor. Email changes require a separate ownership-verification and account-security decision.
- Do not impose an edit count, approval workflow, or lock period without an approved institutional rule.
- Do not rewrite completed assessment or recommendation evidence when the current account name changes.

## Implementation

- The profile form now exposes editable, required `given-name` and `family-name` controls with 100-character client limits.
- `PUT /api/v1/student/profile` trims and validates both names on Laravel.
- One database transaction updates the split `first_name` and `last_name`, the compatibility `name` value, and the Student profile fields.
- The saved profile response immediately updates the profile header, and the Student workspace refreshes its authenticated session identity after success.
- Success is announced through the shared application toast rather than an inline profile banner. The refreshed authenticated name is visibly shown beside the Student header profile control.
- Email remains visibly read-only.

## Validation

- Backend profile and location coverage passes: 19 tests and 141 assertions verify the split-name response, synchronized `users` columns, required-name errors, profile ownership, and existing location behavior.
- The full backend suite passes: 139 tests and 1,209 assertions.
- The focused frontend profile component test passes and verifies editable name controls, the submitted payload, successful save state, and authenticated-identity refresh callback.
- Changed frontend files pass ESLint; changed backend files pass Laravel Pint.
- Frontend architecture validation and the production build pass. Vite reports only the existing large-chunk advisory.
- The focused Playwright workflow passes in desktop Chrome and Pixel 7 mobile emulation. It edits both name fields, saves, confirms the updated profile heading, and checks horizontal overflow.

## Remaining evidence

- Desktop/mobile rendering and overflow are covered by the focused browser workflow. Manual keyboard-focus, console, and rendered-contrast review remains pending, so the slice remains IN PROGRESS.
