# Google account-selection hardening

**Status:** COMPLETED on 2026-09-19.

## Problem

After Google rejected an account for the selected portal, a second **Continue with Google** attempt could silently reuse the same browser account. The user then returned immediately with `portal_forbidden` and had no opportunity to choose the correct Google account.

## Implemented behavior

- Every Laravel Socialite Google authorization request includes `prompt=select_account`.
- The selected Student or Administrator portal is retained in the session for the callback.
- Student Google authorization may create or link a Student account.
- Administrator Google authorization requires an already-provisioned, active Administrator with the same verified email. It cannot create an Administrator or grant the Administrator role.
- A Student Google account remains forbidden from the Administrator portal.

## Evidence

- Focused Google authentication suite: 12 tests passed, 61 assertions.
- Full Laravel suite: 132 tests passed, 1,091 assertions.
- Laravel Pint completed successfully and formatted the changed controller.
- Frontend repository architecture check passed.

Live Google-provider selection was not exercised because it requires an interactive external Google session. The authorization URL and both portal callback boundaries are covered by backend feature tests.
