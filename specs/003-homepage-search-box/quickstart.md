# Quickstart: Validate the Homepage Search Box

**Feature**: [spec.md](./spec.md) | Depends on feature 001 (tokens, fonts, theme stylesheet).

## Prerequisites

- `homepageBGImage` unset in the Alma view (research R2).

## Automated

```sh
npm run build
npm test      # hero stylesheet and image budget tests
```

## Manual (proxy mode: `npm run start:proxy`, open the homepage)

| Check | Expected |
|---|---|
| Side by side with lib.umd.edu | White panel over the photo, heading, input with dark bottom rule, search button (SC-001) |
| Search "climate" from the panel, then from a results page | Same results (SC-002) |
| Network panel at 400 px and at 1400 px wide | Only `hero-960.jpg` or only `hero-1920.jpg` loads; no third-party requests (SC-005) |
| Block the hero image in DevTools | Red background, panel readable, search works |
| Keyboard: Tab through heading area | Scope selector, input, search button, Ask Anything, Advanced Search, each with visible focus |
| VoiceOver | One `h1`; input and button named; photo not announced |
| 320 px and 200% zoom | Panel fills the width, no horizontal scroll, links wrap below the input |
| Forced colours | Panel border, input rule, focus visible |
| Photo quality at both sizes | No visible blocking or banding |
| Time to typeable search box on a mid-range phone | No slower than before (SC-004) |
