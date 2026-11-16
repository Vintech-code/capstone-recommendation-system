# Shared toast feedback and Student header identity

**Date:** 2026-11-16  
**Implementation status:** IN PROGRESS pending final rendered review  
**Decision status:** APPROVED by the repository owner  
**Owning domains:** Shared UI and Student identity

## Decision

- Remove the inline success banner from the Student profile editor.
- Use one reusable application toast helper and one global toaster design for transient success and error feedback.
- Prevent feature code from importing the toast library directly; feature code calls the shared helper instead.
- Keep persistent inline alerts for validation and recoverable form errors.
- Show the current authenticated Student name beside the header profile control and refresh it immediately after a successful name edit.

## Implementation

- `appToast` centralizes success/error calls and the common duration.
- The shared toaster owns position, close control, radius, border, typography, action, cancellation, and color classes.
- The shared toaster uses dedicated light-surface tokens so it does not become black when a workspace or operating system uses a dark theme.
- Student profile saves and profile-photo updates now use the shared toast.
- Existing Administrator invitation/account-action and Student result-card share/download toasts now use the same helper.
- The Student header profile trigger displays the current authenticated name to the left of the avatar, with the menu chevron remaining at the far right.
- Desktop profile-page spacing is tightened above the editor card so the complete card fits more comfortably within the standard 1440 by 900 review viewport without changing the mobile form sequence.

## Validation

- Focused Vitest: 3 files and 12 tests passed, covering the reusable toast contract, removal of inline profile success copy, profile success notification, and visible header name.
- Changed-file ESLint passed.
- Frontend architecture checks passed.
- The production TypeScript/Vite build passed; Vite retains its existing large-chunk advisory.
- The Student profile Playwright workflow passed in desktop Chrome and mobile Chrome (2 tests), verifying the shared success toast and updated header name after saving.
- The same browser workflow verifies the complete desktop editor card remains inside the 1440 by 900 viewport and the rendered toast background resolves to the light `#fbfff7` project surface.
- `git diff --check` found no whitespace errors; Git reported only line-ending conversion advisories for existing working-tree files.

## Remaining evidence

- Manual keyboard-focus, console, and rendered-contrast review remains pending. The slice remains IN PROGRESS until that evidence is available.
