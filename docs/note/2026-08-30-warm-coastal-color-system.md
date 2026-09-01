# Warm coastal color system

**Status:** APPROVED working product direction; PROVISIONAL institutional identity; implementation IN PROGRESS.  
**Recorded:** 2026-08-30.  
**Authority:** Repository owner request to replace the reference-adjacent palette across the product.

## Decision

Replace the purple-led application identity with an original warm coastal system:

- deep teal `#0F6B66` for primary actions, focus, progress, and active navigation;
- warm oat `#F8F5ED` for the application canvas;
- warm white `#FFFDF8` for elevated surfaces;
- coral `#D96F52` as a restrained secondary accent;
- mineral slate `#23312F` and `#65736F` for foreground text;
- seafoam, sage, sand, clay, and mineral-blue support tones.

The palette is a repository-owner-approved working direction. It is not an official Tagoloan Community College identity.

## Assessment composition

The assessment uses an original compact progress summary: a numbered teal counter, factual answered/remaining text, and a slim progress track. Question navigation sits in a quiet sand-toned control band with outlined Previous, visible save status, and a rectangular primary Next action. This replaces the reference-like detached labels, lavender bar, and floating pill action.

The questionnaire contract remains unchanged: one stored statement, Agree or Do not agree, explicit selection, autosave, and stable Previous/Next navigation. Emoji supplement the visible response text and never replace it.

The final answer-review list is removed. **Finish assessment** now opens a full-page custom teal/coral calculation spinner with factual RIASEC scoring and eligible-programme comparison copy. The application waits for the backend's `result_available` state and then opens **My Matches**. Submission failures retain the recorded answers and return the Student to the final question with a visible recovery message.

## Validation boundary

Automated component, accessibility, lint, and production-build checks are required. The migration remains **IN PROGRESS** until desktop/mobile rendered browser checks confirm contrast, focus, overflow, zoom, reduced motion, and consistency across Student, authentication, and Administrator routes.
