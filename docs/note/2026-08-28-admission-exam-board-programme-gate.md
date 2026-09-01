# Admission examination and board-programme gate

**Status:** APPROVED by the repository owner on 2026-08-28; implementation in progress.  
**Recorded:** 2026-08-28.  
**Rule reference:** `SELF-DECLARED-TCC-ENTRANCE-2026-01`.

## Requested workflow

The proposed workflow requires a Student Applicant to have an entrance-examination result before starting the RIASEC assessment. The result would place the applicant in a board-programme or non-board-programme eligibility group, and RIASEC matching would rank programmes only inside that eligible group.

## Evidence-backed programme grouping

A 2025 Tagoloan Community College publication describes these institutional groups:

- Board programmes: College of Education, Library and Information Studies, Justice and Public Safety, and Midwifery.
- Non-board programmes: Business Administration, Arts and Sciences, Hospitality Management, Information Technology, and Engineering Technology.

Mapped to the current versioned application catalogue, the proposed classification is:

| Group | Current catalogue programmes |
| --- | --- |
| Board | Bachelor of Elementary Education; Bachelor of Secondary Education; Bachelor of Physical Education; Bachelor of Library and Information Science; BS Criminology; BS Midwifery |
| Non-board | BS Information Technology; BS Business Administration; BS Hospitality Management; BS Sociology; BS Community Development |

PRC materials independently show licensure-examination paths for criminology, librarianship, midwifery, BEEd/BSEd, and Bachelor of Physical Education.

## Sources reviewed

- TCC student publication, *Paukam 2024-2025 Edition*: https://cdnc.heyzine.com/files/uploaded/v3/0381ad72255311df99fe359a24b4a9293ae2f2f0-12.pdf
- ALCUCOA accreditation visit programme list for TCC: https://www.alcucoa.com/read-news.php?id=25
- PRC licensure examination requirements: https://www.prc.gov.ph/list-of-requirements
- PRC-CHED LEPT alignment guidelines, including BPEd: https://www.prc.gov.ph/index.php/article/guidelines-implementation-prc-ched-jmc-alignment-lept-teacher-education-curriculum
- Surviving repository reference, `docs/reference/React_Capstone_System_Roadmap.pdf`.

## Approved decision

No public CHED or TCC source located in this review defined the decimal entrance-examination cutoff. The repository owner therefore approved the following project rule on 2026-08-28; it must not be represented as CHED- or TCC-published policy:

- The result is self-declared by the Student Applicant; no Administrator verification is used.
- Scores from 1.0 through 2.5 are eligible for the board-programme group.
- Scores from 2.6 through 5.0 are eligible for the non-board-programme group.
- Programme-group eligibility is applied before RIASEC ranking, so recommendations contain programmes only from the eligible group.
- The declaration is required for first assessments and retakes. Existing in-progress sessions retain their answers but cannot continue until a declaration is attached.
- Once a declaration is attached to an assessment, it is immutable. The declaration and rule version are preserved with the assessment and recommendation history.

## Implementation boundary

- Store examination results separately from profiles and assessment answers, with admission cycle, scale/rule version, source, verification state, timestamps, and auditable corrections.
- Enforce the prerequisite and ownership rule in the Laravel API; frontend disabling alone is insufficient.
- Snapshot the examination-result and eligibility-rule versions used for each completed recommendation.
- Apply programme eligibility before RIASEC ranking, then explain both the academic eligibility group and the recorded RIASEC evidence without claiming guaranteed admission.
- Add backend authorization, validation, history, and recommendation tests plus frontend loading, empty, invalid, blocked, and responsive states.

## Implementation evidence

Implemented on 2026-08-28 with an append-only self-declaration record, assessment-session foreign-key snapshot, recommendation snapshot, server-enforced prerequisite, locked programme classification, and Student entry/result explanations.

On 2026-09-01, Student workspace prefetching was corrected to request the protected RIASEC questionnaire only after the entrance-examination endpoint reports a declared result. This preserves the server-enforced prerequisite and prevents an expected `409 Conflict` from being generated while an undeclared Student is viewing the entrance-result gate. Regression coverage verifies both the required and declared states.

- Laravel suite: 96 tests passed with 765 assertions.
- Additional post-suite governance and recommendation checks: 10 tests passed with 89 assertions.
- Frontend suite on 2026-09-01: 106 tests passed and 4 skipped across 15 files.
- Frontend lint: passed.
- TypeScript and production build: passed.
- Focused PHP formatting: passed.
- Real-browser desktop/mobile, keyboard, overflow, console, and rendered-contrast verification: pending because the in-app browser was unavailable. The UI portion remains IN PROGRESS until that evidence is recorded.
