# API catalogue

The authoritative API is Laravel under `/api/v1`. Browser authentication uses stateful Sanctum cookies and CSRF protection.

| Group | Main capabilities | Access |
| --- | --- | --- |
| `/auth` | register, login, session, logout, password recovery/change, Administrator invitation preview/acceptance, portal authorization | mixed public/authenticated; throttled where sensitive |
| `/student/assessments/riasec` | questionnaire, current session, save, submit, retry, history | active Student |
| `/student/entrance-examination` | read/create self-declaration | active Student |
| `/student/recommendations` | latest and historical attempt snapshots | owning active Student |
| `/student/programmes` | catalogue and programme detail | active Student |
| `/student/saved-programmes` | list, save, remove | owning active Student |
| `/student/profile` | profile and profile photo | owning active Student |
| `/notifications` | list and mark recipient notification read | active authenticated account |
| `/admin` | overview, Students, programmes, ESCO, catalogue configuration, reports, activity | active Administrator |
| `/admin/administrators` | list accounts/invitations, invite, resend/revoke, suspend/reactivate, manage account capability, revoke sessions | active Administrator with account-management capability; throttled and password-confirmed for mutations |
| `/locations` | locally synced PSGC hierarchy | active authenticated account; throttled |

Google OAuth redirects are web routes under `/auth/google/*`. The redirect accepts a validated `portal` hint, always asks Google to show the account chooser, and preserves the selected portal through the callback. Student OAuth may create or link a Student account; Administrator OAuth only links a matching existing active Administrator and never grants the Administrator role. `GET /` returns API service metadata, and `/up` is Laravel's health route.

Run `php artisan route:list --except-vendor` from `apps/api` for the exact current method, URI, action, and middleware mapping. Controllers return JSON and React consumes the `data` envelope for domain endpoints.

The 2026-09-16 contract cleanup removed unused duplicate endpoints for `/auth/me`, direct score-only RIASEC results, the profile RIASEC-result alias, configuration rollback, and the programme-source registry. The frontend uses the remaining session-backed assessment and catalogue workflows.
