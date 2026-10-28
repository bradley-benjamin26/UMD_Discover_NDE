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
