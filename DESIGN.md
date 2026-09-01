---
name: TCC Course Recommendation Design System
status: APPROVED working product direction; PROVISIONAL institutional identity
version: 2.4
last_updated: 2026-09-01
font_family: Nunito Sans headings / Montserrat body
theme: light
colors:
  background: '#F8F5ED'
  surface: '#FFFDF8'
  surface_subtle: '#EDF2EF'
  foreground: '#23312F'
  foreground_muted: '#65736F'
  border: '#D8E1DC'
  border_strong: '#C5D2CC'
  primary: '#0F6B66'
  primary_hover: '#0B5955'
  primary_pressed: '#084A47'
  primary_soft: '#DDF3EF'
  on_primary: '#FFFFFF'
  accent: '#D96F52'
  accent_soft: '#FBE8E1'
  success: '#2F7D5D'
  success_soft: '#E3F1E9'
  warning: '#9B6717'
  warning_soft: '#F5E9D3'
  danger: '#B64752'
  danger_soft: '#F8E7E9'
  info: '#356B8C'
  info_soft: '#E6F0F5'
radii:
  control: 12px
  nested: 16px
  card: 24px
  hero: 28px
  pill: 9999px
shadows:
  card: '0 8px 30px rgba(32, 67, 62, 0.07)'
  card_hover: '0 14px 38px rgba(32, 67, 62, 0.11)'
  overlay: '0 20px 60px rgba(32, 67, 62, 0.16)'
layout:
  content_max: 1200px
  reading_max: 720px
  desktop_gutter: 32px
  tablet_gutter: 24px
  mobile_gutter: 16px
---

# TCC Course Recommendation Design System

## 1. Authority and reference boundary

This file is the visual and interaction authority for the responsive TCC course-recommendation application. Version 2.1 replaces the reference-adjacent purple direction with an original warm coastal educational product language: deep teal, oat, coral, and mineral neutrals.

The repository owner approved this working direction on 2026-08-28. It is not an official Tagoloan Community College identity. Its palette, illustration style, typography, and product presentation remain **PROVISIONAL institutional branding** until institutionally approved.

The supplied screenshots informed composition, rhythm, hierarchy, shape, and interaction patterns only. Never copy their logo, characters, wording, course names, scores, proprietary artwork, or product identity. Implemented content must come from authenticated records, the controlled catalogue, and versioned assessment and recommendation rules.

When this file conflicts with approved business, security, accessibility, or data-integrity rules, the nonvisual rule wins. Never alter scoring, eligibility, authorization, or recommendation behavior to imitate a reference.

## 2. Product character and principles

The interface should feel like a calm, knowledgeable guide for a high-stakes student decision:

1. **Clarity:** one primary task or conclusion per section.
2. **Personality:** gentle color and illustration without game-like distraction.
3. **Friendly guidance:** direct, reassuring language and generous touch targets.
4. **Easy scanning:** concise headings, grouped evidence, and consistent anatomy.
5. **Visual storytelling:** illustration orients; recorded data carries meaning.
6. **Truthfulness:** every result, count, percentage, status, and reason is backed by stored evidence.
7. **Accessibility:** color never works alone; keyboard, screen reader, zoom, touch, and reduced motion are first-class.

The experience is light-only. A dark theme is out of scope for this direction. Existing dark-theme code may be retired only in a separately tested implementation slice; do not expand it or use it to shape new components.

## 3. Visual foundation

### 3.1 Color system

Use semantic CSS variables and Tailwind utilities. Do not scatter raw hex values through route or feature components.

| Role | Value | Use |
| --- | --- | --- |
| Canvas | `#F8F5ED` | Warm oat page background |
| Surface | `#FFFDF8` | Cards, dialogs, menus, and inputs |
| Subtle surface | `#EDF2EF` | Quiet grouped content and insets |
| Foreground | `#23312F` | Primary text and icons |
| Muted foreground | `#65736F` | Descriptions and metadata |
| Border | `#D8E1DC` | Default card and control outline |
| Strong border | `#C5D2CC` | Dividers and emphasized control outlines |
| Primary | `#0F6B66` | Primary actions, active navigation, focus, highlights |
| Primary hover | `#0B5955` | Hovered primary controls |
| Primary pressed | `#084A47` | Pressed primary controls |
| Primary soft | `#DDF3EF` | Selected controls and quiet highlights |
| Coral accent | `#D96F52` | Restrained emphasis and secondary visual rhythm |
| Success | `#2F7D5D` | Completed and successful states |
| Warning | `#9B6717` | Review or attention states |
| Danger | `#B64752` | Errors and destructive actions |
| Information | `#356B8C` | Neutral information and analytical data |

Muted tones support hierarchy without becoming a competing rainbow:

- Seafoam `#DDF3EF` for selected and guidance states.
- Sage `#E3F1E9` for completed steps.
- Sand `#F5E9D3` for gentle attention.
- Clay `#FBE8E1` for restrained accent surfaces.
- Mineral blue `#E6F0F5` for analytical information.

### 3.2 RIASEC mapping

Use one stable mapping wherever the six recorded dimensions appear:

| Code | Category | Indicator | Soft surface |
| --- | --- | --- | --- |
| R | Realistic | `#B65338` | `#FBE8E1` |
| I | Investigative | `#3D6F91` | `#E6F0F5` |
| A | Artistic | `#A84F72` | `#F7E6ED` |
| S | Social | `#3E7C61` | `#E3F1E9` |
| E | Enterprising | `#A36B16` | `#F7EDD8` |
| C | Conventional | `#5E668F` | `#EAEBF4` |

Always pair color with code, full name, score, and accessible label. These colors identify categories only; they never mean good, bad, passing, aptitude, or expected success.

### 3.3 Typography

Use bundled open-source **Nunito Sans Variable** for display headings and **Montserrat Variable** for paragraphs, controls, labels, and data. Keep `ui-sans-serif`, `system-ui`, and `sans-serif` fallbacks. Do not introduce proprietary fonts.

| Token | Desktop | Mobile | Weight | Use |
| --- | --- | --- | --- | --- |
| Display | 52/56px | 38/42px | 900 | Recorded result hero statement |
| Heading 1 | 40/48px | 30/38px | 800 | Page title |
| Heading 2 | 30/38px | 26/34px | 700 | Major section |
| Heading 3 | 22/30px | 20/28px | 700 | Card title |
| Body large | 18/30px | 17/28px | 500 | Hero description |
| Body | 16/27px | 16/26px | 500 | Default copy |
| Label | 14/20px | 14/20px | 700 | Buttons and fields |
| Overline | 12/16px | 12/16px | 700 | Rank and category labels |
| Caption | 14/20px | 14/20px | 500 | Timestamps and helpers |

Use sentence case. Reserve uppercase for short overlines with `0.10em` tracking. Result hero headings use Nunito Sans at weight 900, tight but readable line height, and restrained negative tracking to create the bold reference-inspired treatment without copying its archetype wording. Result summaries, score labels, evidence copy, metadata, and recommendation explanations use the body, label, or caption tokens above rather than 10–12px utility text. Keep prose near 65 characters per line. Primary teal may emphasize one key idea in a heading, not multiple competing phrases.

### 3.4 Spacing and grid

Use a 4px primitive scale with layout rhythm aligned mainly to 8px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.

- Content maximum: `1200px`; reading maximum: `720px`.
- Gutters: `32px` desktop, `24px` tablet, `16px` mobile.
- Section gap: `64px` desktop, `48px` tablet, `40px` mobile.
- Card padding: `32px` desktop, `24px` tablet/mobile.
- Compact card padding: `24px` desktop, `20px` mobile.
- Student page entry rhythm: `16px` mobile, `24px` from `sm`.
- Grid: 12 desktop columns/24px gap; 8 tablet/20px; 4 mobile/16px.

Use one strong alignment line. Center page titles, short prompts, and empty states; left-align long copy, results, tables, and explanations.

### 3.5 Shape, border, and elevation

- Primary cards: 24px radius, 1px semantic border, white surface, soft shadow.
- Hero/result cards: 28px radius.
- Nested panels: 16px radius and subtle surface; never nest more than one level.
- Inputs and buttons: 12px radius.
- Badges and progress tracks: full pill radius.
- Icon-only controls: circular only with a clear accessible name.

Default shadow: `0 8px 30px rgba(32, 67, 62, 0.07)`. Interactive cards may rise at most 2px and use `0 14px 38px rgba(32, 67, 62, 0.11)`. Avoid hard shadows, glassmorphism, thick outlines, and excessive elevation.

Subtle card borders are part of this revision. Use spacing, tone, or dividers for internal structure so every block does not become another bordered card.

### 3.6 Icons and illustrations

Use Lucide React for functional icons, normally 18–22px with consistent line weight. Ambiguous icons require visible or assistive labels.

Illustrations must be original or properly licensed flat/vector-style assets with inclusive rounded characters, simple shapes, limited detail, quiet outlines, generous transparent space, and at most one soft gradient or glow. Favor educational activities, exploration, making, analysis, community, and study.

Avoid realistic photography, copied reference characters, other products' mascots, heavy gradients, 3D chrome, dark scenes, generic AI sparkles, and art that implies an unsupported personality or career conclusion. Existing photographic presentation assets should migrate separately to approved vector art; until then, they remain decorative and never serve as evidence.

## 4. Responsive application shell

### 4.1 Student top navigation

Use one sticky light top bar, not a sidebar:

- 72px desktop and 64px mobile height.
- Warm canvas/white background at 92–96% opacity with a subtle bottom divider.
- Left: context-aware Back or Home action.
- Center: page title visually centered independently of side widths.
- Right: real notification control and authenticated identity.
- Keep one row on mobile; use icons with accessible names and tooltips when labels do not fit.

The identity control shows uploaded photo, then verified Google avatar, then recorded-name initials. Unread counts come only from the authenticated API.

The application uses no global page footer. Keep route content focused within its shell and place any required support, policy, or institutional information in an explicit, functional destination instead of repeating it beneath every page.

### 4.2 Administrator shell

Administrator governance retains the collapsible desktop sidebar and uses a shadcn Sheet on mobile. Dashboard, Students, Programmes, Reports, and Activity remain in the sidebar; the former Assessments destination redirects to Students and is not listed. Each Administrator has an individual account.

Admin content uses one plain continuous canvas. Thin horizontal and vertical dividers, tables, split analytical regions, timelines, and whitespace define hierarchy. Do not wrap routine metrics, filters, table groups, evidence fields, or audit entries in cards. Reserve rounded surfaces for shadcn overlays and controls that require them. For Admin only, use the owner-approved reference palette of white, near-black, light neutral gray, and restrained bright-green data accents; never copy reference branding, financial data, proprietary assets, or irrelevant labels.

### 4.3 Breakpoints

- Base: one-column composition.
- `sm` 640px: two-column catalogue cards where readable.
- `md` 768px: expanded labels and selected two-column content.
- `lg` 1024px: result split and collapsible Administrator desktop sidebar.
- `xl` 1280px: maximum content width; do not keep stretching lines.

No horizontal document scrolling is permitted at 320 CSS pixels. Support 200% text zoom and WCAG-required 400% reflow.

## 5. Shared components

### 5.1 Buttons

- **Primary:** deep-teal fill, white label, 12px radius, 44px minimum height.
- **Secondary:** white, strong-neutral border, foreground label.
- **Tertiary:** text or soft seafoam for low-emphasis navigation.
- **Danger:** only for genuinely destructive actions with confirmation.
- **Icon:** 44x44px minimum with tooltip and accessible name.

Hover increases contrast; active darkens slightly; disabled remains readable; loading preserves width and announces status. Color is never the sole state signal.

### 5.2 Inputs and forms

Use persistent labels. Floating labels are allowed only if they remain visible after entry and with browser autofill.

- 48px minimum height; multiline fields size to content.
- 1px strong-neutral border and 3px visible primary focus ring.
- Helper and error text sits below its field.
- Errors state the field, problem, and recovery.
- Number inputs show scale and accepted precision nearby.

### 5.3 Card variants

- **Standard:** white, subtle border, 24px radius, soft shadow.
- **Feature:** 28px radius with one controlled pastel area or illustration.
- **Compact:** reduced padding for timelines and mobile lists.
- **Interactive:** standard plus hover, focus, selected, and real action states.
- **Inset:** subtle surface, 16px radius, no shadow.

Cards are exceptional containers, not automatic wrappers. Prefer open-canvas composition, whitespace, alignment, and dividers. Do not place every result, list item, action group, or explanation inside its own card.

### 5.4 Badges and pills

- **Top fit:** solid primary for rank 1, with visible rank and label.
- **Category tag:** soft RIASEC color, code, and full category.
- **Evidence pill:** soft seafoam and primary text, only for recorded/configured evidence.
- **Status badge:** semantic icon, label, and soft state color.

Use 28–32px height, 12–14px labels, and 12–14px horizontal padding. Wrap cleanly and avoid more than five pills in one row.

### 5.5 Progress

- Track: 8–10px, `#E9E7EA`, pill ends.
- Overall progress: deep teal; category progress: stable RIASEC mapping.
- Always show a label and exact value.
- Animate a known final value once; never make indeterminate work look measured.
- Circular progress is for compact overall completion and never replaces exact text.

### 5.6 Result Hero Card

The result hero gives a calm summary before detail.

- Desktop uses a 7/5 or 8/4 split.
- Narrative region: overline, large recorded result heading, short evidence-based description, code badge, and at most three evidence pills.
- Illustration region: bounded to roughly 280–360px and never obscures content.
- A quiet inset may list recommended paths or next actions from actual records.
- The Score Breakdown may sit beside the narrative as its own card.
- Mobile stacks illustration, title, description, evidence, and actions.

Do not label a Student with a fictional personality archetype unless the label and explanation belong to the approved versioned result model. Prefer recorded interest pattern names and codes.

### 5.7 Score Breakdown Card

Every RIASEC row contains code and full name, exact stored score with denominator or valid percentage, horizontal bar, and accessible value text. Use 16–20px row gaps. Align values on desktop and keep each beside its label on mobile.

A `Your recorded pattern` inset may show the stored top code and factual scoring note. Never infer personality, aptitude, intelligence, diagnosis, academic ability, or likely career success.

### 5.8 Recommendation Card

Use the reference-inspired split composition:

- Main region: rank overline, one rank badge, programme name, code/degree type, and configured summary.
- Summary region: exact match percentage, accessible bar, eligibility group, and disclosure action.
- A broad pastel shape may support top items but must remain readable and not encode an unofficial threshold.
- Expanded details show recorded scores, configured programme areas, catalogue learning areas, generation date, and rule version.

Display **Strong match**, **Good match**, or **Explore match** only if thresholds exist in a versioned approved backend configuration. Otherwise use **Recorded match** with the exact percentage. Never invent thresholds in frontend code.

Ranking is relative to eligible programmes in that recommendation snapshot. It is not an admission guarantee, enrolment decision, ability judgment, or promise of success. Board/non-board eligibility remains separate from RIASEC fit.

On mobile, place the summary below the title. Do not preserve a desktop shape if it clips text or creates large empty space.

### 5.9 Assessment Question Card

#### Current approved binary instrument

The production questionnaire presents one locally stored statement at a time with two full-size choices: **Agree** and **Do not agree**. Every statement requires an explicit response. Selected controls use a strong teal border, seafoam fill, check icon, and programmatic selected state.

The page includes top navigation, `Question n of total`, exact progress, a centered readable question, two 48px-minimum response controls, Previous/Next in a stable navigation region, and visible saving, saved, retry, and validation feedback. The last action is **Finish assessment**; do not insert a full answer-review list between the last question and result processing.

After Finish, replace the questionnaire with one full-page calculation state. Use a large custom two-tone teal/coral spinner, the factual heading **Calculating your programme matches**, a concise scoring/comparison explanation, and an accessible live status. Keep this state visible while the server reports `preparing_result`. Redirect to **My Matches** only after the authoritative assessment status is `result_available`. A processing or connection failure must preserve recorded answers and expose a retryable error instead of fabricating a result.

#### PROPOSED future comparison instrument

The screenshot-inspired two-activity comparison is documented only for a future approved questionnaire. It may show two illustrated activities with a central `or` and a rating group such as **Just okay**, **Great**, and **Love it** for each choice. Labels, levels, pairing, scoring, illustrations, mappings, and interpretation are **BLOCKED** until an instrument contract and validation evidence are approved.

If approved later, use real radio semantics, text labels in addition to emoji/icons, keyboard operation, visible selection, and a one-column mobile layout. Never add this as a visual layer over the current binary scoring contract.

### 5.10 Entrance Examination Gate

Before a first assessment or retake starts or continues, a Student without a declaration sees one focused Standard Card:

- labelled decimal input and **Save and continue** action;
- explicit self-declared, not Administrator-verified wording;
- project ranges 1.0–2.5 board-programme eligible and 2.6–5.0 non-board-programme eligible;
- group preview only after valid input;
- clear invalid, saving, saved, and retryable-error states;
- read-only evidence once attached to an assessment;
- explanation that eligibility filters the pool before RIASEC ranking and does not guarantee admission.

This is the project rule `SELF-DECLARED-TCC-ENTRANCE-2026-01`; never call it a CHED- or TCC-published cutoff.

### 5.11 Navigation, notifications, and overlays

Active navigation uses primary text plus a soft-seafoam fill or short underline and `aria-current`. Menus use a warm-white 16px surface, visible focus, and overlay shadow.

Notifications open as a compact anchored feed with real unread counts, All/Unread filters, event markers, timestamps, and explicit loading, empty, error, retry, unread, and read states. Selecting an unread item changes only that recipient's record and opens an authorized destination.

Use dialogs for short confirmations and sheets for focused editing or mobile navigation. Toasts may confirm transient success but never carry the only completion, permission, or failure explanation.

### 5.12 Tables and filters

Administrator tables sit directly on the plain canvas with top, bottom, header, and row dividers. On mobile, use divided record rows or a labelled internal scroll region, never card-per-record layouts or page overflow.

Filters use the existing compact single-open-section accordion. Closed rows expose selected counts. Search, sort, pagination, and reset actions operate on real data and define empty states.

## 6. Page patterns

### 6.1 Student dashboard

- Open with **Your academic journey** as eyebrow and one guidance heading; no duplicate title strip.
- Preserve the 16px mobile/24px desktop entry rhythm.
- Use an open hero canvas or Feature Card with original flat educational art, not a photograph.
- Place strongest programme direction, progress, and recorded interest pattern in a balanced two-column wide layout.
- Do not add a redundant completed-result card. Keep **View assessment result** and **Assessment history** near progress.
- Lifecycle cards appear only for actionable not-started, in-progress, preparing, or failure states.
- Never fabricate counts, testimonials, dates, social proof, or activity.

### 6.2 Assessment

- Keep one prerequisite or question at a time in a quiet reading width.
- Keep progress near the top and Previous/Next stable.
- Disable Next until an explicit required response exists.
- Preserve valid responses during navigation and restoration.
- Finish directly from the last answered question; omit the redundant answer-review list.
- Show the custom full-page calculation state until the server result is available, then open My Matches.
- Completed state shows recorded date, read-only status, result/match actions, and a separately confirmed retake when available.
- Opening Assessment from a completed result never creates a retake.

### 6.3 Results, recommendations, and history

- Begin with one open-canvas illustrated result narrative and at most one bordered Score Breakdown surface in a two-column desktop composition.
- Present ranked recommendations as one divided list; do not wrap every programme row in a separate elevated card.
- Follow with an open-canvas heading and ranked list at 20–24px gaps.
- Explain eligibility and RIASEC evidence as separate concepts.
- Explanations contain only assessment reference, stored scores/code, configured programme areas, catalogue learning areas, and versioned rules.
- History uses a compact attempt timeline beside the selected result; stack on mobile.
- Identify Current and Previous results and compare exact score differences without interpreting the change.

### 6.4 Programme catalogue and detail

- Use one column on narrow phones and two from `sm` when readable.
- Cards show only recorded imagery, name, code, degree type, duration availability, summary, and relevant evidence.
- Show recommendation rank once; matched codes stay in a labelled evidence group.
- Supported filters: field, RIASEC area, official duration availability, recommended SHS strand, and saved status.
- Distinguish institution-controlled facts, external-source facts, unavailable data, and recommendation evidence.

### 6.5 Student profile

- Use a strong identity header with authenticated image fallback.
- Place learning snapshot beside recorded-interest and career-direction areas on wide screens; stack on mobile.
- RIASEC scores and interests remain read-only.
- Label strengths, growth areas, and learning preferences as Student-reported.
- Editing remains an inline three-step flow with Previous/Next and final Save.
- Factual summaries never infer personality, intelligence, diagnosis, or success.

### 6.6 Authentication

Student and Administrator URLs remain separate; sign-in never asks the user to select a role. Use a split desktop layout with original flat educational art and a 520–560px credential surface; put the form first on mobile.

Apply deep teal to actions, links, and focus. Reuse one labelled field pattern. The global footer is omitted throughout the application, including full-screen authentication and session restoration. Student Google authentication appears only when its real development/testing flow is active. Administrator access uses individually provisioned credentials; social login never creates or infers a staff role.

### 6.7 Administrator workspace

- Use an operational column and narrower attention rail on wide screens.
- Dashboard charts use only recorded journey counts and clearly label zero values; the workload rail is limited to current assessment states and processing failures.
- Students and assessments remain one protected Students workflow.
- Programme editing uses a focused sheet with autosave state, manual recovery, preview, publication confirmation, and immutable history.
- Locked facts remain visibly and programmatically read-only.
- Reports are privacy-aware and limited to Student totals, assessment progress, completion history, eligibility distribution, recommendations, and programme saves. Do not expose CSV export or catalogue-governance sections in the Admin interface.
- Activity rows show the recorded action, responsible Administrator, and date without raw metadata, internal subject references, or generated summaries.
- Do not expose a separate catalogue-evidence page or entry point.
- Never show ambiguous `Top-three placements` or `Programme match frequency` labels.

## 7. States and language

Every data surface defines Loading, Refreshing, Empty, Error, Offline/timeout, Permission denied, Blocked, Saving, Success, and Disabled states as applicable. Skeletons match final geometry and never show fabricated values. Errors identify the failed task, preserve input, and offer recovery. Permission states reveal no protected data.

Use calm direct language: `Your result is ready`, `programme recommendation`, `recorded match`, `eligible programme group`, and `may help you explore`. Avoid `perfect course`, `you belong here`, `guaranteed`, `passed`, `officially approved`, and unverified career claims.

## 8. Motion

- Micro interaction: 120–160ms.
- Button/card: 180–220ms.
- Section/disclosure: 240–320ms.
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Hover lift: maximum 2px.
- Known progress fill: 400–600ms once on entry.
- Section entry: 8–12px rise with fade; no long-list staggering.

Under `prefers-reduced-motion: reduce`, remove transforms, progress animation, decorative motion, and nonessential fades. Animation never delays content.

## 9. Accessibility

- Target WCAG 2.2 AA contrast, keyboard operation, focus, names, roles, values, and error association.
- Minimum target 44x44px; prefer 48px for assessment choices.
- Keep focus visible against white and pastel surfaces.
- Preserve logical DOM and heading order when columns rearrange.
- Give progress bars min, max, current value, and accessible label.
- Use native-equivalent radio, checkbox, button, link, table, dialog, and navigation semantics.
- Announce async saving, completion, and errors without stealing focus.
- Emoji never acts as the only response label.
- Decorative art has empty alt text; informative art has meaningful alt text.
- Charts and colored data provide equivalent text or tabular values.
- Test keyboard, landmarks, 200% zoom, 400% reflow, touch targets, and reduced motion.

## 10. Implementation architecture

- React is presentation; Laravel remains the authoritative REST API.
- Use Tailwind CSS v4 via `@tailwindcss/vite`, shadcn/ui with Radix, and Lucide React.
- Store tokens as semantic CSS variables connected to Tailwind.
- Put primitives in `src/components/ui`, shared application components in `src/components/shared`, and feature composition in `src/features/<feature>/components`.
- Limit global CSS to Tailwind import, tokens, bundled font, body defaults, print, and rare global rules.
- Do not add a competing component library or a second plain-CSS design system.
- Use component variants; avoid copied class strings and unexplained arbitrary values.
- API authorization, ownership, validation, scoring, and eligibility stay server-side.

Recommended shared components: `AppTopBar`, `PageHeading`, `SurfaceCard`, `StatusBadge`, `EvidencePill`, `AccessibleProgress`, `EmptyState`, `ErrorState`, `ResultHero`, `RiasecScoreBreakdown`, `RecommendationCard`, `AssessmentChoice`, and `EntranceExamGate`.

## 11. Migration and validation

Implement in reviewable slices:

1. Semantic tokens and bundled typography.
2. Shared buttons, inputs, cards, badges, progress, focus, and states.
3. Student and authentication shells.
4. Entrance gate, binary questions, completion, and history.
5. Results, scores, recommendations, catalogue, and profile.
6. Administrator shell and operational modules.
7. Approved flat illustrations replacing photo-led presentation.
8. Obsolete theme/style removal after route verification.

Each slice requires affected component/content/accessibility tests, lint, production build, and real-browser desktop/mobile checks for keyboard focus, overflow, console, contrast, zoom, and reduced motion. Automated checks are not visual evidence.

## 12. Review checklist

- Warm oat canvas, deep-teal primary, restrained earth tones, and spacious hierarchy.
- Nunito Sans/Montserrat hierarchy, the Student 20–28px subtle-bordered surface family, and the Administrator line-led canvas exception.
- One dominant task/conclusion per section.
- Pastels remain accessible and never carry meaning alone.
- Data, labels, thresholds, and reasons come from approved stored evidence.
- Eligibility and RIASEC match remain separate.
- No reference branding, characters, wording, or proprietary art is copied.
- Current questionnaire still matches its backend contract.
- Desktop split layouts stack cleanly on mobile.
- Loading, empty, error, blocked, permission, saving, and success states exist.
- Keyboard, touch, zoom, screen reader, focus, contrast, and reduced motion are verified.
- Tests, documentation, and implementation stay synchronized.

## 13. Status boundaries

- **APPROVED:** Warm coastal light direction, Nunito Sans/Montserrat typography, oat canvas, deep-teal primary, coral accent, subtle bordered surfaces, responsive layout, accessibility, and reusable architecture.
- **APPROVED:** Current binary questionnaire UI, self-declared examination gate, programme-group filtering before RIASEC ranking, and truthful evidence boundaries.
- **PROVISIONAL:** Colors, illustrations, typography, and product identity as institutional branding.
- **PROPOSED / BLOCKED:** Illustrated activity-comparison questions and three-level enjoyment ratings until an instrument and scoring evidence are approved.
- **OUT OF SCOPE:** Dark theme, copied reference content/branding, realistic-photo-led design, fabricated qualitative match thresholds, and frontend-only policy enforcement.
