# Project documentation

This is the index for the surviving TCC course-recommendation documentation. The former numbered controlled baseline was intentionally removed by the repository owner and is not restored here.

## Current references

- [Development standards](architecture/development-standards.md) — mandatory placement, dependency, clean-code, contract, and validation rules.

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
- [Administrator account governance](note/2026-09-14-administrator-account-governance.md) records the invitation, capability, suspension, session-revocation, and audit implementation boundary.
- [Password recovery hardening](note/2026-09-14-password-recovery-hardening.md) records portal-preserving reset links and the shared password-strength policy.
- [Backend clean baseline](note/2026-09-16-backend-clean-baseline.md) records the migration consolidation, unused-contract removal, verified backup, reset, and two-role enforcement.
- [Local retest reset](note/2026-09-18-local-database-reset.md) records the verified backup, fresh migration, seeding, location refresh, and empty workflow state.
- [Google account-selection hardening](note/2026-09-19-google-account-selection.md) records the forced account chooser and the role-safe Student and Administrator OAuth boundaries.
- [RIASEC formula and PSG profile audit](note/2026-09-20-riasec-result-formula-and-profile-audit.md) records the verified scoring path, independently ranked BSEd majors, 11 distinct workbook codes, and pending Community Development boundary.
- [RIASEC interest-profile names](note/2026-09-21-riasec-interest-profile-names.md) records the approved two-word names, two-sentence descriptions, fallback boundary, implementation, and validation evidence.
- [Product-name removal](note/2026-09-21-product-name-removal.md) records the repository-wide removal of the former product label from source, configuration, tests, and documentation.
- [Workspace preview JSX repair](note/2026-09-21-workspace-preview-jsx-repair.md) records the duplicated-markup repair, focused regression evidence, and remaining rendered-validation blocker.
- [Frontend modular refactor](note/2026-09-21-frontend-modular-refactor.md) records the first architecture-only extraction slice, automated validation, and remaining browser/test drift.
- `cmo/` contains locally reviewed CHED programme-standard evidence.
- `pdf/` contains the capstone paper and historical roadmap sources.
- `../PSG_Informed_RIASEC_Classification.xlsx` is the repository-owner-supplied analytical matrix. Its RIASEC classifications remain proposed, not official CHED or psychometric classifications.

Documentation folders are created only for active material. Framework-owned migrations, tests, and runtime assets remain inside `apps/api` and `apps/web` instead of being duplicated at the repository root.
