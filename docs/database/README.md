# Database and persistence

Laravel owns schema evolution under `apps/api/database/migrations`; factories and seeders stay beside those migrations to preserve framework discovery.

## Current logical areas

- users, roles, role assignments, password-reset tokens, sessions, and Sanctum tokens;
- Student profiles and structured PSGC regions, provinces, cities/municipalities, and barangays;
- entrance examination declarations with supersession history;
- versioned assessment instruments/questions and Student assessment sessions;
- recommendation runs with catalogue, rule, entrance, ranked, and pending-programme snapshots;
- saved programmes;
- configuration versions, programme-source records, Administrator audit events;
- notification dispatch records and Laravel queue/cache infrastructure.

Historical counselor and appointment tables appear in early migrations and are removed by later approved migrations. Keep the full sequence: deleting old migration files would make fresh databases diverge from upgraded databases.

## Integrity rules

- Run migrations through Artisan; never hand-edit production schema state.
- Completed assessment evidence and recommendation snapshots are immutable.
- Student-owned operations require server-side ownership checks.
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
