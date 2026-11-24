# Administrator profile photo and full-width layout

**Status:** IN PROGRESS pending live verification against the deployed API and a clean browser-runner exit.  
**Date:** 2026-11-25.  
**Owner:** Authentication identity and Administrator profile presentation.

## Problem

The Administrator photo endpoint could return success while the profile card and workspace continued showing initials. The server returns a relative protected image path such as `/api/v1/admin/profile/photo`, but image elements bypass the shared API client. In a separated Vercel-frontend/Laravel-backend deployment, the browser therefore requested the photo from the frontend origin and fell back to initials when that request failed. `refreshSession` also only triggered the initial restoration effect, which intentionally does not run when the application receives a preloaded user. Shared avatar instances retained an image-error boolean after their URL changed. The Profile Settings page additionally applied `max-w-300` inside the already padded Admin canvas, creating excessive desktop side gutters.

## Resolution

- `refreshSession` now performs and awaits a fresh `/api/v1/auth/session` request, then updates the shared authenticated user.
- The profile editor immediately uses the `photoUrl` returned by the successful upload or removal response while the shared identity refresh completes.
- Protected relative avatar paths are fetched through the shared API origin with session credentials, converted to browser object URLs, and then rendered. This avoids unauthenticated cross-origin image requests. Absolute Google or external image URLs remain unchanged.
- A protected-photo retrieval failure now replaces the success notice with the server error instead of silently showing initials.
- Shared avatars remember the specific URL that failed. A different replacement URL is attempted normally instead of remaining on the initials fallback.
- Profile Settings now uses the complete width available within the workspace's existing responsive padding.
- Storage, file validation, authorization, account ownership, and the existing 5 MB and 160 by 160 pixel requirements remain unchanged.

## Validation evidence

- Six focused authenticated-photo retrieval, API-origin resolution, upload-preview, and failed-old-photo replacement tests pass. The preloaded-session-refresh test also passed in its focused run.
- Changed-file ESLint, architecture validation, and the production build pass.
- Desktop and Pixel 7 browser workflows pass. Both confirm the upload success message, authenticated blob rendering, and profile canvas width above 90 percent of the main content width.
- Playwright reports both browser cases as passed but its reused Vite-server process still requires manual interruption after emitting the results.
- The broader authentication file has one unrelated existing failure: the legacy `/admin/applicants` alias remains at `/admin/students` for an unauthenticated test instead of reaching `/admin/login`. The new identity-refresh test passes independently.
