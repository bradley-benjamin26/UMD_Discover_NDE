# Data Model: Homepage Search Box

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

No stored data.

## Hero image

| File | Width | Budget | Used when |
|---|---|---|---|
| `src/assets/homepage/hero-960.jpg` | 960 px | ≤ 80 KB | viewport ≤ 960 px (default) |
| `src/assets/homepage/hero-1920.jpg` | 1920 px | ≤ 300 KB | viewport ≥ 961 px |

- Source: McKeldin Library photo from `customModule-main/src/assets/homepage/homepage_background.svg`
  (embedded JPEG extracted; the SVG wrapper is not shipped).
- Decorative: no alt text and no credit line (owned by the Libraries).
- Fallback: `--maryland-red` background colour.

## Search panel

NDE's own elements (heading, scope selector, input, search button, Ask Anything, Advanced Search),
restyled only. No new elements, no new behavior.
