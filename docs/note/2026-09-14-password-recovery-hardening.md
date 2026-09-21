# Password recovery hardening

**Status:** IN PROGRESS — implementation and focused checks passed; unrelated frontend integration blockers remain  
**Recorded:** 2026-09-14  
**Owner:** Authentication

## Approved change

Password reset emails preserve the account's dedicated portal. Administrator accounts return to `/admin/login` after reset and Student Applicant accounts return to `/student/login`.

All user-created passwords use one Laravel-authoritative rule: 12 to 255 characters with uppercase and lowercase letters, a number, and a symbol. The same rule applies to Student registration, Administrator invitation acceptance, password recovery, authenticated password change, and the local Administrator creation command. The development-only local authentication seeder remains configuration-driven and must not be used as a production account workflow.

## Security behavior retained

- Forgot-password responses remain non-enumerating and rate-limited.
- Only active accounts receive reset notifications.
- Successful resets revoke existing sessions.
- Reset token storage, throttling, and expiry remain owned by Laravel's password broker.

## Validation

- Full Laravel suite: 133 tests passed with 1,120 assertions.
- Focused authentication, Administrator invitation, and local Administrator command suite: 38 tests passed with 201 assertions.
- Focused password-policy, reset-page, and Administrator-setup frontend suite: 8 tests passed.
- ESLint passed for every changed authentication file; focused PHP Pint passed.
- `git diff --check` passed for this slice with line-ending warnings only.
- Full frontend validation is blocked by a pre-existing malformed partial merge in `workspace-navigation.tsx`; the file contains overlapping `items` and `allItems` declarations/render trees. The architecture check also reports the concurrently changed `admin-administrators-page.tsx` at 1,072 lines, above the 500-line guard.
- The in-app browser was unavailable. Rendered desktop/mobile, keyboard, overflow, console, and contrast checks remain pending until the frontend integration blockers are resolved.
