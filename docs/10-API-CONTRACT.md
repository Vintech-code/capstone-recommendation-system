# API Contract

**Purpose:** Establish the REST resource boundary and record implemented contracts.
**Status:** IN PROGRESS; authentication foundation implemented, domain contracts PROPOSED.
**Basis:** Roadmap, Section 9; Laravel REST architecture.  
**Owner:** Capstone backend lead.  
**Last updated:** 2026-07-29.
**Related IDs:** FR-01-FR-10, NFR-02-NFR-10, D-020.
**Open questions:** Exact fields, role matrix, import format, report format, and rule semantics remain open.

## Contract conventions

- Prefix versioned routes with `/api/v1`.
- Use JSON over HTTPS; reports/exports use controlled downloads.
- Use Laravel validation and policies on every protected operation.
- Prefer Sanctum secure, HTTP-only cookie sessions when deployment topology supports them.
- Return `401` for unauthenticated, `403` for unauthorized, `404` where resource concealment is appropriate, `409` for version/state conflicts, and `422` for validation.
- Include stable error codes, field errors, a request/correlation ID, and safe user-facing messages.
- Support pagination/filter/sort allowlists and idempotency for imports, submissions, and recommendation generation.
- Never expose password hashes, secrets, internal model artifacts, other applicants' data, or sensitive audit payloads.

## Resource groups (PROPOSED)

| Group | Representative operations | Primary roles |
|---|---|---|
| Auth/session | register, login, logout, password reset, current user | Public/authenticated |
| Applications/profiles | create/update own draft, submit, view status | Student; authorized Admin read |
| Exam results | import/encode, verify/reject, correct with reason, view history | Guidance/Psychometrician/Admin; student read-own |
| Questionnaire/assessment | get active version, autosave, submit, view own score | Student; Guidance/Psychometrician/Admin governs |
| Courses/rules/profiles | list details; create/version/approve/effect | Student read; authorized Admin manage |
| Recommendations | generate idempotently, list run/items, view explanation | Student own; authorized review |
| Decisions/reports | record decision, request/download report | Student own; authorized Admin |
| Admin/audit | users, roles, cycles, settings, audit search | System Administrator side role |

## Implemented authentication contract

The following versioned endpoints are implemented for first-party Sanctum SPA
sessions:

| Method | Route | Access | Result |
|---|---|---|---|
| `GET` | `/sanctum/csrf-cookie` | Public first-party SPA | Initializes CSRF cookies before login. |
| `POST` | `/api/v1/auth/login` | Public, throttled | Validates email/password/portal, rotates the session, verifies the server role, and returns the safe user payload. |
| `GET` | `/api/v1/auth/me` | `auth:sanctum` | Returns `id`, `name`, `email`, and assigned approved role slugs. |
| `GET` | `/api/v1/auth/authorize/{portal}` | `auth:sanctum` plus the matching role middleware | Confirms access to one of the three fixed portal boundaries; returns `401` for a missing/expired session and `403` for a role mismatch. |
| `POST` | `/api/v1/auth/logout` | `auth:sanctum` | Ends the web session, invalidates it, and regenerates CSRF state. |

The current role slugs are `student`, `admin`, and `system-admin`. Registration,
recovery, account status, production origin topology, and detailed action
policies remain pending under OQ-007/OQ-008. The current many-to-many role
storage remains policy-neutral: the authorization guard verifies required role
membership without deciding whether production accounts may hold one or
multiple roles.

D-020 confirms that many distinct users may each hold the `admin` role. The
role slug represents the combined portal capability, not one staff member.
Every guidance counselor or psychometrician must authenticate with an
individual account; API authorization and future audit records must use the
acting user ID. Whether one account may hold multiple different role types and
whether Admin personnel receive action-level permission differences remain
open under OQ-007/OQ-008.

## Local authentication seed accounts

Local development may opt into three separate sign-in accounts, one for each
approved role. No password is stored in source control. Set
`LOCAL_AUTH_SEED_ENABLED=true` and `LOCAL_AUTH_SEED_PASSWORD` in the ignored
`apps/api/.env`, then run `php artisan db:seed`.

The default local-only email addresses are:

- `student@example.test`
- `admin@example.test`
- `system-admin@example.test`

The seeder is idempotent, refuses non-local/non-testing environments, and
refuses to reassign an existing account that conflicts with the configured
role. These accounts are development fixtures, not a production account
creation or approval policy.

## Example error envelope

```json
{
  "error": {
    "code": "ASSESSMENT_VERSION_NOT_ACTIVE",
    "message": "This assessment is no longer accepting responses.",
    "fields": {},
    "request_id": "server-generated-id"
  }
}
```

This document is not an OpenAPI specification. Create that specification after requirements and data fields are approved. Related: [Functional Requirements](05-FUNCTIONAL-REQUIREMENTS.md), [Security](12-SECURITY-AND-PRIVACY.md).
