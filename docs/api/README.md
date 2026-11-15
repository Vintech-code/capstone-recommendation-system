# API catalogue

The authoritative API is Laravel under `/api/v1`. Browser authentication uses stateful Sanctum cookies and CSRF protection.

| Group | Main capabilities | Access |
| --- | --- | --- |
| `/auth` | split-name Student registration, email verification/resend, login, session, logout, password recovery/change, Administrator invitation preview/acceptance, portal authorization | mixed public/authenticated; throttled where sensitive |
| `/student/assessments/riasec` | questionnaire, current session, save, submit, retry, history | active Student |
| `/student/entrance-examination` | read/create self-declaration | active Student |
| `/student/recommendations` | latest and historical attempt snapshots | owning active Student |
| `/student/programmes` | catalogue and programme detail | active Student |
| `/student/saved-programmes` | list, save, remove | owning active Student |
| `/student/profile` | personal and academic profile, required eight-digit ID number, read-only RIASEC summary, and profile photo | owning active Student |
| `/admin` | overview, Students, programmes, ESCO, catalogue configuration, reports, activity | active Administrator |
| `/admin/administrators` | list accounts/invitations, invite, resend/revoke, suspend/reactivate, manage account capability, revoke sessions | active Administrator with account-management capability; throttled and password-confirmed for mutations |
| `/locations` | locally synced PSGC hierarchy | active authenticated account; throttled |

Google OAuth redirects are web routes under `/auth/google/*`. The redirect accepts a validated `portal` hint, always asks Google to show the account chooser, and preserves the selected portal through the callback. Student OAuth may create or link a Student account; Administrator OAuth only links a matching existing active Administrator and never grants the Administrator role. `GET /` returns API service metadata, and `/up` is Laravel's health route.

`POST /api/v1/auth/register` requires `firstName`, `lastName`, `email`, `password`, and `password_confirmation`. It creates an unverified Student and sends Laravel's signed verification notification. `GET /auth/email/verify/{id}/{hash}` is signed and expiring, marks ownership verified, and returns to Student sign-in. `POST /api/v1/auth/email/verification-notification` resends without account enumeration. Password login returns `EMAIL_NOT_VERIFIED` until verification succeeds, and protected domain routes also enforce the `verified` middleware.

Run `php artisan route:list --except-vendor` from `apps/backend` for the exact current method, URI, action, and middleware mapping. Controllers return JSON and React consumes the `data` envelope for domain endpoints.

The 2026-09-16 contract cleanup removed unused duplicate endpoints for `/auth/me`, direct score-only RIASEC results, the profile RIASEC-result alias, configuration rollback, and the programme-source registry. The frontend uses the remaining session-backed assessment and catalogue workflows.

Active profile responses expose `personalAcademic.idNumber` instead of an LRN and require exactly eight digits on update. They do not expose the removed learning-profile questionnaire, selection options, strengths, growth areas, learning preferences, career-interest projection, or generated profile summary. Active profile and programme responses also do not expose SHS school, strand/track, graduation-year, recommended-strand, or strand-guidance fields. Recommendation result dimensions include competition-rank metadata so equal scores can be presented as shared positions. New recommendation snapshots identify the proposed ordered 50% / 30% / 20% programme-profile formula through their stored rule reference.
