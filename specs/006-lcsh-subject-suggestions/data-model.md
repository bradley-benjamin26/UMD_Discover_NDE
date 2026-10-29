# Data Model: Subject Heading Suggestions

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

In-memory only; nothing persisted (FR-015).

## Search clause (parsed from the `query` URL parameter)

| Field | Example | Rule |
|---|---|---|
| field | `any`, `title`, `sub` | — |
| operator | `contains`, `exact`, `begins_with` | — |
| term | `climate change` | trimmed |
| joinedBy | `AND`, `OR`, `NOT`, or none | boolean that joins this clause to the previous one |

- **Search words** = terms of clauses not joined by `NOT` and not `sub` (FR-005).
- **Subject terms** = terms of `sub` clauses (used to skip suggestions already in the search, FR-004).
- **Cache key** = normalized search words + subject terms (FR-011).

## Result evidence (from results Discover already loaded)

| Field | Rule |
|---|---|
| titles | first 10 result titles |
| subjects | first 30 subject strings, split on `$$Q`, `--` normalized |

## Subject suggestion

| Field | Rule |
|---|---|
| label | LCSH authorized label |
| uri | `http://id.loc.gov/authorities/subjects/…` only |
| relationship | `authorized`, `alternate`, `narrower`, `result-set` |
| explanation | patron-facing reason text from relationship |

At most 5 shown; none already in the search; deduplicated by URI then label.

## Panel state

```text
collapsed ──open──▶ loading ──▶ ready (1–5 suggestions)
    ▲                  │    └──▶ ready-empty
    │                  └──────▶ error ──Retry──▶ loading
    └──close (keeps last result for this search)
new search words ──▶ collapsed (nothing fetched until opened)
paging / sort / facets ──▶ unchanged
```
