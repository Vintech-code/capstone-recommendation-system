# Database and persistence

Laravel owns schema evolution under `apps/api/database/migrations`; factories and seeders stay beside those migrations to preserve framework discovery.

## Current logical areas

- users, the exclusive Student/Administrator role assignment, Administrator account-management capability, Administrator invitations, password-reset tokens, and browser sessions;
- Student profiles and structured PSGC regions, provinces, cities/municipalities, and barangays;
- entrance examination declarations with supersession history;
- versioned assessment instruments/questions and Student assessment sessions;
- recommendation runs with catalogue, rule, entrance, ranked, and pending-programme snapshots;
- saved programmes;
- catalogue configuration versions and Administrator audit events;
- notification dispatch records and Laravel queue/cache infrastructure.

The repository-owner-approved 2026-09-16 clean baseline consolidates the active schema into four migrations. Counselor, appointment, API-token, programme-source-registry, and other superseded tables are not part of the baseline. The reset was performed only after an encrypted backup was created and successfully restore-verified; see the [implementation record](../note/2026-09-16-backend-clean-baseline.md).

## Integrity rules

- Run migrations through Artisan; never hand-edit production schema state.
- Exactly two role slugs are valid: `student` and `admin`; each user can hold only one role assignment.
- Completed assessment evidence and recommendation snapshots are immutable.
- Student-owned operations require server-side ownership checks.
- Administrator invitations store only a token hash and separate expiry, acceptance, revocation, sender, and delivery timestamps. Acceptance creates the individual account transactionally; suspension revokes existing sessions.
- Source-controlled catalogue facts are overlaid only with permitted published enrichment.
- Location sync is atomic and normal requests use local data.
- Runtime `.env` files and database files are ignored; only safe templates are tracked.

Useful commands from `apps/api`:

```powershell
php artisan migrate
php artisan migrate:status
php artisan locations:sync
php artisan test
```
