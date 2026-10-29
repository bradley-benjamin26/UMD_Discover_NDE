# Research: UMD Design System for Discover

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

## R1. Where brand styles live

- **Decision**: All brand CSS goes in the existing theme bundle `src/app/styles/_customized-theme.scss`,
  which `angular.json` already compiles to the separate `custom` stylesheet (`inject: false`) that
  NDE loads. Brand values are CSS custom properties defined once at the top of that bundle.
  `src/assets/css/custom.css` stays empty.
- **Rationale**: One compiled file, one source of truth for tokens (FR-003, SC-001), Sass available
  for the Material theme, no new build step. Matches the package's documented theming path
  (README "Creating your own color theme").
- **Alternatives**: Hand-written `assets/css/custom.css` (the prior project's approach): no Sass, no
  Material theme mixins, and values were repeated as literals (e.g. `#ffffff`, `#000000` scattered).
  Two stylesheets: rejected, values drift between them.

## R2. Restyling Discover's buttons, chips, tags, cards

- **Decision**: Generate an Angular Material 3 theme from Maryland red `#E21833`
  (`ng generate @angular/material:m3-theme`, light only, system variables on) into
  `src/app/styles/m3-theme.scss`, and enable it in `_customized-theme.scss` under
  `.custom-nde-theme` as the README describes. Override only what the theme cannot express
  (typography families, focus ring, chip/tag shape) with a small number of rules that use tokens.
- **Rationale**: NDE's controls are Angular Material components; theming them through Material's
  own tokens restyles every instance at once and survives NDE markup changes far better than
  overriding vendor class names (edge case: vendor update degrades to defaults, not broken layout).
- **Alternatives**: Per-selector overrides with `!important` (prior project): fragile, each new NDE
  release can break them, and hard to test. Rejected except for the few gaps above.
- **Dependency**: The view must use the custom theme in Alma's view configuration; noted in
  quickstart.

## R3. Colors and contrast

Measured WCAG contrast for the lib.umd.edu tokens (`reference/tokens.css`):

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| Maryland red `#E21833` | white | 4.76 | Text, links, borders: pass |
| white | Maryland red | 4.76 | Global bar, primary button text: pass |
| dark red `#A90007` | white | 7.81 | Hover/active text: pass |
| medium gray `#757575` | white | 4.61 | Secondary text: pass (barely) |
| medium gray `#757575` | lightest gray `#FAFAFA` | 4.41 | **Fails** for body text |
| Maryland red | lighter gray `#F1F1F1` | 4.21 | **Fails** for body text (lib.umd.edu active tab) |
| Maryland yellow `#FFD200` | white | 1.45 | **Fails** (lib.umd.edu focus ring) |
| Maryland yellow | black | 14.47 | Pass |
| Maryland yellow | Maryland red | 3.28 | Pass for focus ring (3:1) |
| darker gray `#242424` | white | 15.52 | Pass |
| status green `#037623` | white | 5.80 | Pass |
| border gray `#BDBFC8` | white | 1.83 | Decorative only, never sole boundary of a control |

- **Decision**: Focus ring = 3px solid darker gray `#242424` with 2px offset on light surfaces;
  Maryland yellow on dark surfaces (red global bar, black footer). Medium gray text only on white.
  Red text only on white. Control boundaries that must be seen use `#757575` or darker (≥3:1).
- **Rationale**: Every pair used meets FR-006; deviations from lib.umd.edu are recorded here, as the
  spec requires.
- **Alternatives**: Copying lib.umd.edu's yellow ring everywhere: fails 3:1 on white.

## R4. Fonts (FR-007, FR-008)

- **Decision**: Self-host the font files, Latin subset, `font-display: swap`, in
  `src/assets/fonts/`:
  - Headings: **Crimson Pro** 400/600/700 (as lib.umd.edu).
  - Display/labels: **Barlow Condensed** 600/700 italic (as lib.umd.edu).
  - Body: **Interstate** 400/600–700, covered for package redistribution by the UMD Libraries
    license; fallback: Helvetica, Arial, sans-serif.
- **Rationale**: Use the same font families as lib.umd.edu, while keeping all font requests local
  to the Discover customization package. `font-display: swap` prevents invisible text if a font
  fails to load.
- **Alternatives**: The prior Barlow body substitute was license-safe but visibly different from
  lib.umd.edu. Loading the font from an external service would add a third-party request and is
  unnecessary because the approved font files are packaged locally.
- **Budget**: Keep the font payload within the existing page-load budget; include only font weights
  used by Discover and preserve the existing WOFF2 assets for the openly licensed families.

## R5. Header (FR-001)

Findings in the prior project's header (`customModule-main/src/assets/header-footer/header_en.html`,
copied from the lib.umd.edu Drupal page):

- 61 of its links are site-relative (`href="/find"`), so on the Primo host they point to
  `usmai-umcp.primo.exlibrisgroup.com/find`: broken.
- 22 menu buttons (`aria-expanded`, submenus) depend on a script that was commented out, so none of
  them work: announced as menu controls but do nothing (WCAG 4.1.2 failure).
- It loaded `drupal_theme.css`, which references licensed Interstate.

- **Decision**: A new, hand-written static header in `src/assets/header-footer/header_en.html`:
  the red UMD global bar ("University of Maryland" → umd.edu), the Libraries logo
  (→ www.lib.umd.edu), and two right-justified navigation rows to the right of the logo. The first
  row has utility links (Locations & Hours, System Status, Get Help, Info For, Accounts, Search);
  the second has the primary links (Find, Borrow, Request; Visit and Study; Research and Learning;
  Collections; About). Destination links are paired with native `<details>` / `<summary>` dropdowns
  for the previous implementation's submenu links. Rows wrap and remain right-justified on narrow
  screens.
- **Rationale**: Static HTML is the mechanism the prior project proved NDE loads. The previous
  header's submenu buttons depended on a commented-out script, so this version uses built-in
  disclosure elements instead; their open/closed state, pointer activation, and keyboard operation
  work without JavaScript. The navigation labels and destinations are listed in the
  [header/footer contract](./contracts/header-footer.md).
- **Alternatives**: Full mega-menu as an Angular component at a header hook: matches more closely,
  but adds interactive code, focus management, and tests for a menu that duplicates lib.umd.edu's
  navigation. Rejected for v1; can be a later spec if needed.
- **Skip link**: Spec 007 puts "Skip to main content" before this header; it ships with this
  feature.

## R6. Footer (FR-002)

- **Decision**: Static `src/assets/header-footer/footer_en.html`: Libraries name and address,
  library list, information, services, and social links as in the prior footer, with all links
  absolute, black background, white text, yellow focus ring. No embedded fonts.
- **Rationale**: The prior footer's content is right (seen in the PDF), but its 777 KB stylesheet
  embeds licensed Interstate and it has 10 site-relative links. A clean rewrite is smaller than
  cleaning it.

## R7. Testing (Constitution IV)

- **Decision**:
  - `node:test` tests in `tests/` (the repo's existing pattern, no new dependency) for:
    token set completeness; every colour literal in the compiled `custom` stylesheet is a token
    (SC-001); WCAG contrast of every declared foreground/background pair (FR-006); fonts are local
    and OFL-licensed, no third-party URLs anywhere in the bundle or header/footer (SC-004); header
    and footer HTML have only absolute `https://` links, alt text on images, no buttons without
    scripts, landmark elements present.
  - `ng test` (Karma/Jasmine, existing) only if an Angular component is added (not planned here).
  - Page-level checks (axe browser extension, keyboard, screen reader, 320 px, 200% zoom,
    forced colours) run manually through proxy mode, recorded in quickstart.
- **Rationale**: Every testable rule gets a failing test first; the rest has a written manual
  check. No Playwright/axe dependency added (Constitution VI); revisit if manual checks prove
  unreliable.
- **Gap**: `npm test` runs only `ng test`. Add `node --test tests/` to the test script so both run.

## R8. Performance (SC-005)

- **Decision**: Budget: theme stylesheet ≤ 60 KB uncompressed, fonts ≤ 160 KB, header + footer
  HTML ≤ 32 KB, no images except the logo SVG. The larger header budget covers both desktop and
  mobile navigation and their dropdown links while keeping the files small. Measured before/after with the browser's
  network
  panel in proxy mode.

## Spike findings (T005, proxy mode, 2026-10-28)

Method: `npm run build`, `npm run start:proxy` (target `https://usmai-umcp.primo.exlibrisgroup.com`),
`http://localhost:4201/nde/...?vid=01USMAI_UMCP:NDE&lang=en`, headless Chrome via puppeteer-core
(installed outside the repo), `networkidle2` plus a 4–5 s wait. Temporary `header_en.html` /
`footer_en.html` held `<p style="color:red">MARKER</p><svg aria-hidden="true"><rect width="1" height="1"/></svg>`;
both were deleted afterwards and the build re-run.

### (a) Static header/footer insertion

| Page | URL | Header | Footer | `style` kept | inline `<svg>` kept |
|---|---|---|---|---|---|
| Home | `/nde/home` | yes | yes | yes | yes |
| Search results | `/nde/search?query=climate…` | yes | yes | yes | yes |
| Full record | `/nde/fulldisplay?docid=alma9963872540808238…` | yes | yes | yes | yes |
| Saved records (signed out) | `/nde/account/favorites` | yes | yes | yes | yes |
| Collection Discovery | `/nde/collectionDiscovery` | yes | yes | yes | yes |
| My library activity / loans / requests | — | NOT OBSERVED — needs UMD CAS login (menu item opens the login dialog) | | | |

- Header is injected as `nde-header > div > (our HTML)`, at the top of `nde-header` before the skip links.
  The footer goes in `nde-footer > div.footer-content > (our HTML)`. Both sit inside `nde-app-layout > section.container`.
- Neither the `style` attribute nor the inline SVG is stripped (output was byte-identical apart from
  `<rect/>` becoming `<rect></rect>`).
- `/nde/favorites` is not a route ("page not found"). The route is `/nde/account/favorites`.

### (b) Theme class

`.custom-nde-theme` is present on `<body>` on every page tested
(`body.mat-typography.mat-app-background.nde-overrides.custom-nde-theme`). `<html>` has no class.

### (c) NDE elements (results for `climate`, facet `rtype,include,books` applied via URL)

| Element | Observed markup (trimmed) | Selector to use | Material? |
|---|---|---|---|
| Primary button | `button[mat-flat-button][color=primary].mdc-button--unelevated.mat-mdc-unelevated-button.mat-primary` ("Apply filters", `#applyFiltersButton`) | `.mat-mdc-unelevated-button.mat-primary` | yes |
| Secondary button | `button[mat-stroked-button].mdc-button--outlined.mat-mdc-outlined-button` (quick filters, `.quick-filter-btn`) | `.mat-mdc-outlined-button` | yes |
| Text buttons (most actions) | `button[mat-button].mdc-button.mat-mdc-button` (`.mat-primary` or `.mat-unthemed`), e.g. Advanced search, Available Online `.quicklink-button` | `.mat-mdc-button` | yes |
| Applied-facet summary | `nde-selected-filters > button.selected-filters-container[aria-haspopup][aria-expanded][data-qa=Selected_rtype]`, label "Resource Type (1)", aria-label "Showing results filtered by Resource Type". This is a custom button, not a chip. | `nde-selected-filters button.selected-filters-container` | no |
| Applied-facet chip (inside the dropdown, shown only when expanded) | `.dropdown-box > .selected-value-chip-container > mat-chip-listbox > mat-chip-option.mat-mdc-chip.mat-mdc-chip-option.selected-value-chip.selected-chip.mat-primary` | `nde-selected-filters .mat-mdc-chip-option.selected-chip` | yes |
| Chip remove control | `button[matchipremove].mat-mdc-chip-remove.mat-mdc-chip-trailing-icon.remove-chip[role=button][tabindex=-1]`, accessible name from `aria-label="Use space or delete to remove the active filter"` (no text, and it does not name the value). The chip's primary action has `aria-label="Active filter  Books"`. | `nde-selected-filters .mat-mdc-chip-remove` | yes |
| Resource-type label | `nde-record-type > span.record-type.text-uppercase` ("Book") | `nde-record-type .record-type` | no |
| Indication tags | `nde-record-indications .record-indication-cont > div > mat-icon + span.record-indication.text-uppercase` ("Open Access", "Peer Reviewed") plus `span.sr-only` | `nde-record-indications .record-indication` | no (contains `mat-icon`) |
| Availability (physical) | `nde-physical-availability-line > div.availability-status > mat-icon.available-record-indicator-color + button[mat-button].available-at-button` | `nde-physical-availability-line .availability-status` | partly (mat-icon and mat-button) |
| Availability (online) | `nde-online-availability button[mat-button][color=primary].quicklink-button` ("Available Online") | `nde-online-availability .quicklink-button` | yes (`mat-mdc-button`) |
| Result card | `nde-search-result-item-container > div.search-result-item.card` | `nde-search-result-item-container .search-result-item` | no |
| Result title link | `nde-record-title[data-qa=brief_result_title] > a.record-title.anchor-tag-style.mat-body-large[data-qa=go_to_full_display]` (plus a visually hidden `h3`) | `nde-record-title a.record-title` | no (`mat-body-large` is only a typography class) |

Notes: there are no `mat-chip` elements outside the applied-filter dropdown. The back-to-top control is
`.mat-mdc-mini-fab.mat-primary`. The full record page offered no filled/raised buttons while signed out.
A `mat-snack-bar` ("Sign in to view available request and scan options") appears on results pages.
