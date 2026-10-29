# Quickstart: Validate the Homepage Cards

**Feature**: [spec.md](./spec.md) | Depends on feature 001 (tokens, fonts, theme stylesheet).

## Prerequisites

- Final card list from the Libraries: titles, one-line descriptions, links, and icon choices for
  any card without a UMD icon ([data-model](./data-model.md)).

## Automated

```sh
npm test      # includes the homepage card contract spec
npm run build
```

## Manual (proxy mode: `npm run start:proxy`, open the homepage)

| Check | Expected |
|---|---|
| Side by side with lib.umd.edu cards | Same border, type, hover; grid of up to 4 (SC-004) |
| Click each card, and Tab + Enter to each | Opens its destination; one tab stop per card (SC-001, SC-003) |
| VoiceOver on the cards | "list, N items"; each card read once as a link: title, description, "external site"; icons silent |
| 5-person check | Each person says what every card does before opening it (SC-002) |
| 320 px and 200% zoom | One column, no clipped text, no horizontal scroll |
| Forced colours | Card borders, icons, focus ring visible |
| Network panel | No new requests (icons are inline) (SC-005) |
| Welcome, announcements, about sections | Unchanged |
