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
