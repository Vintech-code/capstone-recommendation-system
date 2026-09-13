# Multiple career directions and ESCO enrichment

**Status:** COMPLETED implementation; PROPOSED occupation mappings until Administrator review and publication  
**Date:** 2026-09-06  
**Owner:** Capstone team

## Decision

Student recommendation and programme-detail screens show every configured local career direction instead of presenting the first entry as a singular career field. These directions remain attached to recommended programmes; they are not calculated directly from a Student's RIASEC result.

Administrators can search the European Commission ESCO web-service API from the programme catalogue editor and deliberately attach occupation records to a versioned catalogue draft. The Laravel backend owns the external request, validation, caching, role authorization, snapshot propagation, and publication boundary. React never calls ESCO directly.

## Evidence boundary

- Local career directions remain researcher-proposed programme guidance.
- Imported ESCO title, description, code, ISCO group, and selected essential-skill labels are external reference facts captured with retrieval time and the configured pinned taxonomy version (initially `v1.2.0`).
- A mapping has `proposed` review status and is not shown to Students until its catalogue version is published.
- ESCO does not change entrance eligibility, RIASEC scoring, programme profiles, recommendation percentages, or ranking.
- Student copy describes careers as possible directions and explicitly avoids employment, suitability, admission, and success guarantees.

## Operational behavior

- Administrator search and detail endpoints require an active Administrator account, validate inputs, use request throttling, retry short-lived failures, and cache ESCO responses.
- Existing catalogue versions without ESCO data remain compatible and continue showing their local career-direction lists.
- Published recommendations snapshot ESCO mappings with other programme guidance so historical records remain explainable.
