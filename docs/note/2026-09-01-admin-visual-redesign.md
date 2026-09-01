# Administrator visual redesign

**Status:** UPDATED for the owner-approved line-based reference direction on 2026-09-01; browser revalidation pending.

## Scope

Dashboard, Student records, Student detail, Reports, and Admin activity now use one evidence-led operational design. The redesign replaces repetitive card grids with connected journey rails, divided metric bands, a denser Student ledger, an immutable evidence timeline, factual aggregate graphics, and a chronological audit stream.

The latest owner review adds a visual Student-journey chart and completion ring to Dashboard, simplifies Reports to assessment and recommendation signals, removes the aggregate CSV action and catalogue-governance section, and reduces Activity rows to action, Administrator, and date. The separate catalogue-evidence screen and entry point are removed; its former URL redirects to Programme monitoring.

The follow-up owner direction retains the desktop sidebar, moves the Admin theme to a clean white canvas, and removes routine Admin card containers in favor of thin dividers, tables, split analytical regions, and timelines. The existing Laravel contracts, individual-account authorization, immutable completed records, aggregate-only reporting, programme eligibility ownership, and versioned governance rules are unchanged.

## Design boundary

- The Admin-only interface uses the owner-approved white, near-black, light-gray, and bright-green reference palette with Nunito Sans/Montserrat typography; Student and authentication themes remain unchanged.
- Visual hierarchy comes from scale, alignment, dividers, and restrained tone rather than cards.
- Admin controls use the existing shadcn primitives, including Button, Input, Select, Badge, Sheet, DropdownMenu, and Tooltip.
- Report graphics use only stored aggregate counts. RIASEC evidence remains exact raw data and is not normalized or interpreted in the browser.
- Desktop tables remain internally scrollable and mobile uses deliberate divided record rows.

## Validation

- Focused access and Administrator workspace tests: 16 passed.
- Frontend ESLint passed.
- TypeScript/Vite production build passed.
- Dashboard, Reports, and Activity were visually inspected in the repository Playwright Chrome environment at 1440 x 900 and Pixel 7 dimensions; chart hierarchy, mobile reflow, internal chart scrolling, simplified activity rows, and the retained sidebar/mobile Sheet were confirmed.
- Full desktop/mobile Playwright completion remains pending because the runner did not exit after beginning both project cases; the in-app browser was unavailable.
