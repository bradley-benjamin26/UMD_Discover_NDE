# Data Model: WorldCat ILL Request Label

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

No stored data; reads only what Discover has already loaded for each result.

## Result (as seen by the feature)

| Field | Source | Use |
|---|---|---|
| sources | the result's record source(s) (exact field: spike) | relabel only when the sole source is WorldCat |
| availability label | Discover's availability text for the result | relabel only when it is "See Request Options" |
| availability code | the delivery code behind the label (spike) | decides option 1 vs. 2 (research R2) |

## Decision table

| Sole source WorldCat? | Label is "See Request Options"? | Shown |
|---|---|---|
| yes | yes | "Request from Interlibrary Loan" |
| yes | no (e.g. online access) | unchanged |
| no (UMD, or WorldCat + another) | any | unchanged |
| source unknown | any | unchanged |
