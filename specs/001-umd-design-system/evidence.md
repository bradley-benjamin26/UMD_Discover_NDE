# 001 test & check evidence

## T007 — theme-tokens test fails before implementation (RED)

Command: `npm run test:assets` (2026-10-28). Build succeeded; `dist/01USMAI_UMCP-NDE/custom.css`
exists and is 0 bytes (theme SCSS has no rules yet), so the file path is right and the failures
are missing tokens/fonts. Result: 18 tests, 9 pass, 9 fail. The 7 existing node tests pass.

Failing (first assertion message):

- theme tokens live in a single :root block — expected exactly one :root block declaring --maryland-red (actual 0)
- every theme token is declared exactly once in the stylesheet — tokens not declared exactly once (every token count 0)
- colour tokens have the lib.umd.edu values — --maryland-red must be declared exactly once (found 0)
- spacing, type-scale, radius and focus-offset tokens have their values — --space-xs must be declared exactly once (found 0)
- focus ring tokens reference the token colours — --focus-ring must be declared exactly once (found 0)
- font family tokens name the brand families — --font-heading must be declared exactly once (found 0)
- no colour literal outside the token block and Material-generated properties — token block not found, cannot check the rest of the file
- every allowed text/background pair meets its contrast minimum — --darker-gray must be declared exactly once (found 0)
- @font-face rules load all local WOFF2 fonts with font-display: swap — referenced fonts [] not deep-equal to the 8 files in src/assets/fonts

Passing now (guards, true of the empty file): no http:// or https:// reference; at most 60 KB.

Test sanity check: against a hand-made stylesheet with all tokens, 8 `@font-face` rules and the
compiled Material M3 output (`all-component-colors` + `system-level-colors`, compressed), all
11 tests pass; adding `color:#fff` and an SVG data URI with `xmlns=http://…` fails the two
guard tests.

## T015 — header/footer test fails before implementation (RED)

`npm run test:assets` with `tests/header-footer.test.js` added and no `header_en.html` /
`footer_en.html` yet. Result: 33 tests, 18 pass, 15 fail. The 18 existing tests (theme tokens,
asset manifest, proxy) pass; all 15 new header/footer tests fail, each with
`ENOENT: no such file or directory` for `src/assets/header-footer/header_en.html` or
`footer_en.html` (the size test fails on `stat`), so they fail because the files are missing,
not because of a test bug.

Failing: every href is absolute https:// or tel:; no script, inline event handler or button;
no external stylesheet or font loading, no style attribute that hides content; every img has
alt, width and height; no link opens a new tab; header and footer together are at most 20 KB;
header has exactly one `<header>`; header global bar links "University of Maryland" to umd.edu;
header logo links to lib.umd.edu with the Libraries home name; header nav "University
Libraries" has the six top-level links in order; footer has exactly one `<footer>`; footer
link groups are `<h2>` headings each followed by a `<ul>`; footer phone link is
tel:+13014050800; footer social links have accessible names and aria-hidden icons; footer
bottom bar has Give Now, Privacy Policy, Web Accessibility and the copyright.

Test sanity check: `HF_DIR` pointed at hand-made compliant files outside the repo passes all 15.
Single injected violations each fail the targeted test: `http://` link, site-relative `/about`,
`target="_blank"`, `onclick=`, swapped nav order, img without `alt`, wrong logo name, `<p>`
between `<h2>` and `<ul>`, wrong `tel:`, svg without `aria-hidden`, `<link>` to a font
stylesheet, wrong social name, `style="display:none"`. The footer's inline SVG
`xmlns="http://www.w3.org/2000/svg"` does not trip any rule.

## T020 — US1 manual checks

Method (2026-10-28): `npm run build` (exit 0), `npm run start:proxy` on :4201 (target
`usmai-umcp.primo.exlibrisgroup.com`), headless Chrome via puppeteer-core, `networkidle2` + 4 s.
Pages: home `/nde/home`; search `/nde/search?query=climate…`; record
`/nde/fulldisplay?…docid=alma9963872540808238…` (first result); favorites `/nde/account/favorites`
(signed out); collections `/nde/collectionDiscovery`. My Library activity/loans/requests: NOT
OBSERVED — needs UMD CAS login. 200% zoom is emulated as a 640 CSS px viewport (= 1280 px at
200%), not browser zoom. Forced colours via CDP `Emulation.setEmulatedMedia` `forced-colors: active`
(puppeteer's `emulateMediaFeatures` rejects it); `matchMedia('(forced-colors: active)')` was true on
every page. Fonts blocked = request interception aborting every `*.woff2`. lib.umd.edu returns
403 to the default headless user agent; it was captured with a desktop Chrome UA.

| Check | home | search | record | favorites | collections |
|---|---|---|---|---|---|
| Computed styles | PASS | PASS | PASS | PASS | PASS |
| Logo images | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| Side-by-side visual | PENDING-HUMAN | PENDING-HUMAN | PENDING-HUMAN | PENDING-HUMAN | PENDING-HUMAN |
| Fonts from `/custom/…/assets/fonts/` | PASS | PASS | PASS | PASS | PASS |
| No third-party domain from us | PASS | PASS | PASS | PASS | PASS |
| 320 px no h-scroll | PASS | **FAIL (NDE)** | PASS | PASS | PASS |
| 640 px (200%) no h-scroll / H+F unclipped | PASS | PASS | PASS | PASS | PASS |
| Forced colours: header focus outline | PASS | PASS | PASS¹ | PASS | PASS |
| Forced colours visual | PENDING-HUMAN | PENDING-HUMAN | PENDING-HUMAN | PENDING-HUMAN | PENDING-HUMAN |
| Fonts blocked: text visible | PASS | PASS | PASS | PASS | PASS |

Evidence, one line each:

- Computed styles (all 5 pages, identical): `.umd-header` and `.umd-footer` present; global bar
  bg `rgb(226, 24, 51)`; nav `"Barlow Condensed", sans-serif`, `rgb(36, 36, 36)`; footer bg
  `rgb(0, 0, 0)`, text white; footer h2 `"Crimson Pro", serif`; body `Barlow, Helvetica, Arial,
  sans-serif`; body has `custom-nde-theme`. First visible non-header link ("New Search", a Material
  button) is `rgb(191, 0, 37)` = M3 primary-40 `#bf0025`, not `--maryland-red` (plain-link colour
  not separately sampled).
- **Logo FAIL**: `<img src="assets/header-footer/header-logo.svg">` (and `footer-logo.svg`) resolve
  against the page to `http://localhost:4201/nde/assets/header-footer/…` → **404**, `naturalWidth 0`,
  broken-image box in every header/footer screenshot. The file exists at
  `/nde/custom/01USMAI_UMCP-NDE/assets/header-footer/header-logo.svg` (200, `image/svg+xml`). Seen in
  proxy mode only; production behaviour NOT OBSERVED.
- Side-by-side, measured differences vs. lib.umd.edu (for the human reviewer, not judged here):
  live global bar text is centred, uppercase serif (`Crimson, serif`), not underlined — ours is
  left-aligned, underlined Barlow; live nav is `Interstate` on the logo's row, right-aligned, with
  submenu chevrons and a utility row — ours is Barlow Condensed on a second row under the logo (no
  submenus, by design T016); live footer bg also `rgb(0, 0, 0)`; live body `Interstate` (licensed;
  Barlow substitute by design); live h2 `"Barlow Condensed", Interstate`.
- Fonts (200): home/favorites/collections load `Barlow-400`, `CrimsonPro-400`, `BarlowCondensed-600`
  (+`CrimsonPro-600` on home/record, `Barlow-600` on search), all from
  `/nde/custom/01USMAI_UMCP-NDE/assets/fonts/`. NDE's own `/nde/assets/fonts/google/*.woff2` also load
  (same origin, not ours). No `fonts.googleapis.com` / `fonts.gstatic.com` request on any page.
- Hostnames: home, favorites: `localhost:4201` only; search: + `proxy-na.hosted.exlibrisgroup.com`,
  `www.kanopy.com`; record: + `proxy-na.hosted.exlibrisgroup.com`; collections: +
  `na04.alma.exlibrisgroup.com`. No request's initiator is our `custom.css` or header/footer;
  built `custom.css` contains no `http(s)://`; header/footer `https://` URLs are all `<a href>`, the
  two `<img src>` are relative. All third-party hosts are NDE content (thumbnails, Kanopy).
- **320 px FAIL (search, NDE-owned)**: `scrollWidth 324` from NDE's tab-bar "More" button
  (`button.mat-mdc-menu-trigger.show-more-btn`, ripple/touch-target spans reach x=324). Reproduces
  with our `custom.css` blocked (324, body font `Noto Sans Display`); one run with our CSS gave 320,
  so it is intermittent/state-dependent and not caused by us. Other pages: `scrollWidth 320`; record
  and favorites have off-screen cards/menu items inside NDE scroll containers (page does not scroll).
  No header/footer element off-screen; only clipped element is `.umd-visually-hidden` (intended).
- 640 px: `scrollWidth 640` on all pages; no header/footer element outside the viewport or clipped.
- Forced colours: Tab reaches header link "University of Maryland" with `:focus-visible`,
  `outline 3px solid` (after 31 Tabs home, 1 search, 32 favorites, 29 collections). ¹Record: not
  reached in 40 Tabs; after one Tab, `.focus()` on `.umd-global-bar a` → `3px solid`, `.umd-nav a`
  → `2px solid`, both `:focus-visible`. Outline colour reports `rgba(0, 230, 255, 0.8)` in all cases.
  Note: tab order puts the header link after ~30 controls on most pages (skip-link order is spec 007).
- Fonts blocked: all `.woff2` requests `net::ERR_FAILED`; `document.fonts` Barlow/Crimson faces
  `error`/`unloaded`, `document.fonts.status` `loaded`; nav link 192×21, footer h2 215×52, global
  bar link 169×18, all `opacity 1`, `visible`, non-transparent colour; screenshots show fallback
  text rendered.

Screenshots (scratchpad, not committed), directory
`/private/tmp/claude-504/-Users-bbradle1-Documents-projects-UMD-Discover-NDE/24ea0b80-79a8-45ee-9fc9-b7c3efdf1d48/scratchpad/t020/shots/`:
`{home,search,record,favorites,collections}-1440-{header,footer,full}.png`, `…-320.png`,
`…-640-zoom200.png`, `…-forced.png`, `…-forced-header-focus.png`, `…-fontsblocked.png`,
`…-fontsblocked-footer.png` (search 320/640 are viewport-only; full-page capture timed out);
`libumd-1440-{top,full,footer}.png`. Scripts and raw `results*.json` are in the parent `t020/`.

**Logo fix (2026-10-28):** RED test `img src values resolve under /nde/custom/<inst>-<view>/assets/`
failed (`header_en.html: img src "assets/header-footer/header-logo.svg" must start with
./custom/01USMAI_UMCP-NDE/assets/`). Both `<img src>` changed to `./custom/01USMAI_UMCP-NDE/assets/header-footer/…`.
GREEN: `node --test` pass 34 / fail 0. Proxy mode (:4201): both logo SVGs 200 `image/svg+xml`; home page
`naturalWidth` header 300, footer 250 (both > 0). Logo images row above is superseded: now PASS on home;
other pages share the same fragments but were not re-run.

PENDING-HUMAN: (1) header/footer likeness vs. lib.umd.edu — compare `*-1440-header.png` /
`*-1440-footer.png` with `libumd-1440-top.png` / `libumd-1440-footer.png`; (2) forced-colours
rendering — `*-forced.png`, `*-forced-header-focus.png`; (3) fallback-font layout —
`*-fontsblocked*.png`. Not run here: axe scan, keyboard/facet-chip checks, load-time baseline (not
in T020 scope).

## T021 — US2 assertions fail before implementation (RED)

`npm run test:assets` (2026-10-28): tests 44, pass 35, fail 9. All 34 earlier tests pass. 10 US2 tests were added:

```
✖ US2: chip remove control is at least 24x24 px            — .mat-mdc-chip-remove needs min-width >= 24px; found []
✖ US2: buttons, chip, chip remove and card title link have a :focus-visible rule using --focus-ring
                                                              — all 5 components missing
✖ US2: forced-colors block has explicit chip, button and card rules — all 5 selectors missing
✖ US2: component rules exist and declare no colour literals — all 8 components: "no rules"
✖ US2: primary button fill is --maryland-red                — found []
✖ US2: secondary button text is --maryland-red              — found []
✖ US2: chip border is --medium-gray                         — found []
✖ US2: result card border is --light-gray                   — found []
✖ US2: tags have a --lighter-gray background                — found []
✔ US2: prefers-reduced-motion removes transitions on chips, buttons and cards
```

None of the component selectors appear in the built `custom.css` (grep count 0). Material sets its
`--mdc-*` button and chip tokens only on `.custom-nde-theme`, so these failures come from the missing
component rules and not from the parser.

Reduced motion passes already: the T012 `.custom-nde-theme *` rule inside `@media (prefers-reduced-motion: reduce)`
sets `transition-duration` on every element, and the test accepts that universal rule (see the ruling in the test).

Sanity check: `THEME_CSS=<file> node --test --test-name-pattern='^US2'` against a hand-written minified
stylesheet that meets the data model gave pass 10 / fail 0. A copy with `#e6e6e6` as the card border and a
20px chip remove `min-height` gave fail 3 (24px, literal, card border), which is the expected result.

## T024 — US2 manual checks

Method (2026-10-28): `npm run build` (exit 0, log `.superpowers/sdd/tasks/T024-build.log`),
`npm run start:proxy -- --port 4202 --public-host http://localhost:4202 --live-reload false`
(stopped afterwards), headless Chrome via puppeteer-core, 1440×1000, `networkidle2` + 5 s. Signed out.
Five states: default; hover = `page.hover`; focus = real Tab key presses until the control is
`document.activeElement` (`:focus-visible` true), measured after 1.5 s (NDE's button rings have a
0.28 s transition); active = mouse down held, no release on target; disabled = search for
disabled instances. Contrast = WCAG 2.x formula on computed colours; where Material paints a state
layer over the fill, the rendered fill was read from the screenshot pixels instead.

**Facets (clicked, not URL).** Search `climate` → "All Filters" → clicked checkbox "Peer-reviewed
Journals" (Limit to; applies immediately) → clicked "Articles" (Resource Type) → clicked
"Apply filters". URL then had `mfacet=tlevel,include,peer_reviewed&mfacet=rtype,include,articles`;
two active filters: dropdown `Resource Type (1)` (chip "Articles") and the pressed quick filter
"Peer-reviewed Journals". (Language facet could not be clicked: its panel is collapsed.)

**Keyboard removal (exact sequence, no mouse after Apply):**
1. Focus starts in the open filters panel, which traps Tab (200 Tabs cycled inside it). Tab ×44 →
   "Close filters menu", **Enter** → panel closes, focus on "All Filters".
2. **Tab ×3** → `button.selected-filters-container` "Resource Type (1)" (`:focus-visible`, outline
   `3px solid rgb(36, 36, 36)`).
3. **Enter** → `aria-expanded="true"`, 1 chip shown, focus stays on the dropdown button.
4. **Tab** → chip primary action (`role=option`, aria-label "Active filter  Articles").
   (**ArrowRight** from here moves focus to the remove button; Tab leaves the dropdown.)
5. **Delete** → URL becomes `…&mfacet=tlevel,include,peer_reviewed…`; "Articles" removed,
   "Peer-reviewed Journals" still applied (checked, quick filter pressed). PASS.

**Accessible names:** dropdown button "Showing results filtered by Resource Type" (count not in
name); chip primary action "Active filter  Articles" (double space); remove control
`aria-label="Use space or delete to remove the active filter"`, `tabindex=-1`, does not name the
value. Expected "Remove filter: Articles" → **Discover-owned** (not masked).

| Control | Default | Hover | Focus (Tab) | Active (mouse down) | Disabled |
|---|---|---|---|---|---|
| Primary ("Apply filters") | PASS | PASS | **FAIL (ours)** | PASS | NOT OBSERVED |
| Secondary (quick filter, outlined) | PASS | PASS | **FAIL (ours)** | PASS | NOT OBSERVED |
| Secondary, selected/pressed | **FAIL (ours)** | — | — | — | — |
| Chip ("Articles") | **FAIL (ours)** | PASS | PASS¹ | PASS | NOT OBSERVED |
| Chip remove | PASS | PASS | PASS² | PASS | NOT OBSERVED |
| Result card | PASS³ | PASS | n/a (not focusable) | PASS | n/a |
| Result title link | PASS | PASS | PASS | PASS | n/a |

Evidence (computed values; contrast in brackets):

- Primary: default bg `rgb(226, 24, 51)` text white [4.76]; hover/active bg `rgb(169, 0, 7)` [7.81]
  (rendered hover `rgb(176, 20, 27)` [7.09], active `rgb(188, 58, 64)` [5.50]). **Focus FAIL:**
  outline `none`; NDE's `.mdc-button.mat-mdc-unelevated-button.apply-filters-btn.cdk-keyboard-focused[_ngcontent-…]`
  (higher specificity) sets `outline:none; box-shadow: 0 0 0 2px #fff, 0 0 0 3px #000` and beats our
  `.custom-nde-theme .mat-mdc-unelevated-button.mat-primary:focus-visible`. Result: a 1 px black ring
  outside a 2 px white gap, not `3px solid rgb(36, 36, 36)`. Also the focus state layer renders the
  fill as `rgb(229, 52, 75)`: white text **[4.26] < 4.5**. Reached after 62 Tabs inside the panel.
- Secondary ("Online (Full-Text)"): default text/border `rgb(226, 24, 51)` on white [4.76];
  hover/active text `rgb(169, 0, 7)` on `rgb(250, 250, 250)` [7.48] (active border `rgb(46, 46, 39)`
  from NDE). **Focus FAIL:** outline `2px solid rgb(41, 23, 22)` [17.1] from NDE's
  `.quick-filters-container … .cdk-keyboard-focused { outline: 2px solid var(--sys-on-background) }`,
  which comes later than our rule at equal specificity; rendered focus fill `rgb(247, 224, 229)` gives
  red text **[3.80] < 4.5**. Reached after 47 Tabs.
- Secondary selected ("Peer-reviewed Journals", pressed): our `color: var(--maryland-red)` on NDE's
  selected bg `rgb(255, 237, 235)` **[4.21] < 4.5**; border `rgb(191, 0, 37)`.
- ¹Chip: **default FAIL**: border renders `1px solid rgb(191, 0, 37)` (NDE
  `.mat-mdc-standard-chip.mdc-evolution-chip--selectable:not(…) { border: 1px solid var(--sys-primary) }`)
  with our `--mdc-chip-outline-color` `#757575` drawn inside it (double outline in screenshot), not a
  single `--medium-gray` border. Text `rgb(41, 23, 22)` on white [17.1]; the label renders red in the
  screenshot (not measured). Hover bg `rgb(241, 241, 241)` [15.14]; active same. Focus lands on the
  inner primary action: `3px solid rgb(36, 36, 36)` [15.52 vs white], plus NDE's
  `2px solid rgb(41, 23, 22)` on the chip host (two rings). Our host `:focus-visible` rule never
  matches because focus is on the inner button.
- ²Chip remove: 40×24 px (≥ 24), icon `rgb(65, 0, 6)` [17.11 / 15.15 on hover]. Reached by ArrowRight
  from the chip, not by Tab (`tabindex=-1`). Ring `3px solid rgb(36, 36, 36)`, `:focus-visible`
  true. It was read after a programmatic `.focus()` that followed the ArrowRight, so the ring was not
  measured during a pure keyboard move.
- ³Card: white bg, text `rgb(41, 23, 22)` [17.1]; border `1px solid rgb(230, 230, 230)` **[1.25]**,
  hover/active `rgb(117, 117, 117)` [4.61]. The card is not a control, so 1.4.11 probably does not
  apply. Listed for the reviewer.
- Title link: `rgb(226, 24, 51)` [4.76], hover/active `rgb(169, 0, 7)` [7.81], focus `3px solid
  rgb(36, 36, 36)` [15.52] after 54 Tabs; mouse-down did not navigate.
- Disabled: no disabled primary, secondary, chip or remove control on search, record or favorites.
  Disabled controls seen are NDE icon buttons (favorites/actions on results, pagination arrow,
  record prev/next, "Search inside"), alpha 0.38 text (exempt).
- Dropdown button "Resource Type (1)": focus `3px solid rgb(36, 36, 36)` (our global
  `:focus-visible`). Dropdown panel white, shadow only.

**Full record** (`/nde/fulldisplay?…` first result): no filled, outlined, raised buttons or chips
visible while signed out. Text buttons `rgb(191, 0, 37)` on white [6.48]; "Available Online"
outlined text button `rgb(191, 0, 37)` [6.48]; type tag "Journal" and tag "Peer Reviewed"
`rgb(36, 36, 36)` on `rgb(241, 241, 241)` [13.74]. PASS.

**My Library** (signed out): `/nde/account/favorites` shows "Saved records (0)" `rgb(191, 0, 37)` on
`rgb(255, 218, 216)` [5.02], other buttons ≥ 6.48. User menu opened with Enter on "Open user
actions menu button": items Sign in, Search history, Settings, My library activity, Saved records.
**FAIL (ours):** the four link items render `rgb(226, 24, 51)` (our `.custom-nde-theme a { color:
var(--maryland-red) }`) on NDE's menu surface `rgb(255, 233, 231)` **[4.09] < 4.5**. Menu item
keyboard focus: NDE `2px solid rgb(41, 23, 22)`. Signed-in pages (activity, loans, requests) and
login: NOT OBSERVED, need UMD CAS login.

**Labels readable without colour:** PASS (text). The type label (`Journal`, `Book`, `Article`) and
the indication tags (`Peer Reviewed`, `Open Access`) all have non-empty text (0 empty labels on
search, Books-filtered search and record). Indication icons are `aria-hidden` with `.sr-only` text
("This journal has been peer reviewed"). Online availability is the text button "Available Online".
The tags are the same grey for every type, so colour does not tell types apart. A physical
availability line (`nde-physical-availability-line`) did not appear in the first 10 results, even
with Books filtered: NOT OBSERVED. Grayscale screenshots: PENDING-HUMAN.

**Discover-owned issues (not fixed, not masked):**
1. Chip remove control name is "Use space or delete to remove the active filter", which does not
   name the value; expected "Remove filter: <value>". Also `tabindex=-1` (reached only with
   ArrowRight from the chip).
2. Chip primary action name "Active filter  Articles" has a double space. The dropdown button name
   "Showing results filtered by Resource Type" leaves out the count.
3. The open filters panel traps Tab (applied filters can't be reached until "Close filters menu").
   It stays open after "Apply filters".
4. Facet counts display as "(0)" / "(-2)" in the panel, while accessible names give real counts
   (e.g. "New From Last Week 2115 search results").
5. NDE `cdk-keyboard-focused` focus styles (2 px outline / 1 px box-shadow ring) on quick filters,
   Apply filters, chip host and menu items. They conflict with our focus ring (see FAILs above).

**FAILs ours (for follow-up, not fixed here):** primary focus ring overridden + focus-layer contrast
4.26; secondary focus ring overridden + focus-layer contrast 3.80; selected quick filter 4.21; chip
border is NDE's red, not `--medium-gray` (double outline); user-menu links 4.09.

PENDING-HUMAN: (1) grayscale readability: `search-grayscale.png`, `books-grayscale.png`,
`record-grayscale.png` vs `*-color.png`; (2) chip double outline/red label: `chip-default.png`,
`s2-dropdown-open.png`; (3) focus ring visibility: `primary-focus-1500ms-pad.png`,
`secondary-focus.png`, `chip-focus.png`, `chipremove-focus-programmatic.png`, `titlelink-focus.png`.

Screenshots (scratchpad, not committed), directory
`/private/tmp/claude-504/-Users-bbradle1-Documents-projects-UMD-Discover-NDE/24ea0b80-79a8-45ee-9fc9-b7c3efdf1d48/scratchpad/t024/shots/`:
`{primary,secondary,chip,chipremove,card,titlelink}-{default,hover,focus,active}.png`
(`chipremove-focus-programmatic.png`, `primary-focus-1500ms{,-pad}.png`), `s1-applied.png`,
`s2-dropdown-open.png`, `s2-chip-focused.png`, `s2-after-remove.png`, `dropdown-open.png`,
`favorites.png`, `favorites-usermenu.png`. Scripts and raw JSON (`step12.mjs`, `states.mjs`,
`rules4.mjs`, `pages.mjs`, `states.json`, `pages.json`, `out12.txt`) are in the parent `t024/`.

### T024 fixes (2026-10-28)

Root causes were read live with CDP `CSS.getMatchedStylesForNode` on :4202. Material's focus layer was
modelled as a 12% layer over the fill (white on filled buttons, NDE's M3 primary `rgb(191, 0, 37)` on
outlined buttons). The model gives `rgb(229, 52, 75)` [4.26] and `rgb(247, 224, 229)` [3.80], which
match the T024 pixels exactly. RED: 7 new tests in `tests/theme-tokens.test.js` ("US2 T024: …") failed,
each because its rule was missing (44 pass / 7 fail). GREEN: `npm run test:assets` 51/51 pass (log
`.superpowers/sdd/tasks/t024fix.log`), `custom.css` 50,649 bytes, no `!important` added. Live check:
real Tab key presses, signed out, search `climate`. The fill is the most common pixel inside the
element screenshot (`scratchpad/t024fix/shots/`, script `verify.mjs`).

| # | Root cause (NDE selector) | RED test | GREEN (`_customized-theme.scss`) | Live result |
|---|---|---|---|---|
| 1 | `.mdc-button.mat-mdc-unelevated-button.apply-filters-btn.cdk-keyboard-focused[_ngcontent]` [0,5,0] sets `outline:none`; Material's 12% white focus layer on `--maryland-red` | "primary button keyboard-focus ring … outranks NDE's .cdk-keyboard-focused rule"; "primary button focus fill keeps white text >= 4.5 under Material focus layer" | `.mdc-button.mat-mdc-unelevated-button.mat-primary.cdk-keyboard-focused:focus-visible` [0,6,0] → `outline: var(--focus-ring)`; `.cdk-focused` → fill `--dark-red` (same as hover/active) | outline `3px solid rgb(36, 36, 36)`; rendered fill `rgb(179, 31, 37)`, white [6.69]. NDE's box-shadow (2px white + 1px black) still sits under the ring |
| 2 | `.quick-filters-container[_ngcontent] .cdk-focused.cdk-keyboard-focused[_ngcontent]` [0,5,0] `outline: 2px solid var(--sys-on-background)`; 12% primary focus layer under `--maryland-red` text | "secondary button keyboard-focus ring …"; "secondary button focus text >= 4.5 under Material focus layer" | `.mdc-button.mat-mdc-outlined-button.cdk-focused.cdk-keyboard-focused:focus-visible` [0,6,0] → ring; `.cdk-focused` → `--dark-red` text, `--lightest-gray` bg (same as hover) | outline `3px solid rgb(36, 36, 36)`; fill `rgb(243, 220, 224)`, text `rgb(169, 0, 7)` [5.99] |
| 3 | `.quick-filter-btn-active.mdc-button[_ngcontent]` [0,3,0] pink `--sys-inverse-on-surface` background under our red text | "selected quick filter uses an allowed pair and outranks NDE .quick-filter-btn-active" | `.mat-mdc-outlined-button.quick-filter-btn-active:not(:disabled)` [0,4,0] → `--white` text on `--maryland-red` fill (allowed pair) | default white on `rgb(226, 24, 51)` [4.76]; focused fill `rgb(222, 21, 49)` [4.93], ring `3px solid rgb(36, 36, 36)` |
| 4 | `.mat-mdc-standard-chip.mdc-evolution-chip--selectable:not(.mdc-evolution-chip--with-primary-icon)` [0,4,0] `border: 1px solid var(--sys-primary)` on the host, plus Material's `--mdc-chip-outline-*` ring on the primary action's `::before` | "chip has a single --medium-gray border that outranks NDE selectable-chip border" | chip selector raised to `nde-selected-filters .mat-mdc-standard-chip.mat-mdc-chip-option.selected-chip` [0,4,1], `border-color: var(--medium-gray)`; `--mdc-chip-outline-width` and `--mdc-chip-flat-selected-outline-width` set to 0 | host border `1px solid rgb(117, 117, 117)`, inner `::before` 0px; one border in `chip-default.png` |
| 5 | our `.custom-nde-theme a` (red) beats `.mat-mdc-menu-item` on NDE's `--mat-sys-surface-container` menu `rgb(255, 233, 231)` (the `<a>` has no href, so Material's `:link` rule does not match) | "menu item links use an allowed pair on the menu surface" | `.mat-mdc-menu-panel { --mat-menu-container-color: var(--white) }`; `a.mat-mdc-menu-item { color: var(--darker-gray) }` | panel `rgb(255, 255, 255)`; 4 links `rgb(36, 36, 36)` [15.52]; "Sign in" [17.1] |

Rulings: (a) the selected quick filter now uses a red fill, not NDE's pink. Dark-red text on pink is
not in the allowed-pairs table, and a plain white background would lose the pressed look. (b) All
mat-menus get a white surface, not only the user menu. (c) Primary and secondary `.cdk-focused` (any
focus origin) take the hover/active colours, because Material's focus layer shows for keyboard and
programmatic focus. Not changed: NDE's chip-host 2px focus outline (two rings when the chip is focused);
the chip label still renders red (not measured); disabled states.

## T025 — axe WCAG 2.2 AA

Method (2026-10-28): `npm run build` (exit 0, log `.superpowers/sdd/tasks/T025-build.log`), proxy on :4202
(`--public-host http://localhost:4202 --live-reload false`). Headless Chrome via puppeteer-core, axe-core
**4.14.0** injected, `axe.run(document, {runOnly: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa})`. Each page
scanned twice: **A** = normal; **B** = baseline with empty 200 bodies for `/nde/custom/01USMAI_UMCP-NDE/custom.css`,
`…/assets/header-footer/header_en.html` and `footer_en.html`. Pages: home `/nde/home`; results `/nde/search?query=climate…`
(waited for `.search-result-item`); full record (first result, `alma9963872540808238`); My Library `/nde/account/favorites`
(signed out); collections `/nde/collectionDiscovery`. Waits: networkidle2 + selector + 5 s (My Library re-run with 15 s
because content had not rendered at 5 s; its selector wait timed out, but the 15 s settle was used). Viewport 1280x1600,
desktop Chrome UA. Scripts/raw results: scratchpad `t025/` (not committed). Violations attributed OURS = in A not in B
(rule id + target), or inside `.umd-header`/`.umd-footer`/nde-header/nde-footer (none had any). axe covers automatable
checks only; it does not replace manual keyboard/screen-reader review. My Library signed-in views: NOT OBSERVED, needs UMD CAS login.

| Page | Violations A | Violations B | OURS | Discover-owned |
|---|---|---|---|---|
| home | 1 rule (5 nodes) | 0 | **1 rule (5 nodes)** | 0 |
| results | 1 rule (1 node) | 1 rule (1 node) | 0 | 1 |
| full record | 1 rule (5 nodes) | 1 rule (5 nodes) | 0 | 1 |
| My Library (signed out) | 0 | 0 | 0 | 0 |
| collections | 0 | 0 | 0 | 0 |

**SC-003 NOT MET: 1 violation introduced (home).**

### OUR violations

| Page | Rule | Impact | Target | Summary |
|---|---|---|---|---|
| home | color-contrast | serious | `#Opening_hours_link > span`, `#FAQ_link > span`, `#Ask_a_librarian_link > span`, `#Search_tips_link > span`, `#Study_room_link > span` (Discover quick-link tiles) | Text 18px normal weight, foreground #e21833 on background #ffedeb = 4.2:1, needs 4.5:1. Both colours come from our M3 theme (`src/app/styles/m3-theme.scss`: primary #e21833 on primary tone 95 #ffedeb); absent in B where the stock theme colours apply. |

### Discover-owned (for accessibility audit)

| Page | Rule | Impact | Count | Example target |
|---|---|---|---|---|
| results | label-content-name-mismatch | serious | 1 | `.general-search-actions-dropdown-button` |
| full record | label-content-name-mismatch | serious | 5 | `#card-48` (also `#card-49`, `#card-50`, …; virtual browse cards) |

### Incomplete (needs manual review), our elements only

- Header/footer: none on any page.
- results: `color-contrast` on `.mdc-snackbar__label` (background undetermined, overlaps other elements); present only in A, likely theme-coloured Discover snackbar, needs manual contrast check.
- All other incompletes (aria-prohibited-attr on quick links, results/record/collections color-contrast with image/gradient backgrounds, aria-valid-attr-value on `#mat-expansion-panel-header-5`) appear in both A and B, so are Discover-owned; the record-page and home incompletes are not listed individually here.

### T025 fix — home quick-link tile contrast (2026-10-28)

Root cause (live DOM, CDP matched rules on `#FAQ_link`): the tile text colour is our `.custom-nde-theme a { color: var(--maryland-red) }`
(#e21833; it beats NDE's `a:not(.link-reset) { color: var(--sys-primary) }`); the background is NDE's
`.main-landing-page .menu-container .menu li a { background-color: var(--sys-inverse-on-surface) }`, and our
`mat.system-level-colors(m3-theme.$light-theme)` sets that role to #ffedeb on `.custom-nde-theme` (NDE stock: #f4eefb).
NDE uses the same role as a light background for the tile icon circle, landing announcements and about text, the
selected chip / favourite-label / tag chips and the selected scope-menu item, so the fix is at the role: in
`_customized-theme.scss`, `.custom-nde-theme { --sys-inverse-on-surface: var(--white); }` (after the generated value; the
generated palette in `m3-theme.scss` is unchanged). Tiles become `--maryland-red` on `--white` = 4.76 (allowed pair). The role's
other M3 use (tooltip/snackbar text on `--sys-inverse-surface` #402b2a) becomes white on #402b2a, a higher ratio than before.

Test: `tests/theme-tokens.test.js` "T025: home quick-link tiles (link colour on --sys-inverse-on-surface) use an allowed pair".
RED: `--maryland-red / undefined is not an allowed pair` (29 tests, 28 pass, 1 fail). GREEN: `npm run test:assets` 52 tests,
52 pass, 0 fail (log `.superpowers/sdd/tasks/t025fix.log`). custom.css 51,241 bytes (≤ 60 KB).

Re-scan (same A/B method, 5 s settle on every page; log `.superpowers/sdd/tasks/t025fix-scan.log`):

| Page | Violations A | Violations B | OURS |
|---|---|---|---|
| home | 0 | 0 | **0** |
| results | 1 rule (1 node) | 1 rule (1 node) | 0 |
| full record | 1 rule (5 nodes) | 1 rule (5 nodes) | 0 |
| My Library (signed out) | 0 | 0 | 0 |
| collections | 0 | 0 | 0 |

**SC-003 now met for the scanned pages: 0 violations introduced.**

Snackbar: the results page raises NDE's "Sign in to view available request and scan options" snackbar on load. Measured
manually (computed style + `elementsFromPoint`): `.mdc-snackbar__label` text rgb(0,0,0) on `.mdc-snackbar__surface` rgb(255,255,255),
14px/400 = 21:1, identical with our theme, with the pre-fix #ffedeb value, and in the baseline (NDE sets
`--mdc-snackbar-supporting-text-color: #000000` / container `#ffffff` there). The axe "incomplete" is only an overlap
(the snackbar sits over page content at the viewport bottom), not a contrast failure; no change needed. It is still listed as
incomplete only in A after the fix.

## Font alignment update (2026-10-28)

- Replaced the Barlow body substitute with the licensed Interstate regular and semibold/bold
  OpenType files, served from the local customization package. Removed the now-unused Barlow body
  assets; the bundled font payload is 138,272 bytes.
- Runtime check in proxy mode: body and primary navigation compute to
  `Interstate, Helvetica, Arial, sans-serif`; the Interstate regular face reports `loaded`, and
  both local OpenType assets return HTTP 200 with `font/otf`.
- `npm run test:assets`: 53 tests passed. The manual check confirms the local font loads; visual
  side-by-side typography review remains pending.

## Header layout and dropdown update (2026-10-28)

- Used the prior implementation's desktop geometry: 1680px content width, 4rem-high logo on the
  left, right-aligned utility row above the primary row, and separated utility links.
- Restored the prior header's primary and utility submenu destinations without copying its disabled
  script or external theme CSS. Submenus use native `<details>` / `<summary>` disclosure controls.
- At 1240px and below, the two desktop navigation rows are replaced with a single collapsed
  hamburger disclosure containing both navigation groups and their submenu links.
- Expanded the combined static header/footer limit to 32 KB to cover the responsive navigation
  variants and restored menu links; the resulting header and footer remain within that cap.

## T026 — page load theme on vs off

Method (2026-10-29): `npm run build` (exit 0, log `.superpowers/sdd/tasks/T026-build.log`), proxy on :4202. Headless Chrome via
puppeteer-core, results page `/nde/search?query=climate&tab=Everything&search_scope=MyInst_and_CI&vid=01USMAI_UMCP:NDE&lang=en`,
viewport 1280x1600. Fresh incognito context per run (cold cache), ON/OFF interleaved, n=8 each. **OFF** = request interception returns
empty 200 for `custom.css`, `header_en.html`, `footer_en.html` and aborts our `*.woff2`/`*.otf` fonts; **ON** = normal. Metrics:
FCP; LCP (PerformanceObserver, buffered); time to first visible `.search-result-item` (20 ms poll, `performance.now()`); bytes
(CDP `encodedDataLength`) of package files. No network/CPU throttling (local proxy to live Primo). Script/raw: scratchpad `t026/m.mjs`, `out.json`.

| Metric (ms) | ON median | ON IQR | OFF median | OFF IQR | Increase of medians |
|---|---|---|---|---|---|
| FCP | 3094 | 1218 | 3026 | 548 | +2.2% |
| LCP | 3770 | 2811 | 3602 | 713 | +4.7% |
| First result visible | 4043 | 2953 | 3938 | 726 | +2.7% |

Package bytes transferred (median per run; ON / OFF): custom.css 62,076 / 39; fonts (Interstate 400-500 + 600-700 otf, CrimsonPro 400/600,
BarlowCondensed 600) 104,434 / 0 (aborted); header/footer html + header/footer logo svgs 112,949 / 160; library-logo.png etc. 6,434 / 6,434.
Total ON 285,893 B vs OFF 6,633 B (+279 KB, against ~3.8 MB of other `/custom/` bundle bytes in both arms).

Verdict: **SC-005 PASS on medians** (LCP +4.7%, time-to-first-result +2.7%, both <= 10%). However the ON IQR (about 2.8-3.0 s, driven by
three slow runs of ~6-8 s in the ON arm; the OFF arm had slow runs too) is far larger than the 100-170 ms difference, so the difference is
**within noise**: no measurable regression, but this run cannot resolve a 10% effect precisely.

Caveats: n=8, live Primo backend latency varies run to run (outliers in both arms); cold cache only, no throttling, so real-network cost of the
+279 KB package payload is not modelled (fonts/header/footer are not render-blocking for the result list, consistent with the small median delta);
OFF arm also removes header/footer DOM, which slightly favours OFF; byte counts include package files only.
