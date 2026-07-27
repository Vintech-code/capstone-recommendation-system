# API Contract

**Purpose:** Establish a provisional REST resource boundary without implementing endpoints.  
**Status:** PROPOSED.  
**Basis:** Roadmap, Section 9; Laravel REST architecture.  
**Owner:** Capstone backend lead.  
**Last updated:** 2026-07-27.  
**Related IDs:** FR-01-FR-10, NFR-02-NFR-10.  
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
