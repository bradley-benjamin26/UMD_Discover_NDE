# Research: Larger Availability Line in Search Results

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

## R1. How to enlarge the line

- **Decision**: Two CSS rules in feature 001's theme stylesheet, using the 1.15rem type token
  (`--text-lg`), on the selectors the prior work proved:
  `.available-at-button .mdc-button__label` (availability line) and `.quicklink-button`
  ("Available now").
- **Rationale**: Smallest change that meets the spec; no component, no script, no new data.
- **Alternatives**: A component adding a labeled call number line (dropped by clarification).

## R2. Wrapping

- **Decision**: Also allow the availability label to wrap (`white-space: normal`) so a longer line
  at 1.15rem doesn't overflow its button at 320 px.
- **Rationale**: Material button labels default to one line; at a larger size long locations would
  be clipped (FR-004). To be confirmed in proxy mode; drop the rule if Discover already wraps.

## R3. Risk

- These are Discover class names, not a documented hook; an Ex Libris update can rename them, and
  the line would fall back to Discover's default size (nothing breaks). Caught by the quickstart
  check after each NDE release.

## R4. Testing

- **Decision**: Add to 001's `tests/theme-tokens.test.js` (or a sibling test): the built
  stylesheet sets both selectors to `var(--text-lg)`. Written first and seen failing. The visual
  result is checked manually in quickstart.
