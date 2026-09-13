# Compact Administrator Grid.js redesign

**Status:** COMPLETED  
**Recorded:** 2026-09-11  
**Scope:** Administrator presentation and Student records rendering

## Decision

Administrator screens use a denser operational hierarchy than Student and public pages. Page and section titles are reduced, routine copy is 12–14px, main gutters and section gaps are tightened, and routine Admin surfaces use the 2px `rounded-xs` radius. Circular identity and icon controls remain valid exceptions.

The desktop Student records ledger now uses Grid.js core through a focused React lifecycle wrapper. The official React adapter was excluded because its current package fails at runtime with this repository's React 19 setup. Grid.js renders the current server page; Laravel continues to own search, assessment-status and eligibility filters, sort direction, and pagination. Client-only Grid.js sorting, search, and pagination are intentionally disabled so the interface cannot present a misleading partial-data order.

The mobile Student record view remains the existing divided semantic list because a wide data grid is not suitable for narrow screens. Both presentations use the same server response and Student evidence contract.

## Boundaries

This redesign changes presentation density and desktop table rendering only. It does not change Administrator authorization, Student records, assessment evidence, recommendation availability, server filtering, or pagination contracts.

## Validation

- Focused Administrator Vitest suites: 9 tests passed.
- Frontend ESLint: passed.
- TypeScript and Vite production build: passed.
- Playwright desktop and mobile Administrator navigation checks: passed, including horizontal overflow, serious/critical WCAG findings, and console-error assertions.
- Playwright desktop and mobile Student evidence-dossier checks: passed after synchronizing the expected current dimension-label separator.
- Visual review of the generated desktop and mobile Student-ledger screenshots: passed.

## Known unrelated regression

The broader `admin-student-history-removal.test.tsx` suite still expects assessment reference `ASMT-000001`, which the previously simplified evidence dossier no longer renders. That existing contract mismatch is outside this presentation-density and Grid.js change.
