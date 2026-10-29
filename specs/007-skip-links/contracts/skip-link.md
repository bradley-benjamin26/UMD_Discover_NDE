# Contract: Skip Link

## Rendered markup (this feature)

```html
<a class="umd-skip-link" href="#{main-id}">Skip to main content</a>
```

- Exactly one, first focusable element on every page (FR-001, FR-003).
- Activation moves focus to the main content target; URL unchanged; next Tab continues inside main
  content (FR-002, FR-007).
- Hidden until focused; visible on focus with 4.5:1 text and 3:1 focus ring (FR-005).

## Discover side (filled in by the spike)

| Item | Value |
|---|---|
| Hook | `nde-header-before` (prior project). Rendered as `nde-header-before-from-remote-0` inside an `ng-component`, a **sibling before** `nde-header` in `nde-app-root > nde-app-layout > section` |
| Hook element is first focusable, with 001's static header in place | **YES in document order** on all 5 pages (focusable index 0, before `.umd-header` and before all of Discover's skip buttons). **Tab once from load: NO** on 5 of 5 pages without intervention, because NDE autofocuses a search input or sets a focus starting point (see Spike notes). Overridden by the skip-link component before first user interaction (user decision 2026-10-29) |
| Main content target selector / id | `main.sub-container`, **no id** (on all 5 pages). Home and My Library also have a second, nested `<main>` inside it (`main.main-landing-page`, `main.sections-content`), also without id. Use `document.querySelector('main')` (first = `main.sub-container`); it contains the search bar, not the header/footer |
| Main target focusable by default | **NO**: no `tabindex` attribute, `tabIndex` -1, `main.focus()` leaves `document.activeElement` unchanged. Needs `tabindex="-1"` |
| Header area re-created on navigation | **NO**: home → search (typed in search box) and results → full record (clicked link): same probe element, `data-` attribute kept, same `nde-header-before-…` host and same `.umd-header` element |
| Discover's own skip links still work | **YES**: `button.skip-h2-button` ("Skip to Main menu links", "Skip to Search bar", per-page sections, footer sections) at focusable index 82–96. Enter leaves `activeElement` on `BODY` but the next Tab lands in the named section; URL unchanged |

**Hook is first focusable: YES → T011 needed: NO.** The hook renders before the static header and
before every other focusable on every page type; the contingency (moving the header into the
component) would not change anything. The autofocus effect below is not about order and T011 does
not address it.

### Spike notes (T002, 2026-10-29, proxy on :4202, headless Chrome 1440×1000)

Pages: home, search `climate`, full record `docid=alma9963872540808238`, My Library
`/nde/account/favorites` (signed out; loans/requests NOT OBSERVED — needs CAS login), collections
`/nde/collectionDiscovery`. Probe: standalone component rendering `<a href="#" class="umd-probe">`.

First 6 focusables in document order (identical on all 5 pages):

1. `a.umd-probe` "probe" (hook)
2. `a` "University of Maryland" (`.umd-header` global bar)
3. `a.umd-header__logo` "University of Maryland Libraries home"
4. `a.umd-utility-nav__link` "Locations & Hours"
5. `summary` "Open Locations & Hours menu"
6. `a.umd-menu__link` "All Libraries Hours"

Focus on load and first Tab:

| Page | Focused at load | (a) Tab once from load | (b1) `blur()` then Tab | (b2) focus a temp `tabindex=-1` at body start, Tab |
|---|---|---|---|---|
| home | `input#main-search-bar` | `button.voice-search-dialog-button` | voice search button | `a.umd-probe` |
| search | `input#main-search-bar` | `button.clear-search-btn` | `a.umd-probe` | `a.umd-probe` |
| record | `BODY` | `button.back-to-results-btn` | back-to-results button | `a.umd-probe` |
| favorites | `input#main-search-bar` | `button.voice-search-dialog-button` | voice search button | `a.umd-probe` |
| collections | collection search input | `button.submit-search-btn` | submit search button | `a.umd-probe` |

After (b2), the next 5 Tabs go through the header in order (University of Maryland, logo, Locations &
Hours, its menu toggle, System Status). `blur()` does not reset Chrome's sequential focus starting
point, so (b1) mostly continues after the search box. On the record page nothing is focused at load,
but Tab still lands on the back-to-results button, so NDE sets a focus starting point there too.
Consequence for FR-001: in DOM/Tab order from the document start the skip link is first, but a
keyboard user who presses Tab right after load on these pages reaches NDE's next control, not the
skip link (Shift+Tab goes back toward the top). That is NDE autofocus behaviour, not hook order.

If the hook does not come first, follow the contingency in
[research R2](../research.md#r2-where-the-skip-link-lives).
