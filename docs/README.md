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
- [In-app notification removal](note/2026-09-30-in-app-notification-removal.md) records removal of the Student and Administrator notification feed, its API/producers/storage, retained account-security email boundary, and validation evidence.
- [Product-name removal](note/2026-09-21-product-name-removal.md) records the repository-wide removal of the former product label from source, configuration, tests, and documentation.
- [Workspace preview JSX repair](note/2026-09-21-workspace-preview-jsx-repair.md) records the duplicated-markup repair, focused regression evidence, and remaining rendered-validation blocker.
- [Frontend modular refactor](note/2026-09-21-frontend-modular-refactor.md) records the first architecture-only extraction slice, automated validation, and remaining browser/test drift.
- [Assessment progress divider and retake-cancel audit](note/2026-10-28-assessment-progress-divider-and-retake-cancel-audit.md) records the open-canvas divider removal, current retake-cancel boundary, automated evidence, and remaining rendered-validation blocker.
- [Ordered RIASEC weights and SHS removal](note/2026-11-03-weighted-riasec-and-shs-removal.md) records the provisional 50% / 30% / 20% deterministic formula, shared Student tie ranks, separate entrance guidance, SHS removal, and historical-data boundary.
- [Programme-detail scroll reset](note/2026-11-04-programme-detail-scroll-reset.md) records the Student recommendation transition that opens programme details at the top of the document.
- [Student loading-skeleton alignment](note/2026-11-04-student-loading-skeleton-alignment.md) records the responsive My Matches, Explore Programs, and My Profile loading geometry plus active-module restoration after refresh.
- [Student profile form balance](note/2026-11-04-student-profile-form-balance.md) records the balanced desktop field grouping and responsive mobile order for the Personal & Academic editor.
- [Student protected browser history](note/2026-11-04-student-protected-browser-history.md) records route-backed Student section history, explicit-only sign-out behavior, Google launch-history handling, and the remaining live-provider verification.
- [Student ID number and learning-profile removal](note/2026-11-16-student-id-and-learning-profile-removal.md) records the end-to-end profile audit, required eight-digit ID contract, removal of the Learning Profile & Strengths workflow and storage, migration boundary, and validation evidence.
- [Split-name registration and email verification](note/2026-11-16-registration-email-verification.md) records the name-contract migration, strict email validation, signed ownership verification, resend behavior, protected-access boundary, and validation evidence.
- [Assessment skipped-question recovery](note/2026-11-16-assessment-skipped-question-recovery.md) records the rapid-tap auto-advance race, missing-question navigator, final submission guard, and validation evidence.
- [Shared assessment result card](note/2026-11-16-shared-assessment-result-card.md) records the Student/Administrator scroll repair, clearer score layout, and full-card PNG download behavior.
- [Dense programme tie ranking](note/2026-11-16-dense-programme-tie-ranking.md) records consecutive displayed programme positions after exact ties, new-run persistence, legacy-snapshot presentation, and validation evidence.
- [Student sign-in subtitle alignment](note/2026-11-16-student-sign-in-subtitle-alignment.md) records the simplified supporting copy in the public Student authentication modal.
- [Editable Student account names](note/2026-11-16-editable-student-account-names.md) records the Student-owned split-name update contract, atomic persistence, authenticated-shell refresh, and historical-evidence boundary.
- [Shared toast feedback and Student header identity](note/2026-11-16-shared-toast-and-student-header-identity.md) records centralized transient notifications, inline-success removal, and immediate visible name refresh beside the Student profile control.
- [Selected Administrator recommendation programme routing](note/2026-11-17-admin-recommendation-programme-routing.md) records the recommendation-to-programme detail route repair and validation evidence.
- [Clone and local setup guide](note/2026-10-28-clone-and-local-setup-guide.md) records the current clone-to-running PowerShell onboarding guide and its verification boundaries.
- `cmo/` contains locally reviewed CHED programme-standard evidence.
- `pdf/` contains the capstone paper and historical roadmap sources.
- `../PSG_Informed_RIASEC_Classification.xlsx` is the repository-owner-supplied analytical matrix. Its RIASEC classifications remain proposed, not official CHED or psychometric classifications.

Documentation folders are created only for active material. Framework-owned migrations, tests, and runtime assets remain inside `apps/api` and `apps/web` instead of being duplicated at the repository root.
