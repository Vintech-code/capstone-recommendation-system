# ADR-001: React Responsive Web Frontend and UI System

**Purpose:** Decide the frontend application type, styling system, component base, form/API state tools, and organization.  
**Status:** APPROVED on 2026-07-26 through explicit user confirmation.  
**Basis:** Proposal web scope; roadmap React adaptation; existing React/Vite/TypeScript scaffold; user-supplied final frontend UI and styling decision.  
**Owner:** Adviser/client approves; capstone frontend lead implements.  
**Last updated:** 2026-07-27.  
**Related IDs:** D-001, NFR-01, R-007, OQ-013.  
**Open questions:** Browser support and official TCC branding remain provisional under OQ-012; wrapper delivery remains OQ-014.

## Context

The proposal lists HTML, CSS, JavaScript, Bootstrap, and Laravel, while an architecture narrative mentions web/mobile. The roadmap was specifically prepared for a React web application and the repository already contains a React/Vite/TypeScript scaffold.

## Decision

Use:

- React + Vite + TypeScript
- Tailwind CSS v4 through the official `@tailwindcss/vite` plugin
- shadcn/ui with Radix as its explicit component base
- Lucide React for icons
- React Hook Form + Zod for forms and validation
- TanStack Query for API state
- TanStack Table for complex applicant and report tables
- React Router for client-side routing

Deliver one responsive web application as the authoritative feature implementation. Mobile distribution may wrap that same web build under ADR-005; a separate native Android/iOS feature codebase is OUT OF SCOPE.

Do not use Bootstrap, Material UI, Chakra UI, Ant Design, plain CSS as the primary styling system, or multiple competing component libraries.

## Component organization

```text
src/components/ui/                 Generated and customized shadcn/ui primitives
src/components/shared/             Reusable application-level components
src/features/<feature>/components/ Components used by one business module
```

Shared application components include `PageHeader`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmActionDialog`, `CollectionToolbar`, and `DataTableToolbar`. The collection toolbar is the general search/filter surface; the table toolbar is a specialized wrapper for dense comparison tables.

Use Tailwind utility classes for layout, spacing, responsive behavior, typography, borders, shadows, interaction states, and focus indicators. Limit global CSS to `@import "tailwindcss"`, CSS variables/theme tokens, global body defaults, font declarations, print styles, and rare rules that cannot reasonably be expressed with utilities.

## Initial component set

Start with Button, Card, Input, Field, Label, Textarea, Select, Checkbox, Radio Group, Alert, Alert Dialog, Dialog, Sheet, Dropdown Menu, Badge, Breadcrumb, Progress, Separator, Skeleton, Tabs, Table, Pagination, Popover, Calendar, Command, Sidebar, Tooltip, and Sonner. Add components only when an approved feature needs them.

The application shell uses Sidebar on desktop, Sheet on mobile, Breadcrumb for location, Dropdown Menu for the user menu, cards/badges for dashboard status, Skeleton for loading, Alert for errors/blockers, and Sonner for non-critical notifications.

## Accessibility and branding

- Do not communicate status through color alone.
- Label every form input accessibly.
- Give every dialog an accessible title and description.
- Require keyboard navigation and visible focus.
- Keep tables usable on smaller screens.
- Prefer semantic HTML before ARIA.
- Do not invent TCC colors, logos, or typography. Use neutral PROVISIONAL tokens until TCC approves its visual identity.

## Consequences

- Complex forms and server state have explicit libraries and test boundaries.
- The component hierarchy prevents primitives, shared application patterns, and feature-specific components from becoming entangled.
- Tailwind utilities are the primary styling mechanism; global CSS remains deliberately narrow.
- Laravel remains responsible for security and domain rules; React must not become the authority for protected decisions.
- Existing dependency versions are not approved by this ADR and must be reviewed before implementation.
- Mobile browser and selected-wrapper accessibility/responsiveness are required; native feature duplication is prohibited.

## Alternatives

- Bootstrap-rendered Laravel pages: closer to proposal wording but conflicts with the requested React baseline.
- Plain CSS as the primary styling system: rejected to keep design tokens, responsive behavior, and component styling consistent.
- Material UI, Chakra UI, or Ant Design: rejected to avoid competing abstractions and visual systems.
- Separate native mobile implementation: rejected for scope, divergence, and delivery risk. A thin non-native wrapper is governed by ADR-005.

Approval is recorded as D-001 in the [Decision Register](../18-DECISION-REGISTER.md). Related: [System Architecture](../07-SYSTEM-ARCHITECTURE.md).
