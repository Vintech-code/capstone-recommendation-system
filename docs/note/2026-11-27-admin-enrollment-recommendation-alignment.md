# Administrator enrollment and recommendation alignment

**Status:** IN PROGRESS because repository-wide frontend lint retains unrelated pre-existing failures; the reporting slice itself is validated.  
**Date:** 2026-11-27.  
**Owner:** Administrator reporting and Student enrollment domains.

## Adviser-directed reporting need

Administrator Reports must show how many Students enrolled in their Rank #1 recommended programme and, when a verified enrollment differs, which programmes those Students actually enrolled in.

The stored evidence supports observed alignment only. A verified COR establishes the enrolled programme, but it does not prove that the recommendation caused the Student's decision. Interface and documentation language therefore use **matches the Rank #1 recommendation** rather than **enrolled because of the recommendation**.

## Implementation boundary

- The report keeps one latest recommendation run per Student inside the selected recommendation-generation date range.
- Only Administrator-verified COR enrollment records count as enrolled. Pending, rejected, or missing records remain **No verified enrollment**.
- The headline metrics show verified enrollments matching Rank #1, all verified enrollment records, verified enrollments in another programme, and records without verified enrollment.
- Each Rank #1 programme row shows recommendation count, verified enrollment count, matching enrollment count, different-programme count, exact alternative programme destinations with counts, unallocated count, and alignment rate.
- Laravel derives every count from stored recommendation snapshots and enrollment records. React only presents the aggregate response.
- No Student name, ID, email, account identifier, recommendation-run identifier, or COR file reference is returned in this report.

## Validation evidence

- `php artisan test --filter=StudentEnrollmentTest`: passed 4 tests and 39 assertions.
- Complete Laravel suite: passed 155 tests and 1,358 assertions.
- Focused Administrator frontend suite: passed 9 tests.
- Focused changed-file ESLint, Laravel Pint, frontend architecture check, and frontend production build: passed. The build retains the existing large-chunk warning.
- Targeted desktop and mobile Chrome workflow: passed 2 projects with no serious or critical Axe findings, no captured console errors, and no page-level horizontal overflow. The mobile detail table remains intentionally horizontally scrollable and keyboard-focusable.
- Repository-wide frontend lint remains blocked by unrelated existing errors in `admin-cor-notification-banner.tsx` and `student-enrollment-modal.tsx`, plus an existing React Compiler warning in `student-registration-form.tsx`.

