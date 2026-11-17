# Public landing mobile guidance reveal removal

**Status:** IN PROGRESS  
**Date:** 2026-11-17  
**Scope:** Public Student landing page only

## Approved change

The **What We Provide** section now renders its heading, supporting copy, four guidance items, and journey action without an intersection-observer reveal or staggered entry transition. This prevents the section from reserving a large apparently blank region on mobile while its content remains transparent.

Other landing sections retain their existing restrained motion and reduced-motion handling. Authentication, assessment, recommendation, programme catalogue, and Laravel behavior are unchanged.

## Evidence

- Focused landing component coverage passed: 2 tests.
- Focused ESLint passed for the landing component, component test, and public landing Playwright specification.
- Frontend architecture validation passed.
- The TypeScript and Vite production build passed.
- The focused mobile Chrome scenario passed with a clean runner exit, including visible static guidance content and no horizontal overflow.

The repository-wide ESLint command remains blocked by existing `react-refresh/only-export-components` errors in `configuration-diff-preview.tsx` and `admin-theme-context.tsx`, outside this landing-page slice. The full mobile landing suite also continues to report pre-existing primary-button contrast failures and intermittent setup/navigation timeouts.

## Remaining review

Perform a final manual mobile review of keyboard focus, console output, and rendered contrast. Resolve the independent landing-button contrast debt separately.

## Later motion revision

The repository-owner-approved 2026-11-17 differentiated-motion revision restores a transform-only **What We Provide** entry treatment without hidden opacity. The section remains visible before its intersection observer fires, preserving this repair's no-blank-space boundary while allowing a slower distinct transition.
