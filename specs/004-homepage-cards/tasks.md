---

description: "Task list for 004 Homepage Cards"
---

# Tasks: Homepage Cards

**Input**: Design documents from `/specs/004-homepage-cards/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/homepage-cards.md](./contracts/homepage-cards.md),
[quickstart.md](./quickstart.md)

**Tests**: Required (Constitution IV). Each test is run and seen failing on its assertion before
the implementation; record the failing output in the PR.

**Depends on**: 001's Foundational phase (`specs/001-umd-design-system/tasks.md` T002 test scripts,
T009 tokens, T012 focus rings).

**Blocked on the Libraries**: T008 needs the final card list (T002). The contract test fails on
placeholder text, so cards can't ship with "TBD" descriptions.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = pick a service from clear, described cards; US2 = cards look like lib.umd.edu
  cards

---

## Phase 1: Setup

- [ ] T001 After 001 task T013 passes, create branch `004-homepage-cards` from `001-umd-design-system` (`git checkout 001-umd-design-system && git checkout -b 004-homepage-cards`).
- [ ] T002 Ask the Libraries for the final card set (3 to 8 cards): for each card, a title (≤ 4 words), a one-line description (≤ 60 characters), an absolute `https://` destination, and an icon from the UMD set in [research R1](./research.md#r1-umd-design-system-icons-fr-002). Include the three missing descriptions and the two icon gaps (Digital Collections, Archives) from the [data-model draft](./data-model.md#current-draft-from-the-prior-project-until-the-libraries-decide). Record the answer in that table in `specs/004-homepage-cards/data-model.md`.
- [ ] T003 Spike in proxy mode (`npm run build`, `npm run start:proxy`): copy `src/assets/homepage/homepage_en.html.tmpl` to `src/assets/homepage/homepage_en.html` unchanged, open the homepage, and record in a new "Spike findings" section at the end of `specs/004-homepage-cards/research.md`: whether NDE inserts the homepage HTML into the main document or isolates it (shadow root or iframe); whether 001's tokens resolve on its elements (`getComputedStyle(el).getPropertyValue('--maryland-red')`); whether NDE loads `homepage.css` (the template's `<link href="./homepage.css">`); the Discover host name (for the external-link rule). This decides research R4 (theme stylesheet vs. `homepage.css`). Keep the copied file; T005 builds on it.
- [ ] T004 [P] Get the icons without installing the package: `npm pack @universityofmaryland/web-icons-library@2.1.0` into the scratchpad, extract it, and copy out the SVG markup for `clock`, `info`, `document`, `external_link`, plus any icons chosen in T002. Write `src/assets/homepage/THIRD_PARTY_NOTICES.md` with the package name, version, and its MIT licence text.

No foundational phase: 001 provides tokens and focus rings.

---

## Phase 3: User Story 1 - Pick a service from clear, described cards (P1) 🎯 MVP

**Goal**: A list of working cards, each one link with an icon, title, and one-line description;
off-site cards say so.

**Independent Test**: Open the homepage; every card shows icon, title, and description, and
activating each opens its destination with one tab stop per card.

### Tests (write first, see fail)

- [ ] T005 [US1] Write `src/app/homepage-cards.spec.ts` (Jasmine, run by `ng test`). In `beforeAll`, `fetch('/assets/homepage/homepage_en.html')` and `fetch('/assets/homepage/homepage_en.html.tmpl')` and parse each with `DOMParser` (fail the suite with a clear message if Karma doesn't serve them). Assert, per [contracts/homepage-cards.md](./contracts/homepage-cards.md): exactly one `ul.umd-home-cards` inside `.menu-container`; 3–8 `<li>`; each `<li>` has exactly one `<a>` whose `href` is absolute `https://`; each link has a non-empty `.umd-home-card__title` of ≤ 4 words and `.umd-home-card__text` of ≤ 60 characters, neither matching `/TBD|lorem|placeholder|…|\.\.\./i`; every `<svg>` in the list has `aria-hidden="true"` and `focusable="false"`, no `id`, no `<title>`, and no `fill`/`stroke` other than `currentColor` or `none`; a link has `.umd-home-card__external` and a `.visually-hidden` "(external site)" if and only if its host is not the Discover host from T003; no `role`, `aria-label`, `tabindex`, or `id` attribute anywhere in the list; with `.menu-container` removed from both documents, the serialized `<head>` and `<body>` of `homepage_en.html` equal the template's (FR-009).
- [ ] T006 [US1] Run `ng test --watch=false --browsers=ChromeHeadless`; confirm the T005 assertions fail against the unchanged copy from T003 (wrong list, `role`/`aria-label`/`id` present, no `href`). Record output.

### Implementation

- [ ] T007 [US1] Wait for T002's answer. If it doesn't arrive, stop here; don't fill the gaps with placeholders or other icon sources (FR-002).
- [ ] T008 [US1] In `src/assets/homepage/homepage_en.html`, replace the `<ul role="list" class="menu width-100">…</ul>` inside `.menu-container` with `<ul class="umd-home-cards">` built from the T002 card list per the contract: each card `<li><a class="umd-home-card" href="…">` wrapping the icon `<svg class="umd-home-card__icon">`, `<span class="umd-home-card__title">`, `<span class="umd-home-card__text">`, and for off-site cards `<svg class="umd-home-card__external">` (from `external_link`) plus `<span class="visually-hidden">(external site)</span>`. For each SVG from T004: remove `id` and `<title>`, set `fill`/`stroke` to `currentColor`, add `aria-hidden="true" focusable="false"`. Leave out any card with no destination (spec edge case). A card whose icon is still undecided gets no icon; list it for the PR. Change nothing outside `.menu-container`.
- [ ] T009 [US1] Run `ng test --watch=false --browsers=ChromeHeadless`; all T005 assertions pass. Fix the HTML, not the test.
- [ ] T010 [US1] Manual US1 checks from [quickstart.md](./quickstart.md): click each card, then Tab + Enter to each (opens its destination, one tab stop per card, SC-001/SC-003); VoiceOver reads "list, N items" and each card once as a link with title, description, and "external site" where it applies, with icons silent; welcome, announcements, and about sections unchanged; network panel shows no new requests (SC-005). Record results.
- [ ] T011 [US1] Run the 5-person check: each person says what every card does from its description before opening it (SC-002). Record results.

**Checkpoint**: US1 complete; cards work and explain themselves, in Discover's default styling.

---

## Phase 4: User Story 2 - Cards look like lib.umd.edu cards (P2)

**Goal**: lib.umd.edu card style in a responsive grid of up to four columns.

**Independent Test**: Compare with lib.umd.edu cards at desktop and phone widths; style and grid
match.

### Tests (write first, see fail)

- [ ] T012 [US2] Write the style assertions against the stylesheet T003 picked: if the homepage is in the main document, extend `tests/theme-tokens.test.js` (reads `dist/01USMAI_UMCP-NDE/custom.css`); if isolated, write `tests/homepage-cards.test.js` against the built `homepage.css`. Assert: `.umd-home-cards` has `display: grid`, `grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr))`, `gap: var(--space-md)`, no list bullets or padding; `.umd-home-card` has `background: var(--white)`, `border: 1px solid var(--light-gray)`, `border-radius: var(--radius-md)`, and fills its grid cell (equal heights); the title uses `var(--font-heading)`; the description `var(--darker-gray)` and `var(--text-sm)`; `:hover` sets border `var(--medium-gray)` and underlines the title; `.umd-home-card:focus-visible` uses `outline: var(--focus-ring)`; a `prefers-reduced-motion` block and a `forced-colors` block (border `CanvasText`, focus `Highlight`) cover the cards; `.visually-hidden` is defined (unless 001 already defines it); no colour literal in the card rules. Run the matching test command; confirm the new assertions fail.

### Implementation

- [ ] T013 [US2] Add a "Homepage cards" section with the T012 rules, using tokens only, to the location T003 picked: `src/app/styles/_customized-theme.scss` (main document), or `src/assets/homepage/homepage.css` compiled from SCSS that `@use`s 001's `src/app/styles/_tokens.scss` (isolated, research R4; add the build step to `angular.json` or `postbuild.js` and justify it in `plan.md` Complexity Tracking). Icons inherit colour (`color: var(--maryland-red)` on the icon, `currentColor` in the SVG).
- [ ] T014 [US2] Run the T012 test command; all assertions pass.
- [ ] T015 [US2] Manual US2 checks: side by side with lib.umd.edu cards (SC-004); up to 4 columns wide, 1 column at 320 px; 200% zoom with no clipped text or horizontal scroll; descriptions that wrap keep cards in a row the same height; forced colours (borders, icons, focus ring visible); hover and focus states. Record results.

**Checkpoint**: US1 and US2 both work.

---

## Phase 5: Polish & Release

- [ ] T016 Run axe DevTools on the homepage; 0 WCAG 2.2 AA violations on the cards (SC-003). Record results.
- [ ] T017 Confirm `npm test` passes end to end and `dist/01USMAI_UMCP-NDE.zip` contains `assets/homepage/homepage_en.html` and `THIRD_PARTY_NOTICES.md`.
- [ ] T018 Open the PR (into `001-umd-design-system` if 001 hasn't merged, else `main`); include T006/T012 failure output, T010/T011/T015/T016 results, the final card list from T002, and any card left without an icon or left out for having no link.

---

## Dependencies & Execution Order

- 001 T013 → T001 → T002, T003, T004 → T005 → T006 → T007 (T002 answer) → T008 → T009 → T010/T011
  → T012 → T013 → T014 → T015 → T016–T018.
- T003 (host, isolation) blocks T005 and T012; T004 (icons) blocks T008.
- US2 needs US1's markup (class names), so it follows US1.

## Parallel Opportunities

- T002, T003, and T004 at the same time; T002 waits on the Libraries, so start it first.
- T010 and T011 by different people.
- T012–T014 (styles) can start as soon as T005 is written, if the Libraries are slow, since the
  styles only depend on the contract's class names.

## Implementation Strategy

1. Start T002 on day one; it's the long pole.
2. MVP = Setup + US1: working, described, accessible cards.
3. Then US2 (lib.umd.edu look).
