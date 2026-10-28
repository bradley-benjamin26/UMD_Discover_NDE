# Research: Homepage Search Box

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

## R1. What the prior project did

- Background: set through NDE's view configuration key `homepage.homepageBGImage`
  (`customModule-main/proxy/customization_config_override.mjs`), pointing to one JPEG. One image
  for every screen size.
- Panel: CSS in `assets/css/custom.css` on NDE's own search area (`.custom-search-bar-container`):
  hid NDE's purple `.background-overlay`; styled the `h1` and the `.search-bar-container` as two
  white half-cards (top and bottom) whose widths were kept equal by copying NDE's own `clamp()`
  width formula at four breakpoints; moved "Ask Anything" / "Advanced Search" below the input;
  forced "Ask Anything" visible at medium widths; shrank the scope dropdown text to 0.8125rem.
- This repository's proxy has no configuration override, so `homepageBGImage` can only be set in
  Alma.

## R2. Background photo (FR-004, FR-005)

- **Decision**: Ship two plain JPEG files in `src/assets/homepage/`: `hero-1920.jpg` (≤ 300 KB) and
  `hero-960.jpg` (≤ 80 KB), extracted from the supplied SVG wrapper and re-encoded. Set the
  background in the theme stylesheet on NDE's hero container with `background-size: cover`, the
  960 file by default and the 1920 file from 961px wide (media query). Leave `homepageBGImage` unset
  in Alma so NDE does not also load its own image.
- **Rationale**: The configuration key takes one URL, so phones would download the full image.
  CSS media queries let the browser fetch only the matching size. Works in proxy mode without Alma
  changes.
- **Measured**: the source photo is 555 KB at 1920×1080 inside a 740 KB SVG. Test re-encodes:
  about 275 KB at 1920 wide, about 67 KB at 960 wide. Final quality is judged by eye in
  quickstart.
- **Alternatives**: Config key only (prior): one size for all, and needs Alma to preview.
  `<img srcset>` in the homepage HTML: that HTML renders below the search area, not behind it.

## R3. One white panel instead of two half-cards (FR-001)

- **Decision**: Style the nearest element that contains both NDE's `h1` and its search bar as the
  white panel (padding, `--radius-md`, shadow, max width 50rem on wide screens, full width minus
  `--space-sm` gutters on small). No copied `clamp()` widths.
- **Rationale**: One box means the heading and search bar can never misalign, and there is nothing
  to keep in sync with NDE's breakpoints. Removes four media-query blocks of the prior CSS.
- **Unknown, resolved by a spike (first task)**: the exact container element. Recorded in
  [contracts/homepage-hero-selectors.md](./contracts/homepage-hero-selectors.md).

## R4. Input style: spec vs. prior design

- The spec (FR-001) says "input with a dark bottom rule" (lib.umd.edu). The prior "After" design
  in the PDF uses NDE's rounded input with a Maryland red border.
- **Decision**: Follow the spec: dark bottom rule (`--darker-gray`, 1px, 15.5:1). Flagged to the
  user; if the prior design is preferred, FR-001 is amended first (Constitution III).

## R5. Heading

- **Decision**: NDE's own `h1` ("UMD Discover", text from the view's labels), in the display font
  (Barlow Condensed) bold italic uppercase with wide letter spacing (prior style), `--darker-gray`,
  `--text-3xl`. It stays the page's one `h1`.

## R6. Readability fixes to the prior CSS

- Scope dropdown text stays at `--text-sm` (0.875rem), not 0.8125rem.
- "Ask Anything" visibility: keep NDE's responsive behavior; only move both links below the input.
  Forcing the label visible at medium widths (prior) risks overflow at 200% zoom.
- `!important` only where NDE's own specificity requires it; each such rule commented with why.

## R7. Photo fallback (US2)

- **Decision**: Hero container background colour `--maryland-red` behind the photo; panel is
  white either way, so text contrast never depends on the photo.

## R8. Testing

- `node:test`: built stylesheet contains both hero media queries, references only local
  `assets/homepage/hero-*.jpg`, uses tokens; both image files exist and are within budget.
- Manual in quickstart: layout vs. lib.umd.edu, keyboard, screen reader, 320 px, 200% zoom,
  forced colours, photo blocked, network panel shows only one hero file per screen size.
