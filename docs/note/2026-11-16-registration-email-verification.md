# Split-name registration and email verification

**Status:** IN PROGRESS  
**Date:** 2026-11-16  
**Owning domain:** Authentication and Student identity

## Decision and audit boundary

The local Student registration path previously accepted one `name` value, created the account without verifying ownership of the email address, and immediately attempted password sign-in. The same display identity flows through session payloads, Student profile presentation, Administrator Student monitoring, assessment result presentation, Google onboarding, local account tooling, factories, and fixtures.

This slice stores `first_name` and `last_name`, constructs the application display name from those fields, and retains the legacy `name` database column only as a compatibility mirror for existing database sort/search contracts. The migration backfills the first whitespace-delimited segment as `first_name` and the remaining text as `last_name`; ambiguous legacy names require human review if exact cultural name decomposition matters.

## Implemented contract

- Registration requires separate `firstName` and `lastName` values and normalizes email casing.
- Server validation uses Laravel's strict RFC and spoof protection, live MX validation outside automated tests, uniqueness checks, and an explicit error for the reported `gamil.com` typo.
- Successful local registration creates an unverified account and sends Laravel's expiring signed verification link.
- The signed link verifies ownership and returns to dedicated Student sign-in with a success status.
- Password login returns `EMAIL_NOT_VERIFIED`, clears the attempted session, and protected Student, Administrator, profile-photo, location, and portal-authorization routes also require verified email state.
- Resend is throttled and returns the same response for matching and missing accounts to limit account enumeration.
- The Student registration modal shows a dedicated verification state with resend and return-to-sign-in actions.
- Google-created accounts remain verified only when Google reports `email_verified`; Google given/family names populate the split fields when available.
- The verification notification replaces Laravel's default logo and generic message with a responsive, table-based HTML email aligned to the provisional green-neutral design direction. It includes the Student's first name, exact destination address, primary verification action, configured expiry, security guidance, visible fallback URL, and a complete plain-text alternative.
- Inline token colors and system-font fallbacks are deliberate email-client compatibility exceptions; they mirror `DESIGN.md` rather than introducing a separate visual system.

## Validation evidence

- `php artisan test --compact`: 137 passed, 1,192 assertions.
- `php artisan test tests/Feature/Auth/AuthenticationTest.php`: 20 passed, 107 assertions after adding the explicit protected-portal check.
- `npm.cmd run test -- --run src/features/auth/authentication.test.tsx -t "registers with split names"`: 1 passed.
- Full frontend test run: 158 passed and 4 skipped before the stale Full-name assertion was updated; its focused access-route regression then passed. Two unrelated baseline failures remain in the Administrator heading assertion and theme-background token assertion.
- Changed frontend files pass ESLint and `npm.cmd run check:architecture` passes. Full-project lint remains blocked by two pre-existing Fast Refresh export errors in Administrator files outside this slice.
- `npm.cmd run build`: passed; Vite reported only the existing large-chunk advisory.
- `php artisan migrate --force` applied `2026_11_16_010000_add_split_names_to_users_table` successfully to the local database.
- Customized verification-message rendering and the signed-link flow pass the focused Authentication feature suite: 20 tests, 113 assertions. Laravel Pint also passes for the changed PHP files.

## Remaining evidence and risk

- Live SMTP delivery and Gmail/Outlook rendering depend on provider credentials and client behavior; inbox placement is separate from the message design and remains unverified in this workspace.
- Real-browser desktop/mobile layout, keyboard focus, overflow, console, and contrast review remain pending.
- The legacy-name backfill is deterministic, not a claim that it perfectly decomposes every existing person's name.
