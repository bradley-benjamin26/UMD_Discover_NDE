# Quickstart: Validate the UMD Design System

**Feature**: [spec.md](./spec.md)

## Prerequisites

- `npm install` done; `proxy/proxy.const.mjs` points at
  `https://usmai-umcp.primo.exlibrisgroup.com` and `build-settings.env` has
  `INST_ID=01USMAI_UMCP`, `VIEW_ID=NDE`.
- The NDE view in Alma uses the custom theme (needed for `.custom-nde-theme` to apply).
- axe DevTools browser extension; a screen reader (VoiceOver on macOS).

## Automated checks

```sh
npm run build          # produces dist/01USMAI_UMCP-NDE with the custom stylesheet
npm test               # ng test + node --test tests/
```

Expected: all tests pass, including `theme-tokens.test.js` and `header-footer.test.js`
([contracts](./contracts/)).

## Manual checks (proxy mode)

```sh
npm run start:proxy
```

Open each page type: home, search results (search "climate"), full record, My Library (signed
in), a collection page.

| Check | Expected |
|---|---|
| Side-by-side with lib.umd.edu | Global bar, logo, nav, footer, fonts, colours match (SC-002) |
| Network panel, filter by domain | No requests to new third-party domains (SC-004); fonts load from `/custom/…/assets/fonts/` |
| axe DevTools scan | 0 WCAG 2.2 AA violations (SC-003) |
| Keyboard only: Tab from load | Skip link (spec 007) first, then header links; visible focus ring on every control |
| Keyboard dropdown check | Focus a menu summary, press Enter or Space to open, Tab through its links, and press Enter or Space to close |
| 320 px: open a utility and a primary dropdown | Each menu stays within the viewport and the page has no header-caused horizontal overflow |
| Apply two facets, remove one by keyboard | Chip remove control focusable, named "Remove filter: …" |
| 320 px width, 200% zoom | No horizontal scroll, nothing overlaps |
| Forced colours (Windows High Contrast or emulation in DevTools) | Chips, buttons, focus rings visible |
| Block font files in DevTools | Text shows in fallback font immediately, layout intact |
| Load time vs. baseline (theme off) | Increase ≤ 10% (SC-005) |

Record results in the pull request.
