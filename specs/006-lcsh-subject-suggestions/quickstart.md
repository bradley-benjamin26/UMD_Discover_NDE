# Quickstart: Validate Subject Heading Suggestions

**Feature**: [spec.md](./spec.md) | Depends on feature 001 (tokens) for styling.

## Automated

```sh
npm test      # ported ranking/service/component tests + new fix tests
npm run build
```

## Manual (proxy mode: `npm run start:proxy`)

| Check | Expected |
|---|---|
| Search "climate change farming", network panel filtered to `loc.gov` | Panel collapsed; **0** LoC requests until opened |
| Open the panel | Disclosure line shown; ≤ 12 LoC requests, each with no `Referer` and no cookies; ≤ 5 suggestions with reasons within 3 s |
| Page 2, sort by date, add a facet | No new LoC requests; same suggestions |
| Search `cats NOT dogs` (advanced search) | No suggestions built from "dogs" |
| Network panel, filter `primaws` | No second search request from the feature (SC-004) |
| Choose a suggestion → Add with AND / OR / Start new search | Expected query each time (SC-002) |
| Dialog: Tab repeatedly, Escape, Close, click backdrop | Focus stays inside; each closes it; focus back on the suggestion |
| Open a Discover dialog (e.g. Cite), press Escape | Discover's dialog behaves normally (SC-006) |
| Block `id.loc.gov` in DevTools | Results unaffected; "temporarily unavailable" + Retry announced |
| VoiceOver through panel and dialog | States announced without moving focus; dialog named "Add search term" |
| 320 px, 200% zoom, forced colours | Panel and dialog usable and visible |
| 20 topic searches reviewed by a subject librarian | ≥ 80% have a relevant heading (SC-001) |
