# Contract: Theme Tokens

The theme bundle (`custom` stylesheet compiled from `src/app/styles/_customized-theme.scss`)
exposes the brand value set as CSS custom properties on `:root`. Later features (002–007) use
these names and never repeat literal values.

- Token names and values: see [data-model.md](../data-model.md#brand-value-set-tokens).
- Allowed text/background pairs: see
  [data-model.md](../data-model.md#allowed-pairs-contrast-contract).
- Renaming or removing a token is a breaking change for later features; adding one is not.

Checked by `tests/theme-tokens.test.js` against the built stylesheet in `dist/`:

- All tokens above are defined exactly once.
- No colour literal (`#…`, `rgb(…)`, `hsl(…)`) appears outside the token block.
- Every allowed pair meets its stated minimum contrast.
- `@font-face` sources are local (`assets/fonts/…`) font files; no `http` URLs anywhere.
