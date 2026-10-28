# Quickstart: Validate the WorldCat ILL Label

**Feature**: [spec.md](./spec.md)

## Prerequisites

- Record source shown on the results list in Configure Views (unless the spike shows option 1
  doesn't need it).
- A search that returns both UMD-held results with "See Request Options" and WorldCat-only results
  on one page (use the "Libraries Worldwide" scope; e.g. "cats").

## Automated (option 2 only)

```sh
npm test
```

## Manual (proxy mode: `npm run start:proxy`)

| Check | Expected |
|---|---|
| Mixed page | Only WorldCat-only results say "Request from Interlibrary Loan"; UMD results keep "See Request Options" (SC-001) |
| Activate a relabeled link | Same destination as before |
| Next page, filter, sort, back (5 changes) | Labels still correct every time (SC-002) |
| Reload with network throttled | Old label never flashes on WorldCat results |
| VoiceOver on a relabeled link | Announced "Request from Interlibrary Loan" (SC-003) |
| Full record of a WorldCat item | Unchanged (results list only) |
| Source line | Not visible |
| Performance panel while paging | No long tasks from the feature (SC-004); no new requests (SC-005) |
