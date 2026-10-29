# 002 test & check evidence

## T004 — availability-line assertions fail before implementation (RED)

`npm run test:assets` (log: .superpowers/sdd/tasks/T004.log)

```
ℹ tests 63
ℹ pass 61
ℹ fail 2
AssertionError: no font-size rule for .custom-nde-theme .available-at-button.mdc-button .mdc-button__label
AssertionError: no font-size rule for .custom-nde-theme .quicklink-button
```

Both new tests fail because the rules are missing; the existing 61 pass.

## T008 — axe

axe-core 4.14.0 (puppeteer-core, headless Chrome), tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa.
Page: `/nde/search?query=cats&vid=01USMAI_UMCP:NDE&lang=en` via `npm run start:proxy` on port 4203, 12 s settle after results render.
A = normal. B = same page with our two rules neutralised: custom.css response intercepted and
`.custom-nde-theme .available-at-button.mdc-button .mdc-button__label, .custom-nde-theme .quicklink-button { font-size: revert-layer }` appended.
Verified B restores 14px (computed 14px on the availability label and quicklink buttons; A computes 18.4px).

| Width | A violations | B violations | OURS (in A, not in B) |
|---|---|---|---|
| 1440 | 1 rule, 2 nodes | 1 rule, 2 nodes | 0 |
| 320 | 1 rule, 1 node | 1 rule, 1 node | 0 |

OUR violations: none. No target-size, color-contrast or reflow findings at either width.

Discover-owned (identical in A and B): `label-content-name-mismatch` on
`button[aria-label="Available at {{idx_1}} (Cats)"]` (unrendered template placeholder in the aria-label; 1440 and 320) and
`.general-search-actions-dropdown-button` (1440 only).

## T007 — manual checks

Server: `npm run start:proxy` on port 4202 (dist already built). Headless Chrome via puppeteer-core; search
`/nde/search?query=cats&vid=01USMAI_UMCP:NDE&lang=en`. Scripts and screenshots (`card-1440.png`, `card-640.png`, `card-320.png`)
in the session scratchpad `t007-002/`.

| Check | Result | Evidence |
|---|---|---|
| 1. Computed size on page 1 (1440) | PASS | 7 print labels, 7 `.availability-code` spans, 3 `.quicklink-button` ("Available Online"): all 18.4px (button and its label). Root 16px. |
| 2. Grows with browser text size Large | FAIL (not caused by our rule) | Method: Chrome Preferences `webkit.webprefs.default_font_size=20` (a probe `font-size: medium` element computed 20px, so the pref applied). Root, body and label stayed 16px/16px/18.4px, not the expected 23px. Cause: NDE's own stylesheet has `html { font-size: 16px }`, so every rem value in NDE, including the 14px it had before, ignores the browser default size. Our 1.15rem is relative to that fixed root. Browser zoom does scale it (see 3). |
| 3a. 320 px wrap | PASS | Print labels wrap to up to 3 lines; 0 elements with label/button scrollWidth > clientWidth; label overflow does not clip (inline). |
| 3b. 640 px (~200% zoom) wrap | PASS | Up to 2 lines, 0 clipped. |
| 3c. Page horizontal scroll | PASS (baseline attributed) | 1440: 1440/1440. 640: 640/640. 320: scrollWidth 324 vs clientWidth 320, the same 324 as 001/T002 baseline without our rule, from NDE's `button.show-more-btn` menu trigger (research.md, Spike findings). |
| 4a. Next page (click "Go to next page", offset=10) | PASS | 3 print + 7 quick, all 18.4px. |
| 4b. Filter `facet=rtype,include,books` | PASS | 8 print, 2 quick ("Available Online", "See Request Options"), all 18.4px. |
| 4c. Sort `sort=date_d` | PASS | 7 print, 3 quick, all 18.4px. (Sort set by URL param, not the sort dropdown.) |
| 5a. Electronic-only results | PASS | `facet=tlevel,include,online_resources`: 10 quick "Available Online", 0 print, all 18.4px. Also "journal of electronic": 9 quick + 1 print, all 18.4px. |
| 5b. On-order results | NOT OBSERVED | Searched "on order", "2027", "forthcoming", "2026 new acquisitions" (newest first): no on-order availability text; only "Available at ..." and "See Request Options" (enlarged, 18.4px). |
| 6. Network (SC-004) | PASS | Page load makes 130 requests: 119 to localhost:4202, 10 to proxy-na.hosted.exlibrisgroup.com (Syndetics covers), 1 data URL. `custom.css` is one request. Our change is two `font-size` declarations using `var(--text-lg)`; `git diff main -- src` adds no `url()`, import or font-face, so no new request. No separate no-rule run was done to diff counts. |

FAIL to follow up: check 2. The 1.15rem size does not follow the browser's default text size because NDE pins the root at 16px
(same as NDE's original 0.875rem). It does follow page zoom. Needs a decision on whether the spec's "browser text size Large" is
meant to be page zoom or whether a root-relative unit change (e.g. em/percent of the browser default) is wanted; no product code changed here.

## T007 fix — follow browser text size

Fixes check 2 above (FR-003, US1 scenario 3). User-approved change: size from the browser default via the `medium`
keyword instead of rem. `.available-at-button.mdc-button` and `.quicklink-button` get `font-size: medium`; their
`.mdc-button__label` gets `font-size: 1.15em` (16 × 1.15 = 18.4px at default settings). No px, no `!important`; no
extra specificity needed (live shows our rules win).

**RED** (`tests/theme-tokens.test.js` "002:" tests rewritten to the new contract: four rules, button `medium`, label `1.15em`;
build + `node --test` against the old CSS): `ℹ tests 65 / pass 61 / fail 4` — the two new rules missing ("no font-size rule")
and the two changed ones still `var(--text-lg)`.

**GREEN** (`npm run test:assets`): `ℹ tests 65 / pass 65 / fail 0`. Built `custom.css` 57,859 bytes.

**Live** (proxy on port 4202, `/nde/search?query=cats&vid=01USMAI_UMCP:NDE&lang=en`, headless Chrome, default font size set
through the profile's Preferences `webkit.webprefs.default_font_size`, the T007 method). "Old" = same page with custom.css
intercepted and the four declarations swapped back to the previous `var(--text-lg)` rules. Every non-empty text node inside
`.available-at-button` and `.quicklink-button` was measured at its parent element: `span.availability-code`, `span.bold-text`
(print, 7 buttons) and the quicklink inner `span` (3 buttons, "Available Online"/"See Request Options"). Text outside
`.mdc-button__label`: none found. Root stays 16px in all runs.

| Default size | Width | Old (var(--text-lg)) | New (medium × 1.15em) | Print button heights old → new | Quicklink height | Max label lines old → new |
|---|---|---|---|---|---|---|
| 16 | 1440 | 18.4px all | 18.4px all | 26 → 25 | 32 (fixed by NDE) | 1 → 1 |
| 16 | 320 | 18.4px all | 18.4px all | 26/78 → 25/75 | 32 | 3 → 3 |
| 20 | 1440 | 18.4px all (bug) | **23px all** | 26 → 26 | 32 | 1 → 1 |
| 20 | 320 | 18.4px all (bug) | **23px all** | 26/78 → 26/104 | 32 | 3 → 4 |

- Wrap/clipping: 0 elements with scrollWidth > clientWidth in any run. Page horizontal scroll at 320: 324/320 at default
  in both old and new (the known NDE `show-more-btn` baseline, check 3c); 320/320 at 20.
- Vertical: print buttons report scrollHeight 37 > clientHeight 25/26 in old and new alike; that is Material's 48px touch
  target, not text. At 20/320 the 4-line print button's content is 2px taller than its box (106 > 104), overflow visible, so
  nothing is clipped; NDE's 24px line-height makes 23px lines tight but not overlapping (screenshot `fix-20-320.png`).
  Quicklink buttons keep NDE's fixed 32px height; their 23px text box (28px) sits inside it (2px top and bottom).
- Icons: no `mat-icon` inside these buttons on this page. At default size, print buttons are 1px shorter per line
  (26 → 25; the button's own font-size is now `medium` instead of NDE's value); cause not investigated further, text unaffected.
- Scripts and screenshots: session scratchpad `t007-002/fix.mjs`, `out-*.txt`, `fix-16-320.png`, `fix-20-320.png`.

Check 2 is now PASS.

## Final review fixes

Live on `npm run start:proxy` port 4202, headless Chrome with the default font size set through the profile's
Preferences; searches `cats` and `cats` + `facet=tlevel,include,online_resources` (quicklinks). Script: session
scratchpad `t007-002/lh.mjs`; logs `.superpowers/sdd/tasks/FR-*.log`.

### I1: wrapped availability lines collided once the text scaled

- Reproduction (default 24, before): print labels 27.6px with NDE's `line-height: 24px` (ratio 0.87). "Available at UMCP
  McKeldin Library Media VHS…" wrapped to 5 lines at 320 and 3 at 640, line step 26px < 27.6px glyphs, so lines touch
  (screenshot `fr-before-cats-24-320.png`). Quicklink labels: line-height 32px, single line.
- Tests: `002: .custom-nde-theme .available-at-button.mdc-button .mdc-button__label line-height is unitless (scales with
  the text)` and the same for `.custom-nde-theme .quicklink-button .mdc-button__label`.
  RED: both failed "no line-height rule" (67 tests, 2 fail). GREEN after adding `line-height: 1.3` to both label rules (67/67).
- Live (default 24, after): computed line-height 35.88px = 1.3 × 27.6 on every label (beats NDE's rule); line step 35px,
  0 overlaps at 320 and 640.

### M1: quicklink button fixed at 32px

- Before I1: did not reproduce beyond 1px. Default 24 at 320 and 640: scrollHeight 31 / clientHeight 30, label inside
  the button, 1 line.
- After I1: reproduced. The 35.88px label line in NDE's fixed `height: 32px` button
  (`.quicklink-button.mat-mdc-button[_ngcontent…]`, specificity (0,3,0)): scrollHeight 33 > clientHeight 30 (3px), label
  bottom 1.9px below the button at 320 and 640.
- Test: `002: quicklink button height grows with its label (height: auto, 32px floor), beating NDE (0,3,0)`.
  RED: "expected height: auto; found []" (68 tests, 1 fail). GREEN after adding
  `.quicklink-button.mat-mdc-button.mdc-button { height: auto; min-height: 32px; }` (0,4,0) (68/68). The existing no-px
  test covers font-size only; the 32px min-height floor keeps NDE's size at default text size.

### Live re-verify (after both fixes)

| Default | Width | Print label | Quicklink label | Line-height ratio | Print max lines | Quicklink button height / overflow | Overlaps | Page scrollWidth |
|---|---|---|---|---|---|---|---|---|
| 16 | 1440 | 18.4px | 18.4px | 1.3 | 1 | 32px / 1px (as before) | 0 | 1440 |
| 16 | 320 | 18.4px | 18.4px | 1.3 | 3 | 32px / 1px | 0 | 324* |
| 20 | 1440 | 23px | 23px | 1.3 | 1 | 32px / 1px | 0 | 1440 |
| 20 | 320 | 23px | 23px | 1.3 | 4 | 32px / 1px | 0 | 320 |
| 24 | 1440 | 27.6px | 27.6px | 1.3 | 2 | 37.86px / 0 | 0 | 1440 |
| 24 | 320 | 27.6px | 27.6px | 1.3 | 5 | 37.86px / 0 | 0 | 320 |
| 24 | 640 (quicklinks) | n/a | 27.6px | 1.3 | n/a | 37.86px / 0 | 0 | 640 |

\* Known NDE `show-more-btn` baseline (check 3c), also 324 with the pre-002 CSS; a later reading on the same page
showed 320 with no element past the viewport. Quicklink label bottoms are inside the button in every run (1 to 4px clear).
Screenshots: `fr-final-cats-24-320.png`, `fr-final-online-24-320.png`.

Suites: `npm test` Karma TOTAL: 22 SUCCESS; `node --test` 68 tests, 68 pass, 0 fail. `custom.css` 57,859 → 57,981 bytes.
