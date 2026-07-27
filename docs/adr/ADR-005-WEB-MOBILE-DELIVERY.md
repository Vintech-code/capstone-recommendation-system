# ADR-005: Web-First Application with Non-Native Mobile Wrapper

**Purpose:** Define how the web-based system is delivered on mobile without creating a separate native application implementation.  
**Status:** APPROVED direction; wrapper technology and distribution are BLOCKED by OQ-014.  
**Basis:** User-confirmed system direction on 2026-07-27 and D-001 frontend architecture.  
**Owner:** Team/adviser approves scope; technical lead recommends the wrapper after environment validation.  
**Last updated:** 2026-07-27.  
**Related IDs:** D-001, D-008, OQ-014, NFR-01, NFR-09, TC-15, R-013.  
**Open questions:** OQ-014.

## Context

The product must remain web-based while presenting a mobile-app-like delivery. The team does not want a separate native Android/iOS feature codebase.

## Decision

- React/Vite remains the single presentation codebase.
- Laravel remains the single backend API.
- Browser and mobile-wrapper delivery use the same routes, forms, permissions, validation, and business workflows.
- Do not create native-only screens, duplicated business logic, or a second mobile feature roadmap.
- Platform-specific wrapper code is limited to packaging, navigation/deep-link integration, safe storage/session compatibility, downloads/sharing/printing compatibility, and other approved bridge concerns.

## Blocked implementation choice

Before adding a wrapper dependency or native project, approve one delivery method:

- installable Progressive Web App, if store packaging is not required; or
- a thin packaged web wrapper such as Capacitor, if an installable store/device package is required.

The decision must document Android/iOS targets, store distribution, offline expectations, authentication/cookie behavior, deep links, file downloads, report printing/sharing, notifications, update strategy, hosting/origin, privacy disclosures, testing devices, and whether native build tooling is acceptable.

## Consequences

- Feature parity is simpler because the responsive web build remains authoritative.
- Any packaged wrapper may still require platform projects, permissions, signing, store compliance, and native builds even though product features are web code.
- Authentication, downloads, printing, and external links require early proof-of-concept testing.
- Release checks must cover approved browsers and wrapper targets using the same release.

## Alternatives

- Separate React Native/Flutter/native application: rejected.
- Browser-only responsive web with no installable experience: does not satisfy the confirmed mobile-wrapper direction unless later approved as the chosen PWA delivery.

Related: [System Architecture](../07-SYSTEM-ARCHITECTURE.md), [Deployment Plan](../20-DEPLOYMENT-PLAN.md), [Open Questions](../22-OPEN-QUESTIONS.md).
