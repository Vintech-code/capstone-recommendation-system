---
name: TCC Course Recommendation Design System
status: APPROVED working product direction; PROVISIONAL institutional identity
version: 4.3
last_updated: 2026-09-12
font_family: Nunito Sans headings / Montserrat Alternates body
theme: light
colors:
  background: '#F7FAF2'
  surface: '#FBFFF7'
  surface_subtle: '#EEF5E8'
  foreground: '#34402D'
  foreground_muted: '#65705F'
  border: '#DCE7D4'
  border_strong: '#C6D6BA'
  primary: '#7ED321'
  primary_hover: '#70C21D'
  primary_pressed: '#62AD19'
  primary_soft: '#EFF9DF'
  primary_ink: '#3B700B'
  on_primary: '#20340F'
  accent: '#F4B740'
  accent_soft: '#FFF4CC'
  success: '#7ED321'
  success_soft: '#EFF9DF'
  warning: '#E2B34F'
  warning_soft: '#FFF4CC'
  danger: '#E58B91'
  danger_soft: '#FCEBEC'
  info: '#D889AE'
  info_soft: '#FAECF3'
radii:
  control: 12px
  nested: 16px
  card: 24px
  hero: 28px
  pill: 9999px
shadows:
  small: '0 1px 2px rgba(52, 64, 45, 0.12)'
  clay_small: 'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 1px 2px rgba(52, 64, 45, 0.12)'
layout:
  content_max: 1200px
  reading_max: 720px
  desktop_gutter: 32px
  tablet_gutter: 24px
  mobile_gutter: 16px
---

# TCC Course Recommendation Design System

## 1. Authority and reference boundary

This file is the visual and interaction authority for the responsive TCC course-recommendation application. Version 4.0 uses a minimalist claymorphism language with `#7ED321` as the product green. UI surfaces and semantic product tokens do not use blue; the supporting palette uses orange, violet, pink, yellow, olive, green, and neutral tones.

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

The experience is light-only. Dark navy, dark green, black, and near-black must not be used as page, sidebar, card, hero, or other large-area backgrounds. Darker values are reserved for readable text, icons, and short-lived hover or pressed states where contrast requires them. The public landing footer is the sole approved exception: it may use `primary-ink` as a bounded closing surface with white content and a low-opacity real logo watermark. A dark theme is out of scope for this direction. Existing dark-theme code may be retired only in a separately tested implementation slice; do not expand it or use it to shape new components.

## 3. Visual foundation

### 3.1 Color system

Use semantic CSS variables and Tailwind utilities. Do not scatter raw hex values through route or feature components.

| Role | Value | Use |
| --- | --- | --- |
| Canvas | `#F7FAF2` | Quiet green-neutral page background |
| Surface | `#FBFFF7` | Clay cards, dialogs, menus, and inputs |
| Subtle surface | `#EEF5E8` | Quiet grouped content and insets |
| Foreground | `#34402D` | Primary text and icons without near-black visual weight |
| Muted foreground | `#65705F` | Descriptions and metadata |
| Border | `#DCE7D4` | Default card and control outline |
| Strong border | `#C6D6BA` | Dividers and emphasized control outlines |
| Primary green | `#7ED321` | Primary actions, active navigation, focus, and progress |
| Primary hover | `#70C21D` | Hovered primary controls |
| Primary pressed | `#62AD19` | Pressed primary controls |
| Primary soft | `#EFF9DF` | Selected controls and quiet highlights |
| Primary ink | `#3B700B` | Accessible green text and icons on light surfaces only |
| Soft coral | `#E58B91` | Decorative warmth and error fills |
| Fresh green | `#8AD3A2` | Decorative growth cues |
| Soft violet | `#9B86D4` | Investigative data and restrained illustration accents |
| Sun accent | `#F4B740` | Restrained attention and secondary visual rhythm |
| Success | `#7ED321` | Completed and successful fills |
| Warning | `#E2B34F` | Review or attention fills |
| Danger | `#E58B91` | Error and destructive fills |
| Information | `#D889AE` | Neutral information and analytical fills |

Muted tones support hierarchy without becoming a competing rainbow:

- Pale green `#EFF9DF` for selected, guidance, and completed states.
- Sun wash `#FFF4CC` for gentle attention.
- Soft coral `#FCEBEC` for destructive or error surfaces only.
- Pink wash `#FAECF3` for analytical information.

Green is the primary product color. Supporting orange, violet, pink, yellow, olive, and neutral accents should carry comparable visual weight across an entire screen. Blue is excluded from UI surfaces and semantic product tokens. Existing project imagery and externally controlled third-party marks may retain their source colors, but blue must not become the interface theme. The readable ink tokens are for text and icons only; do not reuse them as fills for bars, cards, navigation, charts, or large controls.

### 3.2 RIASEC mapping

Use one stable mapping wherever the six recorded dimensions appear:

| Code | Category | Indicator | Soft surface |
| --- | --- | --- | --- |
| R | Realistic | `#E9966A` | `#FBEDE5` |
| I | Investigative | `#9B86D4` | `#F2EEFA` |
| A | Artistic | `#D889AE` | `#FAECF3` |
| S | Social | `#7ED321` | `#EFF9DF` |
| E | Enterprising | `#E2B34F` | `#FFF4CC` |
| C | Conventional | `#8E9A73` | `#F1F3EC` |

Always pair color with code, full name, score, and accessible label. These colors identify categories only; they never mean good, bad, passing, aptitude, or expected success.

### 3.3 Typography

Use bundled open-source **Nunito Sans Variable** for display headings and **Montserrat Alternates** for paragraphs, controls, labels, and data. Bundle Montserrat Alternates weights 400–900 locally and keep `ui-sans-serif`, `system-ui`, and `sans-serif` fallbacks. Do not introduce proprietary fonts.

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

Use sentence case. Reserve uppercase for short overlines with `0.10em` tracking. Result hero headings use Nunito Sans at weight 900, tight but readable line height, and restrained negative tracking to create the bold reference-inspired treatment without copying its archetype wording. Result summaries, score labels, evidence copy, metadata, and recommendation explanations use the body, label, or caption tokens above rather than 10–12px utility text. Keep prose near 65 characters per line. Primary green ink may emphasize one key idea in a heading, not multiple competing phrases.

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

- Primary cards: 24px radius, 1px semantic border, clay surface, `shadow-sm` only.
- Hero/result cards: 28px radius.
- Nested panels: 16px radius and subtle surface; never nest more than one level.
- Inputs and buttons: 12px radius.
- Badges and progress tracks: full pill radius.
- Icon-only controls: circular only with a clear accessible name.

The only elevated shadow is `shadow-sm` (`0 1px 2px rgba(52, 64, 45, 0.12)`). Clay surfaces may pair it with one subtle white inset highlight, but must not add medium, large, diffuse, stacked outer, or glow shadows. Interactive controls change tone and may compress their inset highlight; cards do not float upward on hover. Avoid glassmorphism, thick outlines, and excessive elevation.

Subtle card borders are part of this revision. Use spacing, tone, or dividers for internal structure so every block does not become another bordered card.

### 3.6 Icons and illustrations

Use Lucide React for functional icons, normally 18–22px with consistent line weight. Ambiguous icons require visible or assistive labels.

Illustrations must be original or properly licensed flat/vector-style assets with inclusive rounded characters, simple shapes, limited detail, quiet outlines, generous transparent space, and at most one soft gradient or glow. Favor educational activities, exploration, making, analysis, community, and study.

Avoid realistic photography, copied reference characters, other products' mascots, heavy gradients, 3D chrome, dark scenes, generic AI sparkles, and art that implies an unsupported personality or career conclusion. Existing photographic presentation assets should migrate separately to approved vector art; until then, they remain decorative and never serve as evidence.

## 4. Responsive application shell

### 4.0 Public landing page

The public `/` route is an approved Student-oriented introduction. It uses the project-owned `assets/images/landing-image-bg.png` artwork in a two-column hero with original TCC course-recommendation content. The composition may take inspiration from the supplied reference's pacing and friendly educational tone, but it must not copy the reference logo, wording, claims, metrics, card artwork, or product identity.

- Use a sticky white header with the existing Pathways mark, in-page section links, and one full-pill **Start assessment** action on desktop. On mobile, replace the links with one labelled burger control and omit the header assessment action from both the bar and menu.
- Place original project copy on the left and the supplied transparent illustration on the right; stack copy before artwork on mobile.
- Use full-pill primary and secondary calls to action on this public page. This is a deliberate landing-page exception to the standard 12px application-control radius.
- Describe the six RIASEC areas factually without presenting them as ability, personality, diagnosis, or destiny labels.
- Explain the real journey: individual Student account, self-declared entrance result, locally stored assessment, authoritative result processing, and explainable programme recommendations.
- Do not publish fabricated completion times, prices, participation counts, scientific-validation claims, privacy guarantees, testimonials, or success promises.
- The public footer uses a bounded dark `primary-ink` surface, factual in-page navigation and guidance principles, plus the real TCCence logo as a low-opacity oversized watermark. Do not include portal sign-in links, fabricated contact/social/legal content, or an institutional copyright claim. The authenticated application remains footer-free.
- The hero artwork is decorative because the adjacent text communicates the page purpose; use an empty alternative description and preserve responsive containment.

### 4.1 Student top navigation

Use one sticky light top bar, not a sidebar:

- 72px desktop and 64px mobile height.
- Warm canvas/white background at 92–96% opacity with a subtle bottom divider.
- Left: context-aware Back or Home action.
- Center: page title visually centered independently of side widths.
- Right: real notification control and authenticated identity.
- Keep one row on mobile; use icons with accessible names and tooltips when labels do not fit.

The identity control shows uploaded photo, then verified Google avatar, then recorded-name initials. Unread counts come only from the authenticated API.

Authenticated application and authentication routes use no global page footer. Keep route content focused within those shells. The approved public landing page may use its dedicated compact portal-link footer.

### 4.2 Administrator shell

Administrator governance retains the collapsible desktop sidebar and uses a shadcn Sheet on mobile. Dashboard, Students, Programmes, Reports, and Activity remain in the sidebar; the former Assessments destination redirects to Students and is not listed. Each Administrator has an individual account.

Admin content uses one plain continuous light canvas. Thin horizontal and vertical dividers, tables, split analytical regions, timelines, and whitespace define hierarchy. Do not wrap routine metrics, filters, table groups, evidence fields, or audit entries in cards. Reserve rounded clay surfaces for overlays and controls that require them. The sidebar must use a light surface with neutral text and a pale-green active state, never a dark fill. Use the same green, orange, violet, pink, yellow, olive, and neutral system as the Student experience; never copy reference branding, identities, wording, proprietary artwork, or unrelated content.

Administrator screens use a compact information-density exception. Page titles are 20px on mobile and 24px from `sm`; section titles are normally 18â€“20px; operational body text is 12â€“14px with readable line height. Use 12â€“24px section spacing and 10â€“16px row padding instead of large marketing-page gaps. Routine Administrator controls, active-navigation fields, data surfaces, and status labels use the 2px `rounded-xs` radius; identity avatars and icon-only circular controls may remain round. Shared overlays may retain the minimum radius needed by their primitive, but must not introduce card-like rounding into the Admin canvas.

### 4.3 Breakpoints

- Base: one-column composition.
- `sm` 640px: two-column catalogue cards where readable.
- `md` 768px: expanded labels and selected two-column content.
- `lg` 1024px: result split and collapsible Administrator desktop sidebar.
- `xl` 1280px: maximum content width; do not keep stretching lines.

No horizontal document scrolling is permitted at 320 CSS pixels. Support 200% text zoom and WCAG-required 400% reflow.

## 5. Shared components

### 5.1 Buttons

- **Primary:** light-green fill, dark-green label, 12px radius, 44px minimum height.
- **Secondary:** white, strong-neutral border, foreground label.
- **Tertiary:** readable green ink or pale green for low-emphasis navigation.
- **Danger:** only for genuinely destructive actions with confirmation.
- **Icon:** 44x44px minimum with tooltip and accessible name.

Hover increases contrast; active darkens slightly; disabled remains readable; loading preserves width and announces status. Color is never the sole state signal.

Solid, outlined, and secondary buttons use minimalist claymorphism: one soft inset highlight plus `shadow-sm`. Hover changes tone without increasing elevation; pressed state compresses to an inset-only treatment. Ghost and link actions remain flat. Disabled buttons remove elevation, and reduced-motion mode removes transitions.

Public landing-page calls to action use the same variants and interaction states with the approved full-pill radius.

### 5.2 Inputs and forms

Use persistent labels. Floating labels are allowed only if they remain visible after entry and with browser autofill.

- 48px minimum height; multiline fields size to content.
- 1px strong-neutral border and 3px visible primary focus ring.
- Helper and error text sits below its field.
- Errors state the field, problem, and recovery.
- Number inputs show scale and accepted precision nearby.

### 5.3 Card variants

- **Standard:** clay surface, subtle border, 24px radius, `shadow-sm`.
- **Feature:** 28px radius with one controlled pastel area or illustration.
- **Compact:** reduced padding for timelines and mobile lists.
- **Interactive:** standard plus hover, focus, selected, and real action states.
- **Inset:** subtle surface, 16px radius, no shadow.

Cards are exceptional containers, not automatic wrappers. Prefer open-canvas composition, whitespace, alignment, and dividers. Do not place every result, list item, action group, or explanation inside its own card.

### 5.4 Badges and pills

- **Top fit:** solid primary for rank 1, with visible rank and label.
- **Category tag:** soft RIASEC color, code, and full category.
- **Evidence pill:** pale green and primary ink, only for recorded/configured evidence.
- **Status badge:** semantic icon, label, and soft state color.

Use 28–32px height, 12–14px labels, and 12–14px horizontal padding. Wrap cleanly and avoid more than five pills in one row.

### 5.5 Progress

- Track: 8–10px, `#E9E7EA`, pill ends.
- Overall progress: light green; category progress: stable pastel RIASEC mapping.
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

- Main region: rank overline, one rank badge, programme name, and configured summary. Keep programme codes and detailed RIASEC evidence out of this compact ranked list.
- Summary region: exact match percentage, accessible bar, and disclosure action. Keep the eligibility label in the detailed programme flow rather than repeating it in every ranked row.
- Only ranks 1–3 use the broad pastel shape. Its desktop width steps down from rank 1 to rank 3 to establish the reference-inspired hierarchy; later ranks remain plain compact rows. The shape must remain readable and must not encode an unofficial threshold.
- Expanded details show recorded scores, configured programme areas, catalogue learning areas, generation date, and rule version.

Display **Strong match**, **Good match**, or **Explore match** only if thresholds exist in a versioned approved backend configuration. Otherwise use **Recorded match** with the exact percentage. Never invent thresholds in frontend code.

Ranking compares all configured catalogue programmes in that recommendation snapshot. It is not an admission guarantee, enrolment decision, ability judgment, or promise of success. Board/non-board entrance grouping remains separate guidance from RIASEC fit and must not remove programmes from the ranked list.

Equal recorded percentages are valid when programme profiles produce the same mean. Use competition ranking for exact ties (`1, 1, 3`), label tied positions explicitly, and use configured alphabetical order only to stabilize display within a tie. Never manufacture score differences to force a unique order.

On mobile, place the summary below the title. Do not preserve a desktop shape if it clips text or creates large empty space.

### 5.9 Assessment Question Card

#### Current approved binary instrument

The production questionnaire presents the 42 statements selected from the University of Hawai‘i Community Colleges Career Explorer RIASEC checklist, stored locally as the versioned `tcc-uhcc-riasec-42-v1` instrument. It shows one statement at a time with two full-size choices: **Agree** and **Do not agree**. Every statement requires an explicit response. Selected controls use a medium-green border, pale-green fill, check icon, and programmatic selected state. Keep a visible source link with the questionnaire; source selection does not establish TCC or psychometric validation.

The two response controls use the same minimalist clay surface as the rest of the system: 24px radius, semantic border, one white inset highlight, and `shadow-sm`. The selected choice changes to the semantic pale-green fill and stronger green border without adding elevation. Preserve visible focus, explicit radio semantics, 48px minimum targets, and reduced-motion behavior.

The authoritative server-side formula counts each **Agree** response as one point in the statement's stored RIASEC category and each **Do not agree** response as zero. Each of R, I, A, S, E, and C has seven mapped statements, so every raw category score is an integer from 0 through 7. The browser never supplies or changes category mappings.

The page includes top navigation, `Question n of total`, exact progress, a centered readable question, two 48px-minimum response controls, Previous/Next in a stable navigation region, and visible saving, saved, retry, and validation feedback. The last action is **Finish assessment**; do not insert a full answer-review list between the last question and result processing.

After Finish, replace the questionnaire with one full-page calculation state. Use a large custom green/violet/yellow spinner, the factual heading **Calculating your programme matches**, a concise scoring/comparison explanation, and an accessible live status. Keep this state visible while the server reports `preparing_result`. Redirect to **My Matches** only after the authoritative assessment status is `result_available`. A processing or connection failure must preserve recorded answers and expose a retryable error instead of fabricating a result.

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
- explanation that the entrance group is recorded as separate guidance while all configured programmes remain in the RIASEC ranking, and that neither the group nor the ranking guarantees admission.

This is the project rule `SELF-DECLARED-TCC-ENTRANCE-2026-01`; never call it a CHED- or TCC-published cutoff.

### 5.11 Navigation, notifications, and overlays

Active navigation uses primary green ink plus a pale-green fill or short underline and `aria-current`. Menus use a 16px clay surface, visible focus, and `shadow-sm` only.

Notifications open as a compact anchored feed with real unread counts, All/Unread filters, event markers, timestamps, and explicit loading, empty, error, retry, unread, and read states. Selecting an unread item changes only that recipient's record and opens an authorized destination.

Use dialogs for short confirmations and sheets for focused editing or mobile navigation. Toasts may confirm transient success but never carry the only completion, permission, or failure explanation.

### 5.12 Tables and filters

Administrator tables sit directly on the plain canvas with top, bottom, header, and row dividers. On mobile, use divided record rows or a labelled internal scroll region, never card-per-record layouts or page overflow.

The desktop Student records ledger uses Grid.js core through a focused React lifecycle wrapper as a rendering layer. Laravel remains authoritative for search, status/eligibility filters, sorting, and pagination; do not apply a second client-only sort or page operation to one server result page. Style Grid.js through the semantic Admin theme, keep its wrapper radius at `rounded-xs`, and preserve real button, table, and row semantics.

Filters use the existing compact single-open-section accordion. Closed rows expose selected counts. Search, sort, pagination, and reset actions operate on real data and define empty states.

## 6. Page patterns

### 6.0 Public landing

- Header: section navigation plus one **Start assessment** action. Do not repeat Student and Administrator portal shortcuts in the public header.
- Hero: begin directly beneath the header with compact top spacing, TCC Student Applicant context, one original decision-support heading, concise evidence-bound description, the supplied `assets/images/landing-image-bg.png` background and `landing-image-home.png` illustration, and pill-shaped Student actions.
- Highlights: only stable system characteristics such as locally managed questions, six recorded areas, explainable matches, and versioned history.
- RIASEC: six consistent, labelled categories with short neutral descriptions and no invented interpretations. Keep the six PNG-led items in a two-column grid on phones and tablets, expanding to three columns at `lg`.
- Journey: account and entrance declaration, assessment completion, then programme recommendation review.
- Trust section: local content ownership, versioned evidence, explainable comparison, and an explicit guidance-not-guarantee boundary.
- FAQ: answer only from implemented contracts and approved project rules.
- Footer: a bounded `primary-ink` closing surface with platform section navigation, concise factual guidance principles, and the real logo as a low-opacity oversized watermark; do not repeat an **Access portals** account-link column, Student sign-in link, copyright claim, or fabricated contact, policy, social, or institutional links.

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
- Place the recommended-career-path guidance below that composition as one full-width, open-canvas section. Use divided opportunity rows and an inline explanation rail; do not wrap the section or individual opportunities in cards.
- Present ranked recommendations as one spacious list of broad split rows. The top three use restrained pastel programme fields whose desktop widths descend by rank, paired with a compact white recorded-match rail; later ranks use plain compact divided rows. Use the exact recorded percentage and `Recorded match`; do not invent qualitative thresholds. Stack the match rail below the programme field on mobile.
- Follow with an open-canvas heading and ranked list at 20–24px gaps.
- Explain eligibility and RIASEC evidence as separate concepts.
- Explanations contain only assessment reference, stored scores/code, configured programme areas, catalogue learning areas, and versioned rules.
- History uses a compact attempt timeline beside the selected result; stack on mobile.
- Identify Current and Previous results and compare exact score differences without interpreting the change.

### 6.4 Programme catalogue and detail

- Show the Explore Programmes cover photograph without colored or directional gradient overlays. Preserve the photograph's natural colors; use localized text treatment only when contrast requires it.
- Use one column on narrow phones and two from `sm` when readable.
- Cards show only recorded imagery, name, code, degree type, duration availability, summary, and relevant evidence.
- Show recommendation rank once; matched codes stay in a labelled evidence group.
- Supported filters: field, RIASEC area, official duration availability, recommended SHS strand, and saved status.
- Distinguish institution-controlled facts, external-source facts, unavailable data, and recommendation evidence.
- Present all configured career directions rather than elevating only the first item as the Student's career. ESCO occupation records appear in a separate external-reference group with their description, selected essential skills, ISCO/ESCO identifiers when available, and a source link. State that these are exploration options, not job or admission guarantees.

### 6.5 Student profile

- Use a strong identity header with authenticated image fallback.
- Place learning snapshot beside recorded-interest and career-direction areas on wide screens; stack on mobile.
- RIASEC scores and interests remain read-only.
- Label strengths, growth areas, and learning preferences as Student-reported.
- Editing remains an inline three-step flow with Previous/Next and final Save.
- Personal information uses the existing labelled Select controls for Region, Province, City or municipality, and Barangay. Changing a parent clears its descendants. Province-less cities use an explicit No province choice; loading, empty, and retry states preserve the current draft. Existing text addresses remain visible until replaced with a structured selection.
- Factual summaries never infer personality, intelligence, diagnosis, or success.

### 6.6 Authentication

Student and Administrator URLs remain separate; sign-in never asks the user to select a role. Use a split desktop layout with original flat educational art and a 520–560px credential surface; put the form first on mobile.

The public landing-page Student authentication modal uses one mode at a time in a generous 500px maximum surface with `rounded-sm` corners, increased internal spacing, and a larger readable text hierarchy. Do not place a segmented Sign in/Create account switch above the form; use the contextual text action below the current form to change modes.

Apply light green to action fills and focus indicators, with primary green ink for links. Reuse one labelled field pattern. The global footer is omitted throughout the application, including full-screen authentication and session restoration. Student Google authentication appears only when its real development/testing flow is active. Administrator access uses individually provisioned credentials; social login never creates or infers a staff role.

### 6.7 Administrator workspace

- Use an operational column and narrower attention rail on wide screens.
- Dashboard charts use only recorded journey counts and clearly label zero values. Use one joined operational strip with distinct green, violet, yellow, and pink semantic regions, then a multicolor stage chart paired with an exact text flow so the palette improves hierarchy without becoming decorative noise. Keep the overview focused on Student totals, assessment records, available results, recommendation runs, journey movement, and recent Student evidence. The header has no duplicate Student-directory call to action; programme save rankings, entrance-group segmentation, exception totals, and the former workload rail do not appear on the dashboard.
- Students and assessments remain one protected Students workflow.
- Programme management uses a focused sheet with autosave state, failure recovery, required change review, explicit full-catalogue publication confirmation, and immutable history. The sheet must not imply that publishing affects only the programme currently open when the stored draft spans the full catalogue.
- Programme identity, recorded majors, CMO-grounded descriptions and learning content, CMO career directions, source metadata, admission grouping, and RIASEC profiles remain visibly and programmatically read-only in the ordinary programme workflow. Administrators may manage clearly labelled proposed SHS preparation guidance, external career mappings, and programme media; source-controlled corrections require an updated authoritative source and a new controlled catalogue version.
- Reports are privacy-aware and limited to Student totals, assessment progress, completion history, entrance-group distribution, recommendations, and programme saves. Present these as one compact aggregate snapshot with a date filter, completion trend, exact lifecycle counts, and clearly separated engagement context. Do not expose CSV export or catalogue-governance sections in the Admin interface.
- Activity rows show the recorded action, responsible Administrator, and date without raw metadata, internal subject references, or generated summaries.
- Do not expose a separate catalogue-evidence page or entry point.
- Programme monitoring cards and programme detail media show their source images without colored or directional gradient overlays.
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
- Public landing sections may alternate the same restrained 8–12px entry distance across vertical, horizontal, and slight-scale variants. Short groups of up to six items may use delays no longer than 180ms. Keep the landing background and `landing-image-home.png` static; use transitions rather than continuous decorative animation.

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

### Professional code quality and anti-spaghetti rules

- Keep route and page components focused on composition. Move independently stateful controls, animations, and reusable interaction patterns into named, typed components at the correct ownership level.
- Maintain one source of truth for each workflow state. Derive navigation availability with clear predicates instead of duplicating state or scattering conditional markup.
- Extract named constants and focused functions for timing, mapping, and interaction behavior; do not introduce magic timers, DOM queries, duplicated JSX, or inline business and scoring policy.
- Keep effects local to the behavior that owns them, clean up timers and subscriptions, and preserve native semantics before adding presentation or motion.
- Centralize reusable visual tokens and keyframes. Every animation must include a reduced-motion treatment and must not block keyboard, touch, or screen-reader operation.
- Add focused behavior and accessibility tests when a component gains state or interaction. Refactor when a file begins mixing unrelated workflow, data-access, and presentation responsibilities.

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

- Green-neutral canvas, neutral text, `#7ED321` actions, softly saturated orange/violet/pink/yellow/olive accents, and spacious hierarchy.
- Nunito Sans/Montserrat Alternates hierarchy, the Student 20–28px subtle-bordered surface family, and the Administrator line-led canvas exception.
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

- **APPROVED:** Minimalist claymorphism, `#7ED321` primary green, no blue UI surface or semantic product tokens, orange/violet/pink/yellow/olive/neutral supporting colors, `shadow-sm` maximum elevation, Nunito Sans/Montserrat Alternates typography, responsive layout, accessibility, and reusable architecture.
- **APPROVED:** Public Student landing page at `/`, supplied `assets/images/landing-image-bg.png` hero artwork, original project-specific content, full-pill landing actions, and dedicated portal links.
- **APPROVED:** Current 42-item binary questionnaire UI and server-side 0-7 category-count formula, self-declared examination gate, all-programme RIASEC ranking with separate entrance-group guidance, competition ranks for exact ties, and truthful evidence boundaries. The selected external questionnaire remains PROPOSED for institutional or psychometric adoption.
- **PROVISIONAL:** Colors, illustrations, typography, and product identity as institutional branding.
- **PROPOSED / BLOCKED:** Illustrated activity-comparison questions and three-level enjoyment ratings until an instrument and scoring evidence are approved.
- **OUT OF SCOPE:** Dark theme, copied reference content/branding, realistic-photo-led design, fabricated qualitative match thresholds, and frontend-only policy enforcement.
