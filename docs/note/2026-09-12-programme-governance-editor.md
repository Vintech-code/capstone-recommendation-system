# Programme governance editor

**Status:** COMPLETED  
**Date:** 2026-09-12  
**Scope:** Administrator programme-management sheet and catalogue publication boundary

## Decision

The former free-form programme editor was too broad after adopting local CHED CMOs as the source for programme content. The ordinary Administrator workflow now treats programme identity, recorded majors, CMO-grounded descriptions and learning content, CMO career directions, source metadata, entrance grouping, and RIASEC profiles as protected facts.

Administrators may manage only the fields owned by the student-enrichment workflow:

- proposed SHS preparation strands and explanatory guidance;
- reviewed ESCO occupation mappings;
- programme cover and logo media; and
- media crop and position settings.

A source-controlled correction is not a routine content edit. It requires an updated authoritative source and a new controlled catalogue version. The current implementation does not fabricate a separate approval role or unsupported correction policy.

## Publication safeguard

The catalogue draft spans all programmes even when the sheet displays one programme. The interface now calls this a shared catalogue draft, reports the selected-programme and full-draft change scope, requires a before-and-after review before enabling publication, and confirms that publication applies to the full catalogue.

Laravel independently enforces the same boundary. Direct requests cannot replace protected fields, alter programme identifiers, or change catalogue membership. Published catalogue records are applied as enrichment overlays on the bundled source-controlled catalogue instead of replacing its authoritative facts.

## Validation

- Focused Laravel programme-publication and catalogue tests: 12 passed, 332 assertions.
- Focused Administrator React tests: 9 passed.
- Frontend ESLint: passed.
- TypeScript and Vite production build: passed.
- Focused Laravel Pint formatting check: passed.
- In-app browser connection: unavailable after retrying, so the repository Playwright fallback was used.
- Real-browser Chrome verification: desktop and Pixel 7 cases passed for protected-field visibility, editable-field availability, full-draft publication wording, keyboard focus containment, horizontal overflow, console errors, and serious/critical WCAG findings.
- The Playwright command required interruption after both cases reported `ok` because the runner did not exit cleanly; this occurred after the assertions completed and is not counted as a clean process-exit result.
