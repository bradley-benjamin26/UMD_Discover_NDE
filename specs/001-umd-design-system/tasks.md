---

description: "Task list for 001 UMD Design System for Discover"
---

# Tasks: UMD Design System for Discover

**Input**: Design documents from `/specs/001-umd-design-system/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Required (Constitution IV). Every test task is run and seen failing for the expected
reason before its implementation task starts; record the failing output in the PR.

**Release rule**: 001 merges only together with 007 (skip link), so the header never ships without
it.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = looks like UMD Libraries (header, footer, type, colour); US2 = Discover's
  controls restyled

---

## Phase 1: Setup

- [ ] T001 Create and switch to branch `001-umd-design-system` from `main` (`git checkout -b 001-umd-design-system`); uncommitted `specs/` files come along.
- [ ] T002 In `package.json`, change `"test"` to `"ng test --watch=false --browsers=ChromeHeadless && npm run test:assets"` and add `"test:assets": "npm run build && node --test tests/"`. Run `npm test`; the existing `tests/proxy.test.js` and `tests/asset-manifest.test.js` have never run under `npm test`, so report any failures as found (do not skip or weaken them).
- [ ] T003 [P] Download WOFF2 (Latin subset) into `src/assets/fonts/`: Crimson Pro 400, 600, 700; Barlow Condensed 600, 700 italic; Barlow 400, 600, 700 (8 files, total ≤ 160 KB). Add each family's `OFL.txt` as `src/assets/fonts/OFL-CrimsonPro.txt`, `OFL-BarlowCondensed.txt`, `OFL-Barlow.txt`. Download at dev time only; nothing is loaded from Google at runtime.
- [ ] T004 [P] Copy `header-logo.svg` and `footer-logo.svg` from `customModule-main/src/assets/header-footer/` into `src/assets/header-footer/` (checked: no embedded raster or font data).
- [ ] T005 Spike in proxy mode (`npm run build`, `npm run start:proxy`), recording results in a new "Spike findings" section at the end of `specs/001-umd-design-system/research.md`: (a) with a minimal `src/assets/header-footer/header_en.html` and `footer_en.html` (one paragraph each), confirm NDE inserts them on every page type and whether it strips `style` attributes or inline `<svg>`; (b) confirm the Alma view uses the custom theme so `.custom-nde-theme` is on the page; (c) list the NDE elements for primary/secondary buttons, applied-facet chips and their remove control (and its accessible name), tags/labels, and result cards, and whether each is an Angular Material (`mat-mdc-*`) component. Delete the minimal header/footer afterwards.

---

## Phase 2: Foundational (tokens, fonts, Material theme)

**⚠️ Blocks both stories.**

- [ ] T006 Write `tests/theme-tokens.test.js` (`node:test`, reads `dist/01USMAI_UMCP-NDE/custom.css`) asserting, per [contracts/theme-tokens.md](./contracts/theme-tokens.md) and [data-model.md](./data-model.md): each token is defined exactly once with these values: `--maryland-red: #E21833`, `--dark-red: #A90007`, `--maryland-yellow: #FFD200`, `--white: #FFFFFF`, `--black: #000000`, `--lightest-gray: #FAFAFA`, `--lighter-gray: #F1F1F1`, `--light-gray: #E6E6E6`, `--medium-gray: #757575`, `--dark-gray: #454545`, `--darker-gray: #242424`, `--green: #037623`, `--space-xs`…`--space-3xl` = 0.5, 1, 1.5, 2, 3, 4, 7.5 rem, `--text-sm`…`--text-3xl` = 0.875, 1, 1.15, 1.5, 2, 2.625 rem, `--radius-sm` 0.125rem, `--radius-md` 1rem, `--radius-pill` 999rem, `--focus-ring` "3px solid var(--darker-gray)", `--focus-ring-on-dark` "3px solid var(--maryland-yellow)", `--focus-offset` 2px, `--font-heading`/`--font-display`/`--font-body` as in data-model; no colour literal (`#…`, `rgb(`, `hsl(`) outside the token block and Material's generated palette; every "Allowed pairs" row meets its minimum (compute WCAG contrast in the test); every `@font-face` `src` is a local `assets/fonts/*.woff2` with `font-display: swap`; no `http://` or `https://` anywhere in the file; file ≤ 60 KB.
- [ ] T007 Run `npm run test:assets`; confirm T006 fails because the tokens are missing (not because of a test bug). Record output.
- [ ] T008 Regenerate `src/app/styles/m3-theme.scss` with `ng generate @angular/material:m3-theme`: primary `#E21833`, directory `src/app/styles/`, system-level variables yes, light only. In the generated theme definition set typography `plain-family: Barlow` and `brand-family: "Crimson Pro"`.
- [ ] T009 Create `src/app/styles/_tokens.scss` with a single `:root` block holding exactly the tokens listed in T006 (lib.umd.edu names, from `specs/001-umd-design-system/reference/tokens.css`), and `@use` it first in `src/app/styles/_customized-theme.scss`. (A partial rather than inline so feature 004 can reuse it if the homepage is isolated.)
- [ ] T010 Add `@font-face` rules for the 8 files from T003 to `src/app/styles/_customized-theme.scss` (`font-display: swap`, `url('assets/fonts/…woff2') format('woff2')`). After `npm run build`, confirm the URLs in `dist/01USMAI_UMCP-NDE/custom.css` resolve in proxy mode (Angular may rewrite or hash them); adjust the path if not.
- [ ] T011 In `src/app/styles/_customized-theme.scss`, uncomment and enable `.custom-nde-theme { @include mat.all-component-colors(m3-theme.$light-theme); @include mat.system-level-colors(m3-theme.$light-theme); }` and add typography via `mat.system-level-typography` (or the 18.2 equivalent) so Material text uses Barlow/Crimson Pro.
- [ ] T012 Add base rules in `src/app/styles/_customized-theme.scss` scoped to `.custom-nde-theme`: body `font-family: var(--font-body)`; `h1`–`h3` `var(--font-heading)`; links `var(--maryland-red)` underlined, hover `var(--dark-red)`; `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-offset) }`; `@media (prefers-reduced-motion: reduce)` removes transitions/animations; `@media (forced-colors: active)` sets focus outline to `Highlight`.
- [ ] T013 Run `npm run test:assets`; T006 passes. Fix code, not tests.

**Checkpoint**: Tokens, fonts, and Material theme in the one compiled stylesheet.

---

## Phase 3: User Story 1 - Discover looks like part of UMD Libraries (P1) 🎯 MVP

**Goal**: UMD global bar, Libraries header and footer, UMD type and colour on every page.

**Independent Test**: Each page type side by side with lib.umd.edu matches the reference for
header, footer, typography, links ([quickstart](./quickstart.md)).

### Tests (write first, see fail)

- [ ] T014 [US1] Write `tests/header-footer.test.js` (`node:test`, reads `src/assets/header-footer/header_en.html` and `footer_en.html`) per [contracts/header-footer.md](./contracts/header-footer.md): every `href` is absolute `https://` or `tel:`; no `<script`, no ` on[a-z]+=` attributes, no `<button`; no `<link`, `@import`, or external font/style URLs; every `<img` has `alt` and `width`/`height`; no `target="_blank"`; header: exactly one `<header`, one link `https://umd.edu/` with text "University of Maryland", logo link `https://www.lib.umd.edu/` whose name is "University of Maryland Libraries home", one `<nav aria-label="University Libraries">` containing exactly these six links in order: Find, Borrow, Request → `https://www.lib.umd.edu/find`; Research and Learning → `/research`; Visit and Study → `/visit`; Collections → `/collections`; Info For → `/information`; About → `/about` (all prefixed `https://www.lib.umd.edu`); footer: exactly one `<footer`; `<h2>` headings Our Libraries, Library Information, Services & Support, Get Involved, Stay Connected each followed by a `<ul>`; phone link exactly `tel:+13014050800`; each social link has an accessible name ("University Libraries on Facebook/Instagram/YouTube"); bottom links Give Now, Privacy Policy, Web Accessibility; combined size of both files ≤ 20 KB.
- [ ] T015 [US1] Run `npm run test:assets`; confirm T014 fails because the files don't exist yet. Record output.

### Implementation

- [ ] T016 [P] [US1] Write `src/assets/header-footer/header_en.html`: red global bar with link "University of Maryland" → `https://umd.edu/`; logo `<img src="assets/header-footer/header-logo.svg" alt="" width="270" height="81">` inside a link to `https://www.lib.umd.edu/` with visually hidden text "University of Maryland Libraries home"; `<nav aria-label="University Libraries">` with the six links from T014 as a plain `<ul>`. No buttons, no scripts, no submenus. Check the six URLs against lib.umd.edu before marking done.
- [ ] T017 [P] [US1] Write `src/assets/header-footer/footer_en.html` (content from the prior footer, every relative link rewritten to `https://www.lib.umd.edu/…`): logo + "University Libraries", "McKeldin Library, 7649 Library Lane, College Park, MD 20742-7011", phone `301.405.0800` as `tel:+13014050800` (the prior `tel:+3014050800` dials Greece); Our Libraries: McKeldin Library (Main) `/visit/libraries/mckeldin`, Architecture Library `/visit/libraries/architecture`, Art Library `/visit/libraries/art`, Hornbake Library `/visit/libraries/hornbake`, Michelle Smith Performing Arts Library `/visit/libraries/mspal`, Priddy Library (Universities at Shady Grove) `https://shadygrove.usmd.edu/library`, Severn Library `/visit/libraries/severn`, STEM Library `/visit/libraries/stem`; Library Information: Library Hours `https://umd.libcal.com/hours`, Libraries' Directory `/about/contact/directory`; Services & Support: Ask a Librarian `https://umd.libanswers.com/`, Share Feedback `https://libumd.wufoo.com/forms/library-suggestions`, Contact a Subject Specialist `https://lib.guides.umd.edu/prf.php`; Get Involved: Support the Libraries `https://giving.umd.edu/campaigns/academics-campus-areas/campus-areas/lib`, Careers `/about/careers`; Stay Connected: Facebook `https://www.facebook.com/UMDLibraries`, Instagram `https://www.instagram.com/umdlibraries` (prior was `http://`), YouTube `https://www.youtube.com/user/UMDLibraries1`, View All Accounts `/social-media`, social icons inline SVG from the UMD icons library with `aria-hidden="true" focusable="false"` (add the MIT notice to `src/assets/header-footer/THIRD_PARTY_NOTICES.md`); bottom bar: Give Now (giving URL), Privacy Policy `https://www.lib.umd.edu/about/policies/privacy`, Web Accessibility `https://www.umd.edu/web-accessibility`, "© 2026 University of Maryland". Omit the prior Fearlessly Forward and Federal Depository badges (their images point to Drupal paths that don't exist on Primo); list them in the PR as needing image files from the Libraries.
- [ ] T018 [US1] Add header and footer styles to `src/app/styles/_customized-theme.scss` using tokens only: global bar `var(--maryland-red)` background, `var(--white)` text; nav links `var(--darker-gray)` in `var(--font-display)`, wrapping with `gap: var(--space-sm)` so 320 px has no horizontal scroll; footer `var(--black)` background, `var(--white)` text, `h2` in `var(--font-heading)`; inside the global bar and footer, `:focus-visible` uses `var(--focus-ring-on-dark)`; max content width 1440px as on lib.umd.edu.
- [ ] T019 [US1] Run `npm run test:assets`; T006 and T014 pass.
- [ ] T020 [US1] Manual US1 checks from [quickstart.md](./quickstart.md) on every page type: side-by-side match, network panel (fonts from `/custom/…/assets/fonts/`, no new third-party domains), 320 px, 200% zoom, forced colours, fonts blocked → fallback with no invisible text. Record results.

**Checkpoint**: US1 complete and testable on its own.

---

## Phase 4: User Story 2 - Discover's controls look and behave like UMD's (P2)

**Goal**: Buttons, chips, tags, and cards restyled per [data-model.md](./data-model.md#component-styles).

**Independent Test**: Search, apply two facets, open a record, open My Library; every control
matches the reference in default, hover, focus, active, disabled states.

### Tests (write first, see fail)

- [ ] T021 [US2] Extend `tests/theme-tokens.test.js` with US2 assertions against the built stylesheet, using the selectors recorded in T005: chip remove control has `min-width` and `min-height` ≥ 24px; buttons, chips, and card title links have a `:focus-visible` rule using `var(--focus-ring)`; a `prefers-reduced-motion` block and a `forced-colors` block exist covering chips, buttons, and cards; no declared colour in component rules is a literal. Run `npm run test:assets` and confirm the new assertions fail.

### Implementation

- [ ] T022 [US2] Add component rules to `src/app/styles/_customized-theme.scss`, only where the Material theme (T011) doesn't already produce the look, exactly per data-model: Primary button `var(--maryland-red)` fill, `var(--white)` text, `var(--radius-sm)`, hover/active `var(--dark-red)`; Secondary button `var(--white)` fill, `var(--maryland-red)` text and 1px border, hover `var(--lightest-gray)` fill and `var(--dark-red)` text; Chip `var(--white)` fill, `var(--medium-gray)` border, `var(--darker-gray)` text, `var(--radius-pill)`, remove icon ≥ 24×24 px, hover `var(--lighter-gray)`; Tag `var(--lighter-gray)` fill, `var(--darker-gray)` text, `var(--text-sm)`, uppercase `var(--font-display)`; Card `var(--white)` fill, `var(--light-gray)` border, `var(--radius-md)`, title `var(--font-heading)`, hover border `var(--medium-gray)`; disabled keeps Material's treatment. Forced colours: borders `CanvasText`, focus `Highlight`. Comment each `!important` with why.
- [ ] T023 [US2] Run `npm run test:assets`; all assertions pass.
- [ ] T024 [US2] Manual US2 checks: search "climate", apply two facets, remove one by keyboard (remove control reachable, named "Remove filter: …"; if Discover's own name differs, record it as a Discover issue in the PR rather than masking it), open a record, open My Library; check each control's five states, availability/type labels readable without colour. Record results.

**Checkpoint**: US1 and US2 both work.

---

## Phase 5: Polish & Release

- [ ] T025 Run axe DevTools on home, results, full record, My Library, and a collection page; 0 WCAG 2.2 AA violations introduced (SC-003). Record any Discover-owned violations separately for the accessibility audit.
- [ ] T026 Measure page load with the theme on vs. off on a results page; increase ≤ 10% (SC-005). Record numbers.
- [ ] T027 Confirm `npm test` passes end to end and the built package `dist/01USMAI_UMCP-NDE.zip` contains `custom.css`, `assets/fonts/*`, and `assets/header-footer/*`, and no `fonts.css` from the lib.umd.edu capture.
- [ ] T028 Open the PR only once 007 is also complete; link both and include the recorded test failures (T007, T015, T021), manual check results, and the open items (badge images, any Discover-owned accessibility issues).

---

## Dependencies & Execution Order

- Setup (T001–T005) → Foundational (T006–T013) → US1 (T014–T020) and US2 (T021–T024) → Polish (T025–T028).
- T005 (spike) must finish before T018 and T021–T022 (selectors).
- US1 and US2 both edit `_customized-theme.scss`; they can be done in either order but not in
  parallel by two people without coordinating that file.
- 007 depends on US1's header (T016) and must be complete before T028.

## Parallel Opportunities

- T003 and T004 (different folders) alongside T002.
- T016 (header) and T017 (footer) once T015 has been seen failing.

## Implementation Strategy

1. MVP = Setup + Foundational + US1, plus 007: Discover looks like the Libraries site and stays
   keyboard accessible.
2. Then US2 (controls).
3. Each test task is seen failing before its implementation; code is fixed, never the test, to make
   it pass.
