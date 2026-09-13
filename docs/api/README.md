# API catalogue

The authoritative API is Laravel under `/api/v1`. Browser authentication uses stateful Sanctum cookies and CSRF protection.

| Group | Main capabilities | Access |
| --- | --- | --- |
| `/auth` | register, login, session, logout, password recovery/change, portal authorization | mixed public/authenticated; throttled where sensitive |
| `/student/assessments/riasec` | questionnaire, current session, save, submit, retry, history | active Student |
| `/student/entrance-examination` | read/create self-declaration | active Student |
| `/student/recommendations` | latest and historical attempt snapshots | owning active Student |
| `/student/programmes` | catalogue and programme detail | active Student |
| `/student/saved-programmes` | list, save, remove | owning active Student |
| `/student/profile` | profile, photo, recorded RIASEC result | owning active Student |
| `/notifications` | list and mark recipient notification read | active authenticated account |
| `/admin` | overview, Students, programmes, ESCO, configurations, reports, activity | active Administrator |
| `/locations` | locally synced PSGC hierarchy | active authenticated account; throttled |

Google OAuth redirects are web routes under `/auth/google/*`. `GET /` returns API service metadata, and `/up` is Laravel's health route.

Run `php artisan route:list --except-vendor` from `apps/api` for the exact current method, URI, action, and middleware mapping. Controllers return JSON and React consumes the `data` envelope for domain endpoints.
