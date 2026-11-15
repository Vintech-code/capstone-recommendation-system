# Student ID number and learning-profile removal

**Status:** IMPLEMENTED with automated validation and inspected desktop/mobile renders; clean browser-runner exit and complete interaction evidence remain pending.  
**Date:** 2026-11-16  
**Owner direction:** Replace the optional LRN with a required eight-digit ID number, then remove the entire Learning Profile & Strengths feature from frontend through backend.

## Audit boundary

The pre-change trace covered the Student profile route, request validation, encrypted persistence and uniqueness lookup, presenter response, Administrator Student detail response, retention anonymization, React payload/types/editor, shared test fixtures, focused component tests, Laravel feature tests, and Playwright workflow mocks.

The Learning Profile & Strengths feature was connected through three Student profile JSON columns (`strengths`, `growth_areas`, and `learning_preferences`), allowed-value constants, update validation, response questionnaire/options blocks, a derived career-interest list and profile summary, the second profile editor tab, completion gating, privacy cleanup, and backend/frontend/browser tests. These connections were removed together.

## Implemented contract

- Student profile updates require `idNumber` as a string containing exactly eight digits.
- The encrypted value is stored as `id_number`; a separate SHA-256 `id_number_lookup_hash` enforces cross-account uniqueness without querying ciphertext.
- Student and Administrator responses expose `idNumber`; active contracts no longer expose `lrn`.
- The profile editor labels the field **ID number**, accepts digits only, limits entry to eight digits, and does not mark it optional.
- The Learning Profile & Strengths tab, choices, completion rule, request fields, response fields, derived career-interest/profile-summary output, model casts, and retention cleanup for the deleted fields are removed.
- Read-only RIASEC result evidence, personal information, structured PSGC location selection, profile photo behavior, assessment history, and recommendation snapshots remain in scope and unchanged.

## Migration and data boundary

`2026_11_16_000000_replace_lrn_and_remove_learning_profile_fields` removes the encrypted LRN, its lookup hash, and the three learning-profile JSON columns before adding nullable encrypted-ID storage and a nullable uniqueness hash. Database nullability is retained so profile-photo creation and pre-existing accounts remain migratable; the profile update API and UI require the eight-digit ID.

Existing 12-digit LRN values are not truncated or reinterpreted because no approved mapping establishes that an LRN is the requested eight-digit ID. Applying the migration deletes the former LRN and self-reported learning-profile values. A target environment requiring rollback must create and verify its own backup before migration.

## Validation evidence

- Focused Laravel profile, location, Administrator workspace, authentication, and governance suites: **42 passed, 266 assertions**.
- Focused frontend Student profile and Administrator detail/workspace suites: **3 files passed, 10 tests**.
- Full Laravel suite: **134 passed, 1,157 assertions**.
- Clean-schema regression after the full run: **2 passed, 25 assertions**, including explicit absence of the LRN and learning-profile columns.
- Laravel Pint changed-file check: passed.
- Frontend changed-file ESLint: passed.
- Frontend architecture check: passed.
- Frontend production build: passed.
- Full frontend Vitest suite: **31 files passed, 2 unrelated existing files failed; 159 tests passed, 4 skipped, 2 failed**. The failures remain the pre-existing `theme.test.tsx` background-token mismatch and Administrator access-route expectation; neither changed file is involved.
- Full frontend ESLint remains blocked by two pre-existing Fast Refresh violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`; changed-file lint passed.
- The focused Playwright profile case reached and captured both desktop Chrome and Pixel 7 renders. Manual inspection confirmed the required **ID number** field, absent learning-profile tab, responsive stacking, and no visible horizontal clipping. The runner did not exit cleanly and was stopped, so the case is not recorded as a passing Playwright run; keyboard-focus, console, contrast, and complete interaction evidence remain pending.
- Before changing the persistent local MySQL schema, `php artisan system:backup` created an encrypted backup and `php artisan system:verify-backup` restored and integrity-checked it successfully.
- `php artisan migrate --force` applied `2026_11_16_000000_replace_lrn_and_remove_learning_profile_fields`; `migrate:status` reports it as **Ran** in batch 4.
- `php artisan db:table student_profiles` confirms the local table now has `id_number` and the unique `id_number_lookup_hash` index and no longer lists the LRN or learning-profile columns.

## Status boundaries

- **COMPLETED:** end-to-end dependency audit and implementation of the active ID/profile contract.
- **IN PROGRESS:** clean Playwright completion plus keyboard-focus, console, contrast, and complete interaction evidence.
- **BLOCKED:** none.
- **RISK:** the applied forward migration removed existing LRN and learning-profile values. The pre-migration local state is recoverable from the verified encrypted backup; other environments still require their own verified backup before migration.
