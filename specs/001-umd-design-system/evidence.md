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

PENDING-HUMAN: (1) header/footer likeness vs. lib.umd.edu — compare `*-1440-header.png` /
`*-1440-footer.png` with `libumd-1440-top.png` / `libumd-1440-footer.png`; (2) forced-colours
rendering — `*-forced.png`, `*-forced-header-focus.png`; (3) fallback-font layout —
`*-fontsblocked*.png`. Not run here: axe scan, keyboard/facet-chip checks, load-time baseline (not
in T020 scope).
