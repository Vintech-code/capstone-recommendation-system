# Local database reset for end-to-end retesting

**Status:** COMPLETED locally  
**Date:** 2026-09-18  
**Scope:** Local MySQL `db_psychometric` only

The repository owner requested a full local reset to test the Student and Administrator journeys from the beginning. Before deleting the existing rows, `php artisan system:backup` created an encrypted backup under `apps/api/storage/app/private/backups/`. `php artisan system:verify-backup` decrypted it and successfully restored it to a temporary MySQL database for verification.

`php artisan migrate:fresh --seed --force` then rebuilt the target database using all four clean-baseline migrations. Seeding installed only the `student` and `admin` roles and recreated one local sign-in account per role, using environment-owned credentials. It did not restore the prior Student's profile, declaration, assessment, or recommendation data. The PSGC catalogue was re-synced from its external source: 17 regions, 82 provinces, 1,656 cities/municipalities, and 42,027 barangays.

Post-reset checks showed all four migrations ran; two roles, two role assignments, two local accounts, one assessment instrument, and 42 questions. Student profiles, entrance declarations, assessment sessions, recommendation runs, saved programmes, Administrator invitations, and browser sessions each had zero rows. The Laravel suite passed (129 tests, 1,075 assertions), and `npm.cmd run check:architecture` passed. This operation was limited to `db_psychometric`; other MySQL databases were not reset.

The previous local data is recoverable from the verified encrypted backup if needed. Freshly testing Student registration, declaration, assessment, and recommendations will create new records; the two local seed accounts are present for portal testing.

The database backup does not contain uploaded files. After the reset, six orphaned Student profile-media files and three programme-media files were moved out of live storage into the private, recoverable archive `apps/api/storage/app/private/backups/reset-20260918-182752-media`. Both former live media directories are now absent; the database backup files were not moved or deleted. Restore media deliberately alongside its matching database state if recovery is ever required.
