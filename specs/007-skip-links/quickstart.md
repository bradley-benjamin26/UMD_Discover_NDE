# Quickstart: Validate the Skip Link

**Feature**: [spec.md](./spec.md) | Built and released with feature 001 (the header).

## Automated

```sh
npm test
```

## Manual (proxy mode: `npm run start:proxy`, with 001's header in place)

For each page type (home, results, full record, My Library, a collection):

| Check | Expected |
|---|---|
| Load, press Tab once | "Skip to main content" visible at top-left, before any header link (SC-002) |
| Press Enter, then Tab | Focus is in main content; next Tab reaches the first control in main, not a header link (SC-001) |
| URL after Enter | Unchanged |
| Search, page, open a record (5 navigations), then Shift+Tab back to the top and Tab | Skip link first again (SC-004) |
| Discover's own skip links | Still present and working |
| VoiceOver: Tab once | "Skip to main content, link" |
| Mouse only | Never visible |
| 320 px, 200% zoom | Visible link fits, doesn't cover the focused target |
| Forced colours | Link and focus ring visible |
| axe DevTools | 0 bypass-block / focus / contrast violations (SC-003) |
