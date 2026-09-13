# Minimalist clay green design system

**Recorded:** 2026-09-11  
**Decision:** APPROVED working product direction; PROVISIONAL institutional identity  
**Implementation status:** IN PROGRESS pending complete browser interaction review

## Direction

The repository owner approved a system-wide minimalist claymorphism direction based on the supplied visual reference, without copying its blue palette, branding, content, or artwork.

- Use `#7ED321` as the primary product green.
- Exclude blue from UI surfaces and semantic product tokens. Orange, violet, pink, yellow, olive, green, and neutral tones remain available through the shared system. Existing project imagery may retain its source colors without defining the interface theme.
- Use tonal surface separation, rounded geometry, a quiet border, and one white inset highlight to create clay depth.
- Limit every elevated product surface to `shadow-sm` (`0 1px 2px rgba(52, 64, 45, 0.12)`). Do not use medium, large, diffuse, stacked outer, glow, or card-hover elevation.
- Keep ghost and link actions flat. Pressed controls may use one shallow inset shadow.
- Preserve the Administrator workspace's line-led continuous-canvas structure; clay styling applies only to its existing controls, overlays, and exceptional surfaces.
- Third-party identity marks may retain their controlled brand colors when required.

## Implementation

- `DESIGN.md` version 4.0 is the visual authority.
- Root, Student, authentication, and Administrator semantic tokens share the new palette.
- Shared buttons, cards, selects, dialogs, sheets, popovers, chart tooltips, notifications, error states, and existing feature surfaces use no elevation above `shadow-sm`.
- The assessment response controls now use one valid green clay recipe. The conflicting former blue/green CSS layers were removed.
- Existing product uses of the legacy blue chart token and blue pathway badge were replaced by the semantic pink information tone. The legacy token name was removed.

## Boundaries

- No scoring, recommendation, eligibility, authentication, authorization, or API behavior changes.
- The supplied reference informs material character only. Its words, logo, blue background, hands, charts, and proprietary composition are not copied.
- Automated tests and builds do not establish rendered visual quality. Desktop/mobile, focus, contrast, overflow, reduced-motion, and console review must be recorded before completion.

## Validation evidence

- Focused theme, shared-button, assessment, dashboard, and recommendation coverage: 51 passed, 4 skipped.
- Broader affected coverage before the final assessment-progress simplification: 60 passed, 4 skipped.
- Full frontend suite: 128 passed, 4 skipped, and 1 failed. The remaining failure is the pre-existing Administrator detail assertion expecting assessment reference `ASMT-000001`; this visual-system change does not remove or change assessment records.
- Frontend ESLint: passed.
- TypeScript/Vite production build: passed.
- Static audit found no blue UI token, former blue shadow recipe, or product utility class in production source. The only retained blue is inside the externally controlled Google brand mark and existing source imagery.
- Local Chrome rendered the Student result route at desktop and mobile sizes. The screenshots show the green-neutral canvas, `#7ED321` active treatment, non-blue RIASEC UI palette, and restrained surface depth without document overflow.
- The broad Playwright suite remains stale in several workflow locators. The responsive smoke test stops at the removed `student-dashboard-summary` test ID before its keyboard/contrast/print assertions; programme career-direction and PSGC location flows passed on desktop and mobile. Complete route-by-route focus, reduced-motion, console, and interaction review therefore remains pending.
