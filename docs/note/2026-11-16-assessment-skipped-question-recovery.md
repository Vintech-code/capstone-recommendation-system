# Assessment skipped-question recovery

**Status:** IN PROGRESS  
**Date:** 2026-11-16  
**Owning domain:** Student assessment session

## Audited cause

Each answer selection previously created an independent delayed auto-advance callback. Rapidly selecting two response options before the first delay completed could leave two callbacks pending, advancing from question 1 to question 3 and making question 2 difficult to notice.

## Implemented behavior

- The assessment hook owns one auto-advance timer. A later rapid selection cancels the earlier timer, and the callback advances only when the Student is still on the question that scheduled it.
- Manual Previous, Next, and missing-question navigation cancel any pending auto-advance callback.
- The progress region shows a compact alert only when unanswered questions exist behind the current position. Each listed question number is a labelled button that moves directly to that item.
- On the final question, incomplete sessions show **Review n unanswered** instead of **Finish assessment** and return to the first missing question.
- The server's authoritative all-questions-required submission validation remains unchanged.

## Validation evidence

- Full assessment component suite: 21 passed, including rapid selection, missing-question navigation, normal auto-advance, and successful completion.
- Playwright desktop and mobile Chrome: 2 passed for restored skipped-question navigation, rapid-tap single advance, and horizontal-overflow checks.
- Changed-file ESLint, frontend architecture check, production build, and `git diff --check` passed. The production build retained its existing large-chunk advisory.

## Remaining evidence

- Manual touch-device, keyboard-focus, sticky-region, console, and rendered-contrast review remain pending.
