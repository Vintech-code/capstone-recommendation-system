# Project documentation

This is the index for the surviving TCC Pathways documentation. The former numbered controlled baseline was intentionally removed by the repository owner and is not restored here.

## Current references

- [Product requirements](requirements/README.md) — implemented scope and policy boundaries.
- [System architecture](architecture/system-overview.md) — applications, modules, integrations, and ownership.
- [Codebase audit](architecture/codebase-audit-2026-09-13.md) — repository-wide audit and refactor findings.
- [API catalogue](api/README.md) — endpoint groups and authorization boundaries.
- [Database guide](database/README.md) — schema ownership, migrations, and historical-data rules.
- [System context diagram](diagrams/system-context.md) — browser, API, database, and external services.
- [User manual](user-manual/README.md) — local operation and role journeys.
- [Design system](../DESIGN.md) — UI and interaction authority.
- [Improvement roadmap](../SYSTEM-IMPROVEMENT-ROADMAP.md) — current workstreams, risks, and next actions.

## Evidence and history

- `note/` contains dated decisions, implementation records, validation evidence, and superseded historical context. Read each note's status before relying on it.
- `cmo/` contains locally reviewed CHED programme-standard evidence.
- `pdf/` contains the capstone paper and historical roadmap sources.
- `../PSG_Informed_RIASEC_Classification.xlsx` is the repository-owner-supplied analytical matrix. Its RIASEC classifications remain proposed, not official CHED or psychometric classifications.

Documentation folders are created only for active material. Framework-owned migrations, tests, and runtime assets remain inside `apps/api` and `apps/web` instead of being duplicated at the repository root.
