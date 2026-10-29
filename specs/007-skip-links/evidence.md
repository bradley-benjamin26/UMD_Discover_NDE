# 007 test & check evidence

## T005 — skip-link spec fails before implementation (RED)

Run 2026-10-29 against the T003 stub (empty template), `CHROME_BIN=... npx ng test --watch=false --browsers=ChromeHeadless` (Chrome Headless 156). Every failure is a Jasmine expectation; no compile, import or TypeError failures. The 3 existing specs (AppComponent x2, AssetBaseService) pass. Most cases stop at the guard expectation `a.umd-skip-link rendered` because the stub renders nothing.

```text
SkipLinkComponent renders exactly one a.umd-skip-link "Skip to main content" with no aria-label FAILED
	Expected 0 to be 1.
	Expected undefined to be 'Skip to main content'.
	Expected undefined to be false.
SkipLinkComponent is visually hidden (1px, clipped) when not focused FAILED
	a.umd-skip-link rendered: Expected null not to be null.
SkipLinkComponent has href "#umd-main-content" FAILED
	Expected undefined to be '#umd-main-content'.
SkipLinkComponent gives a <main> without id the id "umd-main-content" FAILED
	a.umd-skip-link rendered: Expected null not to be null.
SkipLinkComponent keeps an existing <main> id and still focuses it FAILED
	a.umd-skip-link rendered: Expected null not to be null.
SkipLinkComponent is visible (wider than 1px) when focused FAILED
	a.umd-skip-link rendered: Expected null not to be null.
SkipLinkComponent on click prevents default (URL unchanged) and focuses <main> FAILED
	a.umd-skip-link rendered: Expected null not to be null.
SkipLinkComponent adds tabindex="-1" to a <main> that is not focusable FAILED
	a.umd-skip-link rendered: Expected null not to be null.
SkipLinkComponent with no <main>, click does nothing, throws nothing, and gives up after ~1 s FAILED
	a.umd-skip-link rendered: Expected null not to be null.
SkipLinkComponent focuses a <main> that appears within the retry window FAILED
	a.umd-skip-link rendered: Expected null not to be null.
SkipLinkComponent leaves an existing tabindex="0" alone and still focuses <main> FAILED
	a.umd-skip-link rendered: Expected null not to be null.
SkipLinkComponent adds no document- or window-level listeners FAILED
	a.umd-skip-link rendered: Expected null not to be null.
TOTAL: 12 FAILED, 3 SUCCESS
```

## T006 — behaviour cases fail with template-only component (RED)

Template + styles in place, `skip(e)` a no-op (`.superpowers/sdd/tasks/T006-red.log`): the click is not
prevented, so the anchor navigates the Karma iframe and the run aborts after the first click case:

```text
ERROR  Some of your tests did a full page reload!
SkipLinkComponent with no <main>, click does nothing, throws nothing, and gives up after ~1 s FAILED
	Expected false to be true.          (ev.defaultPrevented)
ERROR  Disconnected , because no message in 30000 ms.
Executed 1 of 15 (1 FAILED) DISCONNECTED
```

To see every behaviour case fail on its own check, `skip(e)` was then reduced to only
`e.preventDefault()` (`.superpowers/sdd/tasks/T006-red2.log`). Cases 1–4 (render, href, hidden, visible on
focus) and case 10 (no `<main>`: nothing happens) pass; every other behaviour case fails on its behaviour check:

```text
SkipLinkComponent keeps an existing <main> id and still focuses it FAILED
	Expected <body>...</body> to be <main id="existing">...</main>.
SkipLinkComponent gives a <main> without id the id "umd-main-content" FAILED
	Expected '' to be 'umd-main-content'.
SkipLinkComponent adds no document- or window-level listeners FAILED
	Expected <body>...</body> to be <main>...</main>.
SkipLinkComponent focuses a <main> that appears within the retry window FAILED
	Expected <body>...</body> to be <main>...</main>.
SkipLinkComponent on click prevents default (URL unchanged) and focuses <main> FAILED
	Expected <body>...</body> to be <main>...</main>.
SkipLinkComponent leaves an existing tabindex="0" alone and still focuses <main> FAILED
	Expected <body>...</body> to be <main tabindex="0">...</main>.
SkipLinkComponent adds tabindex="-1" to a <main> that is not focusable FAILED
	Expected null to be '-1'.
TOTAL: 7 FAILED, 8 SUCCESS
```

## T010 — axe

axe-core 4.14.0 (puppeteer-core, headless Chrome, 1440px, server `start:proxy` on :4203, unauthenticated; favorites = signed-out view). Pages: home, results ("climate"), full record (first result), `/nde/account/favorites`, `/nde/collectionDiscovery`. Scripts: scratchpad `t010.mjs` / `t010b.mjs`; raw output `t010-out.json`, `t010-outB.json`.

Runs: (1) `runOnly` tags wcag2a/2aa/21a/21aa/22aa + best-practice; (2) `runOnly` rules `bypass, skip-link, color-contrast, focus-order-semantics, landmark-one-main, landmark-no-duplicate-main, region` plus extra landmark-* rules (all exist in 4.14; none skipped). Each page scanned normal and with `a.umd-skip-link` `.focus()`ed (focused link computed: color rgb(36,36,36) on rgb(255,255,255), box 8,8 195x36; confirmed `document.activeElement` was the link).

Note on baseline: the host selector `custom-skip-link` is NOT in the DOM (Discover renders the mapped component as `nde-header-before-from-remote-0` inside `ng-component`). The first B pass (removing `custom-skip-link`) therefore removed nothing and was discarded; the B baseline below removes the `nde-header-before-from-remote-0` element holding `a.umd-skip-link`.

Violation counts (rules = tags run's rule violations; "ours" = attributable to the skip link, "Discover" = rest). Counts are rule-count / node-count for the tag run.

| Page | Normal ours | Normal Discover | Focused ours | Focused Discover |
|---|---|---|---|---|
| home | 2 rules (skip-link 1 node, region +1 node) | 5 rules (landmark-main-is-top-level, landmark-no-duplicate-main, landmark-unique x2, page-has-heading-one, region x7) | 1 rule (region +1 node) | 5 rules (same) |
| results | 2 (skip-link 1, region +1) | 3 rules (label-content-name-mismatch 1, landmark-unique 1, region 7) | 1 (region +1) | same 3 |
| record | 2 (skip-link 1, region +1) | 3 rules (label-content-name-mismatch 5, landmark-unique 2, region 7) | 1 (region +1) | same 3 |
| favorites | 2 (skip-link 1, region +1) | 5 rules (as home) | 1 (region +1) | same 5 |
| collections | 2 (skip-link 1, region +1) | 2 rules (landmark-unique 1, region 7) | 1 (region +1) | same 2 |

Rules-run extra: results also shows `focus-order-semantics` on `#button-list` (Discover, present in B baseline).

SC-003 targets: `bypass` — 0 violations on all pages (pass). `focus-visible` — no axe rule exists; focused-link style above (dark text on white, outline from `--focus-ring`) is checked in other tasks. `color-contrast` — 0 violations on all pages in both states; the focused skip link produced no contrast violation or incomplete entry (Discover has only `incomplete` contrast items from images, same in B).

### OUR violations (in full)

1. `skip-link` (moderate, best-practice, normal state only; 5/5 pages; absent in B baseline and absent when focused because axe only evaluates off-screen skip links)
   - target `.umd-skip-link`; html `<a class="umd-skip-link" href="#umd-main-content">Skip to main content</a>`
   - message: "No skip link target". Cause: `#umd-main-content` is assigned to Discover's `<main>` lazily in `SkipLinkComponent.skip()` at click time, so no element with that id exists at scan time. Not a WCAG failure (`bypass` passes; click/Enter works per other evidence), but axe's best-practice `skip-link` flags it. Product code not changed; fix option is to set the id on `main` when it appears (e.g. observer on load) — for the owner to decide.
2. `region` (moderate, best-practice; 5/5 pages, both states): one extra node, target `ng-component`, html begins `<ng-component class="ng-star-inserted"><nde-header-before-from-remote-0 ...><a class="umd-skip-link"...`; "Some page content is not contained by landmarks". The skip link sits in the `nde-header-before` slot outside any landmark. Region count is 8 with the feature vs 7 without. (Other 7 region nodes are Discover/UMD header markup, e.g. `.umd-global-bar`, `.umd-header__logo`.)

No bypass, color-contrast, or WCAG A/AA violations are ours.

### Discover-owned (present with skip link removed, B baseline)

- home and favorites: `landmark-no-duplicate-main` (`.sub-container`), `landmark-main-is-top-level` (`.main-landing-page` / `.sections-content`: main nested in another landmark), `landmark-unique` x2 (`nde-main-menu`, `.sub-container`), `page-has-heading-one`, `region` x7. Confirms Discover has duplicate/nested `<main>` on these two pages.
- results: `label-content-name-mismatch` (`.general-search-actions-dropdown-button`), `landmark-unique` (`nde-main-menu`), `focus-order-semantics` (`#button-list`), `region` x7.
- record: `label-content-name-mismatch` x5 (`#card-48..50` etc.), `landmark-unique` x2 (`nde-main-menu`, `#cdk-accordion-child-14`), `region` x7.
- collections: `landmark-unique` (`nde-main-menu`), `region` x7.
- Incomplete (needs review, same with/without feature): `color-contrast` (image backgrounds) on home/results/record/collections; `aria-prohibited-attr` on home/results/record; `aria-valid-attr-value` on record.
- Caveat: favorites page selector wait timed out in the B run (page still loaded; counts matched A).
