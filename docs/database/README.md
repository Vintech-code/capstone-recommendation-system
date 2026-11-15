# Database and persistence

Laravel owns schema evolution under `apps/api/database/migrations`; factories and seeders stay beside those migrations to preserve framework discovery.

## Current logical areas

- users with separate first and last names plus email-verification state, the exclusive Student/Administrator role assignment, Administrator account-management capability, Administrator invitations, password-reset tokens, and browser sessions;
- Student profiles with encrypted eight-digit ID numbers and hashed uniqueness lookup, plus structured PSGC regions, provinces, cities/municipalities, and barangays;
- entrance examination declarations with supersession history;
- versioned assessment instruments/questions and Student assessment sessions;
- recommendation runs with catalogue, rule, entrance, ranked, and pending-programme snapshots;
- saved programmes;
- catalogue configuration versions and Administrator audit events;
- Laravel queue/cache infrastructure.

The repository-owner-approved 2026-09-16 clean baseline consolidates the active schema. Counselor, appointment, API-token, programme-source-registry, in-app notification, and other superseded tables are not part of the current schema. The reset was performed only after an encrypted backup was created and successfully restore-verified; see the [implementation record](../note/2026-09-16-backend-clean-baseline.md). The later in-app notification removal retains a forward migration so existing installations can drop those tables through Artisan rather than by manual schema editing.

The 2026-11-03 forward migration removes the legacy `shs_school_name`, `shs_strand`, and `shs_graduation_year` columns from Student profiles. Historical assessment results and recommendation snapshots are not rewritten by that migration.

The 2026-11-16 forward migration replaces the optional encrypted LRN and lookup hash with an encrypted eight-digit `id_number` and uniqueness hash. Existing LRN values are not reinterpreted as ID numbers. The same migration removes the active `strengths`, `growth_areas`, and `learning_preferences` columns; assessment and recommendation history remain unchanged.

The later 2026-11-16 user-name migration adds `first_name` and `last_name` and deterministically backfills legacy display names by keeping the first whitespace-delimited part as the first name and the remainder as the last name. New Student registrations and Google-created users write both fields. The legacy `name` column remains a compatibility mirror for existing query/sort contracts, while application display access is constructed from the split fields.

## Integrity rules

- Run migrations through Artisan; never hand-edit production schema state.
- Exactly two role slugs are valid: `student` and `admin`; each user can hold only one role assignment.
- Local Student accounts remain unverified until a signed email link marks `email_verified_at`; password login and protected APIs require that timestamp. Verification resend is throttled and non-enumerating.
- Completed assessment evidence and recommendation snapshots are immutable.
- Student-owned operations require server-side ownership checks.
- Profile updates require an exactly eight-digit ID number. Its encrypted value is never used for lookup; uniqueness uses the separate SHA-256 lookup hash.
- Administrator invitations store only a token hash and separate expiry, acceptance, revocation, sender, and delivery timestamps. Acceptance creates the individual account transactionally; suspension revokes existing sessions.
- Source-controlled catalogue facts are overlaid only with permitted published enrichment.
- Location sync is atomic and normal requests use local data.
- Runtime `.env` files and database files are ignored; only safe templates are tracked.

Useful commands from `apps/backend`:

```powershell
php artisan migrate
php artisan migrate:status
php artisan locations:sync
php artisan test
```
