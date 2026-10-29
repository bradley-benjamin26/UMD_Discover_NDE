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
