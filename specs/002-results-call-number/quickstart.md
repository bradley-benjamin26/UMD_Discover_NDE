# Quickstart: Validate the Larger Availability Line

**Feature**: [spec.md](./spec.md) | Depends on feature 001 (theme stylesheet and `--text-lg`).

## Automated

```sh
npm run build
npm test      # includes the availability-size test
```

## Manual (proxy mode: `npm run start:proxy`)

Search something with print, electronic, and on-order results (e.g. "cats").

| Check | Expected |
|---|---|
| DevTools, computed font size of an availability line | 18.4px at default browser settings (1.15rem) |
| "Available now" text | Same size |
| Browser text size set to Large | Line grows with it |
| 320 px width and 200% zoom | Long lines wrap, nothing clipped, no horizontal scroll |
| Next page, filter, sort | New results enlarged too |
| axe DevTools | 0 violations introduced |
| Network panel | No new requests |
