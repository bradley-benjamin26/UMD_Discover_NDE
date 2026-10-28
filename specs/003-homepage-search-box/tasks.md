---

description: "Task list for 003 Homepage Search Box"
---

# Tasks: Homepage Search Box

**Input**: Design documents from `/specs/003-homepage-search-box/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/homepage-hero-selectors.md](./contracts/homepage-hero-selectors.md),
[quickstart.md](./quickstart.md)

**Tests**: Required (Constitution IV). Each test is run and seen failing on its assertion before
the implementation; record the failing output in the PR.

**Depends on**: 001's Foundational phase (`specs/001-umd-design-system/tasks.md` T002 `test:assets`
script, T009 tokens, T010 fonts, T012 focus rings).

**Open question carried from research R4**: the spec's dark bottom rule on the input is followed;
if the Libraries prefer the prior red rounded input, FR-001 is amended before T008.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = start a search from a familiar, readable search box; US2 = readable on any
  screen

---

## Phase 1: Setup

- [ ] T001 After 001 task T013 passes, create branch `003-homepage-search-box` from `001-umd-design-system` (`git checkout 001-umd-design-system && git checkout -b 003-homepage-search-box`).
- [ ] T002 Confirm with the Alma administrator that `homepage.homepageBGImage` is unset for the NDE view (research R2); if it is set, ask for it to be cleared. Record the answer for the PR.
- [ ] T003 Spike in proxy mode (`npm run build`, `npm run start:proxy`, open the homepage). Confirm or correct every row of `specs/003-homepage-search-box/contracts/homepage-hero-selectors.md` and fill both TBD rows: the nearest element containing both NDE's `h1` and `.search-bar-container` (the panel), and how NDE sets its own background (CSS `background-image` on which element, or an `<img>`). Also record: whether `.custom-search-bar-container` spans the full hero width and height; whether the search area is in the main document so 001's tokens resolve (check `getComputedStyle(el).getPropertyValue('--maryland-red')`); the selectors of the query input and the search button.
- [ ] T004 [P] Extract the photo to the scratchpad (not the repo): from `../customModule-main/src/assets/homepage/homepage_background.svg`, decode the embedded base64 `data:image/jpeg` into a 1920×1080 JPEG. Check it has no location metadata (`sips -g all`).

No foundational phase: 001 provides tokens, fonts, focus rings, and the test runner.

---

## Phase 3: User Story 1 - Start a search from a familiar, readable search box (P1) 🎯 MVP

**Goal**: One white panel over the McKeldin photo holding NDE's heading, scope selector, input,
search button, and the Ask Anything / Advanced Search links, styled like lib.umd.edu.

**Independent Test**: Homepage beside lib.umd.edu matches in layout, type, and colour; a search
from the panel returns the same results as Discover's standard search.

### Tests (write first, see fail)

- [ ] T005 [US1] Write `tests/homepage-hero.test.js` (`node:test`), using the selectors recorded in T003. Against `dist/01USMAI_UMCP-NDE/custom.css`: the hero selector has `background-image` with `url(` ending `assets/homepage/hero-960.jpg` and `background-size: cover`; a `@media (min-width: 961px)` block switches it to `hero-1920.jpg`; every `url(` in the hero rules is a local `assets/homepage/hero-*.jpg` (no `http`); `.background-overlay` inside the hero has `display: none`; the panel rule has `background` `var(--white)`, `max-width: 50rem`, and `border-radius: var(--radius-md)`; the `h1` rule uses `var(--font-display)`, `text-transform: uppercase`, `font-size: var(--text-3xl)`, colour `var(--darker-gray)`; the input rule has `border-bottom: 1px solid var(--darker-gray)`; no rule in the hero section sets `outline: none` or `outline: 0` (spec edge case). Against the image files: `src/assets/homepage/hero-960.jpg` exists, starts with bytes `FF D8 FF`, is ≤ 81,920 bytes, and its SOF marker width is 960; `src/assets/homepage/hero-1920.jpg` likewise, ≤ 307,200 bytes, width 1920.
- [ ] T006 [US1] Run `npm run test:assets`; confirm every T005 assertion fails because the rules and files are missing. Record output.

### Implementation

- [ ] T007 [P] [US1] From the T004 photo, write `src/assets/homepage/hero-1920.jpg` (1920 wide, ≤ 300 KB) and `src/assets/homepage/hero-960.jpg` (960 wide, ≤ 80 KB) with `sips -Z <width> -s format jpeg -s formatOptions <quality>`, lowering quality until each fits its budget. Do not commit the SVG wrapper.
- [ ] T008 [US1] Add a "Homepage hero" section to `src/app/styles/_customized-theme.scss`, scoped to `.custom-nde-theme`, with the T003 selectors: hero `background: url('assets/homepage/hero-960.jpg') center / cover no-repeat`, switching to `hero-1920.jpg` in `@media (min-width: 961px)`; hide `.background-overlay`; panel white, `padding: var(--space-sm)`, from 896px `padding: var(--space-md) var(--space-xl)` and `max-width: 50rem`, `margin-inline: auto`, `border-radius: var(--radius-md)`, a soft shadow; `h1` per research R5 (`var(--font-display)`, bold italic, uppercase, wide letter spacing, `var(--darker-gray)`, `var(--text-3xl)`); input 3.5rem tall with `border-bottom: 1px solid var(--darker-gray)` (research R4); search button `var(--maryland-red)` background with `var(--white)` icon, hover `var(--dark-red)`, at least 24×24px; links row (Ask Anything, Advanced Search) below the input with `flex-wrap: wrap`; scope dropdown text `var(--text-sm)` (research R6). No copied NDE `clamp()` widths. `!important` only where NDE's specificity requires it, each with a one-line comment. Focus rings come from 001; don't override them.
- [ ] T009 [US1] Run `npm run test:assets`; all T005 assertions pass. Fix code, not tests.
- [ ] T010 [US1] Manual US1 checks from [quickstart.md](./quickstart.md): side by side with lib.umd.edu (SC-001); "climate" from the panel and from a results page give the same results (SC-002); network panel at 400 px loads only `hero-960.jpg`, at 1400 px only `hero-1920.jpg`, no third-party requests (SC-005); Tab order scope selector → input → search button → Ask Anything → Advanced Search, each with visible focus; VoiceOver: one `h1`, input and button named, photo not announced; Discover's autocomplete suggestions still appear and are readable. Record results.

**Checkpoint**: US1 complete.

---

## Phase 4: User Story 2 - Readable on any screen (P2)

**Goal**: The panel stays readable and usable at 320 px, 200% zoom, forced colours, reduced
motion, and with the photo missing.

**Independent Test**: View the homepage at 320 px, 200% zoom, forced colours, and with the photo
blocked; the panel stays readable and search works each time.

### Tests (write first, see fail)

- [ ] T011 [US2] Extend `tests/homepage-hero.test.js`: the hero rule sets `background-color: var(--maryland-red)` (research R7 fallback); the panel rule sets no fixed `width` in px (only `max-width`); a `@media (prefers-reduced-motion: reduce)` block removes transitions on the panel and hero; a `@media (forced-colors: active)` block gives the panel a `1px solid CanvasText` border and the input a `CanvasText` bottom rule; no `font-size` below `var(--text-sm)` in the hero section (no `0.8125rem`). Run `npm run test:assets`; confirm the new assertions fail.

### Implementation

- [ ] T012 [US2] Add the T011 rules to the "Homepage hero" section of `src/app/styles/_customized-theme.scss`; make sure the input uses `text-overflow`/horizontal scrolling for very long queries so the layout doesn't grow.
- [ ] T013 [US2] Run `npm run test:assets`; all assertions pass.
- [ ] T014 [US2] Manual US2 checks: 320 px wide and 200% zoom (panel fills width, no horizontal scroll, links wrap below the input, photo cropped not squashed); forced colours (panel border, input rule, focus visible); block `hero-*.jpg` in DevTools (red background, panel readable, search works); photo quality at both sizes (no visible blocking or banding); time until the search box is typeable on a mid-range phone, before vs. after (SC-004). Record results.

**Checkpoint**: US1 and US2 both work.

---

## Phase 5: Polish & Release

- [ ] T015 Run axe DevTools on the homepage; 0 WCAG 2.2 AA violations introduced (SC-003). Record results.
- [ ] T016 Confirm `npm test` passes end to end and `dist/01USMAI_UMCP-NDE.zip` contains `assets/homepage/hero-960.jpg` and `hero-1920.jpg`.
- [ ] T017 Open the PR (into `001-umd-design-system` if 001 hasn't merged, else `main`); include T006/T011 failure output, T010/T014/T015 results, the T002 Alma answer (`homepageBGImage` must stay unset), the research R4 input-style note, and the contract's warning that these selectors are undocumented and must be re-checked after each NDE release.

---

## Dependencies & Execution Order

- 001 T013 → T001 → T002, T003, T004 → T005 → T006 → T007/T008 → T009 → T010 → T011 → T012 → T013
  → T014 → T015–T017.
- T003 (selectors) blocks T005; T004 (photo) blocks T007.
- US2 builds on US1's hero section (same file), so it follows US1.

## Parallel Opportunities

- T002, T003, and T004 at the same time.
- T007 (images) and T008 (styles) once T006 has been seen failing.

## Implementation Strategy

1. MVP = Setup + US1: the restyled panel over the photo.
2. Then US2 (fallback, forced colours, reduced motion, small screens).
3. Ship with or after 001; it reuses 001's tokens and focus rings.
