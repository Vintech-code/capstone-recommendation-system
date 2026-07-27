# ADR-002: Laravel REST API

**Purpose:** Decide the backend boundary and responsibility split.  
**Status:** PROPOSED.  
**Basis:** Proposal Laravel stack and roadmap REST architecture.  
**Owner:** Adviser/client approves; capstone backend lead implements.  
**Last updated:** 2026-07-26.  
**Related IDs:** D-002, FR-01-FR-10, NFR-02-NFR-10.  
**Open questions:** Deployment topology, supported PHP/Laravel versions, authentication topology, and operational ownership.

## Context

React is a presentation library, not a secure system of record. The project requires protected workflows, validation, imports, reporting, audits, background work, and deterministic recommendation services.

## Decision

Use Laravel as a versioned REST API. Laravel owns request/domain validation, authorization policies, application services, database transactions, recommendation orchestration, audit events, jobs/imports, report generation, and operational interfaces. Use Sanctum secure cookie authentication when the confirmed domain topology makes it practical.

## Consequences

- Protected rules are enforced server-side even if the UI is bypassed.
- Frontend and API contracts can evolve independently through explicit versioning.
- Deployment must support the selected Laravel/PHP version, queues/scheduling or documented fallbacks, private storage, and HTTPS.
- Cross-origin/token authentication requires a separate approved threat review.

## Alternatives

- Client-only React: rejected because it cannot securely protect or authoritatively process institutional data.
- Different backend framework: requires a replacement ADR and manuscript/roadmap alignment.

Related: [API Contract](../10-API-CONTRACT.md), [Security](../12-SECURITY-AND-PRIVACY.md).

