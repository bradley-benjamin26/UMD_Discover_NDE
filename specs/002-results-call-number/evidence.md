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
