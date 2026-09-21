# Administrator account governance

**Status:** COMPLETED — automated and focused rendered-browser validation passed  
**Recorded:** 2026-09-14  
**Owner:** Authentication and Administrator access governance

## Approved decision

Administrator provisioning uses invitations rather than shared or Administrator-created recipient passwords. Existing Administrator accounts receive the account-management capability during migration so the installation retains a trusted governance path; locally bootstrapped Administrators also receive it. A capable Administrator may grant or remove that capability, but the server preserves at least one active account manager.

Invitations expire after 15 minutes by the repository-owner-approved project default. The recipient receives a single-use setup link, verifies mailbox access by opening it, and creates their own password. The token remains in the browser URL fragment and is sent to Laravel only in CSRF-protected request bodies; Laravel stores only its SHA-256 hash. Resending rotates the token, starts a fresh 15-minute window, and revoking or accepting it makes it unusable.

## Implemented slice

- Added capability-gated and throttled Laravel endpoints for account/invitation listing, invitation issue/resend/revoke, account suspension/reactivation, account-management permission changes, and session revocation.
- Required current-password confirmation for every authenticated mutation and a reason for status and permission changes.
- Added transactional invitation acceptance, email verification through the invitation channel, individual Administrator role assignment, last-active-manager and self-suspension safeguards, immediate session revocation on suspension, security-change email notices, and sanitized audit events.
- Administrator invitation acceptance uses the same Laravel-authoritative password policy as registration, recovery, password change, and local Administrator creation: 12 to 255 characters with uppercase and lowercase letters, a number, and a symbol.
- Added the responsive Administrators ledger, invitation and confirmation dialogs, state-specific actions, capability-filtered navigation, and the public Administrator setup page.
- Kept MFA/passkeys and their recovery policy deferred as a separate security slice; no production-security claim is made.

## Validation

- Full Laravel suite: 131 tests passed with 1,101 assertions, including 10 focused account-governance tests.
- Focused Laravel authentication and local Administrator command tests: passed with the new capability payload/bootstrap behavior.
- Focused Pint check for changed PHP files: passed.
- Frontend architecture check: passed.
- Frontend ESLint: passed.
- Frontend production build: passed with the existing large-chunk warning.
- Full frontend Vitest suite: 138 tests passed with 4 existing skips, including 3 focused account-governance/setup tests.
- Focused Playwright Chrome validation passed on desktop and Pixel 7. It covered the account ledger, invitation dialog, recipient setup, keyboard focus containment, document overflow, console errors, and serious/critical WCAG findings.
- The in-app browser connection was unavailable. Playwright generated and passed rendered screenshots for both configured viewports.
- The broader Admin Playwright file reported 6 passing cases and 4 failures in two pre-existing dashboard assertions repeated across both viewports: an ambiguous duplicate `View all records` locator and a stale `Recommendation runs` expectation. The new account-governance case passed in both projects; the unrelated assertions were not changed in this slice.

## Risks and follow-up

- Mail delivery depends on the configured Laravel mail transport. Failed delivery leaves a visible pending invitation with an audited delivery failure so an authorized manager can retry.
- MFA or passkeys remain required before a production-security claim. The recovery and factor-reset policy must be approved and tested in that separate slice.
- Production migration requires normal backup and rollback preparation. Do not bypass the invitation workflow by sharing credentials.
