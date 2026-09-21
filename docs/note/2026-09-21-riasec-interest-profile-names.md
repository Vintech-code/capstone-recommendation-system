# RIASEC interest-profile names

**Status:** IMPLEMENTED with automated validation; rendered browser review remains pending  
**Methodology status:** PROPOSED presentation guidance; not a personality diagnosis or psychometric interpretation  
**Date:** 2026-09-21  
**Version:** `PSG-PROFILE-NAMES-2026-09-21-V2`

## Decision and scope

The repository owner approved concise two-word interest-profile names and exact two-sentence descriptions for Student results, anchored to the 11 distinct ordered programme codes in `PSG_Informed_RIASEC_Classification.xlsx`. The names summarize recorded vocational-interest combinations and do not claim personality, aptitude, intelligence, likely success, admission, or institutional or psychometric approval.

The workbook codes are programme profiles, while a Student result can be any of 120 ordered combinations of three distinct RIASEC dimensions. Version 2 preserves the 11 workbook-controlled names and descriptions below, then derives unique presentation copy for the other 109 valid Student codes from the ordered primary, secondary, and tertiary RIASEC meanings. This extension does not classify additional programmes or represent the other 109 Student combinations as PSG-issued programme profiles.

## PSG-controlled presentation overrides

| Code | Name | Description |
| --- | --- | --- |
| `ECI` | Strategic Organizer | You enjoy taking initiative, organizing details, and turning ideas into clear plans. You often thrive when leading decisions, working with information, and solving practical business problems. |
| `ESC` | People Coordinator | You enjoy bringing people together and keeping shared activities organized. You often thrive in service-focused settings that involve leadership, communication, and dependable routines. |
| `IRS` | Practical Investigator | You enjoy examining problems, gathering evidence, and finding solutions that work in the real world. You often thrive in hands-on situations where careful inquiry can protect, guide, or support others. |
| `IRC` | Systems Solver | You enjoy understanding how systems work and fixing problems through logical, hands-on action. You often thrive with technology, structured processes, and tasks that reward accuracy and persistence. |
| `CIS` | Information Steward | You enjoy organizing information, investigating details, and making knowledge easier for others to use. You often thrive in structured environments that value accuracy, research, and helpful service. |
| `SAC` | Creative Guide | You enjoy helping others learn through imagination, expression, and thoughtfully organized activities. You often thrive when creativity and careful planning come together to support people's growth. |
| `SRE` | Active Motivator | You enjoy encouraging people through movement, teamwork, and practical participation. You often thrive when coaching, leading activities, and inspiring others to take action. |
| `SAI` | Insightful Mentor | You enjoy helping others learn through creative communication, reflection, and thoughtful inquiry. You often thrive when language, ideas, and personal guidance come together. |
| `SIE` | Civic Strategist | You enjoy helping people understand social issues and work toward shared goals. You often thrive when research, discussion, and leadership can strengthen a community. |
| `ISA` | Social Researcher | You enjoy investigating how people, groups, and communities interact and change. You often thrive when careful research and creative interpretation reveal meaningful human stories. |
| `SIR` | Care Practitioner | You enjoy supporting others through attentive care, careful assessment, and practical action. You often thrive in hands-on situations that require compassion, sound judgment, and responsibility. |

## Implementation

- One assessment-owned typed mapping accepts compact and hyphenated codes, covers all 120 ordered combinations of three distinct dimensions, and rejects invalid or repeated combinations.
- Every generated name contains exactly two words, is unique across the 120 valid codes, and uses all three ordered dimensions: the primary dimension supplies the role while the secondary-tertiary pair supplies its style.
- The main recommendation result hero shows the mapped two-word name and two-sentence description.
- The printable/shared assessment result card shows the same versioned copy.
- The Student dashboard identifies the current result by the same profile name while retaining the recorded top code and dimension labels.
- Scoring, code ordering, recommendation matching, APIs, stored results, and historical snapshots are unchanged.

## Validation

- Focused Vitest: 4 files passed; 32 tests passed and 4 skipped.
- Full frontend Vitest: 30 files passed and one unrelated theme test file failed; 157 tests passed, 4 skipped, and the existing background-token expectation failed.
- Focused changed-file ESLint passed.
- Strict standalone TypeScript checking passed for the profile-copy module.
- Full frontend ESLint is blocked by unrelated Fast Refresh export violations in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`.
- The production TypeScript/Vite build is blocked by an unrelated duplicate JSX attribute in `admin-dashboard-page.tsx`.
- The architecture check passed.
- Playwright was not rerun for version 2. Earlier full-browser validation remains blocked by unrelated Admin workflow failures and a stale Student workflow image expectation.
- The in-app browser was unavailable. Manual desktop/mobile, keyboard, overflow, console, contrast, zoom, and reduced-motion evidence remains pending, so this UI slice is not marked COMPLETED.
