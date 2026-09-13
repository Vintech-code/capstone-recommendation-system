# Assessment progress and recovery navigation

**Status:** COMPLETED  
**Recorded:** 2026-09-11  
**Scope:** Student assessment presentation and navigation only

## Decision

The assessment progress summary is a compact open-canvas strip directly below the application header. It has no white card, outer radius, or elevation. A thin green progress track, current-question label, percentage, and answered/remaining counts provide the same accessible progress information with less vertical space.

Question navigation remains visible at the viewport bottom. Selecting Agree or Do not agree still saves and automatically advances. If a Student uses Previous to revisit an already answered non-final question, a Next button is available so the Student can continue without changing the recorded answer. The final answered question continues to expose Finish assessment.

Response choices retain native radio semantics. Pointer and keyboard activation produce a short green click pulse, with animation disabled by the reduced-motion preference. The independently stateful feedback is isolated in `AssessmentChoice` rather than added to the session workflow component.

## Validation

- Focused Student assessment tests: 17 passed.
- Frontend lint: passed.
- TypeScript and production build: passed.
- Desktop and mobile Chrome assessment workflows: passed. Both viewports kept the question navigation visible, completed the auto-advance flow, and passed the Previous-to-Next recovery path.
- Desktop and mobile assessment screenshots: reviewed with no horizontal overflow visible; the progress treatment is open-canvas and the bottom navigation remains in the viewport.

## Boundaries and risk

This slice does not change the questionnaire, binary answer values, scoring, persistence contract, automatic advance behavior, or recommendation policy. Sticky behavior still depends on the existing application-header height tokens; future header-height changes must re-run the desktop/mobile assessment workflow.
