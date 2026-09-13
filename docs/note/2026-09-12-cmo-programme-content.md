# CMO-sourced programme content

**Status:** IN PROGRESS  
**Date:** 2026-09-12  
**Scope:** Student-facing programme descriptions, learning areas, career directions, and source disclosure

## Implemented source boundary

The guidance dataset now records field-level provenance. Programme descriptions, learning areas, learning-area explanations and topics, career directions, and the factual readiness note may be marked `ched_psg_sourced` only when an exact local CHED programme standard was reviewed. Recommended SHS strands remain proposed preparation guidance; admission requirements remain TCC-controlled; RIASEC profiles remain researcher-proposed analytical classifications and are not CHED-issued codes.

The following seven exact matches were rewritten from the local CMO documents:

- BS Information Technology - CMO No. 25, s. 2015
- BS Business Administration major in Financial Management - CMO No. 17, s. 2017
- BS Hospitality Management - CMO No. 62, s. 2017
- Bachelor of Elementary Education - CMO No. 74, s. 2017
- BS Midwifery - CMO No. 3, s. 2023
- Bachelor of Library and Information Science - CMO No. 24, s. 2015
- BA Sociology - CMO No. 40, s. 2017

Each record stores its source name, official source URL, repository document path, cited article and sections, and reviewed pages. Student programme and recommendation details and the Administrator programme detail sheet expose the programme-content source separately from the duration source.

## Explicit gaps

- **PENDING LOCAL CMO:** BS Criminology, Bachelor of Secondary Education, and Bachelor of Physical Education reference CMOs that are not currently stored in `docs/cmo`; their existing descriptions remain proposed.
- **PENDING EXACT PSG:** No exact BS Community Development programme standard is stored in `docs/cmo`. Its content must not be inferred from Sociology or the general SHS career-learning material.

## Validation evidence

- Guidance JSON parse: passed; version `GUIDANCE-CMO-2026-03`, 11 programme records.
- Laravel focused unit and feature tests: 15 passed, 378 assertions.
- Focused Student programme and recommendation Vitest files: 22 passed.
- Frontend ESLint: passed.
- Frontend TypeScript and production Vite build: passed.
- Local runtime override check: zero published catalogue configurations, so the repository guidance file is the active programme-content source in the current local database.

## Remaining evidence and next action

Real-browser desktop/mobile, keyboard, overflow, console, and rendered-contrast verification remains pending. Obtain and locally review the exact Criminology, BSEd, and BPEd CMOs and an authoritative BS Community Development source before replacing the remaining four proposed records.
