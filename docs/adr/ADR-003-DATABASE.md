# ADR-003: Relational Database Selection

**Purpose:** Control the unresolved MySQL/PostgreSQL decision.  
**Status:** BLOCKED.  
**Basis:** Proposal development section uses MySQL/phpMyAdmin; proposal architecture and roadmap use PostgreSQL; deployment targets Hostinger.  
**Owner:** TCC IT/hosting owner and capstone technical lead.  
**Last updated:** 2026-07-27.  
**Related IDs:** D-003, OQ-001, R-003.  
**Open questions:** Exact Hostinger product, supported engine/version/extensions, connection/access, backup/restore, capacity, and migration tooling.

## Context

The source documents contradict each other. Selecting an engine without the actual hosting capability could make migrations and deployment unusable.

## Provisional decision rule

- Ordinary Hostinger shared/cloud hosting: choose MySQL 8 when it is the supported managed database.
- Confirmed VPS or compatible external managed PostgreSQL: PostgreSQL may be selected.
- Do not implement engine-specific migrations or accept the roadmap's starter PostgreSQL schema as authoritative until the choice is approved.

## Required evidence

Record the exact plan name, region if relevant, supported engine/version, extensions, connection method, storage/backups, restore access, resource limits, and operator. Then approve one engine and update all diagrams, manuscript sections, environment documentation, and migrations consistently.

## Consequences

Laravel migrations will become the authoritative schema. The logical model should avoid needless engine-specific behavior, while indexing, JSON, UUID, full-text, and timestamp choices must be validated for the selected engine.

Related: [Database Design](../08-DATABASE-DESIGN.md), [Deployment Plan](../20-DEPLOYMENT-PLAN.md), [ADR-005](ADR-005-WEB-MOBILE-DELIVERY.md).
