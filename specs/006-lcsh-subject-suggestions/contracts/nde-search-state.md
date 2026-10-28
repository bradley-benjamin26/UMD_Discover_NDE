# Contract: Discover Search State (filled in by the spike)

Where the already-loaded results are read from (research R3). Recorded from a live results page in
proxy mode; fixtures saved with no patron data.

| Item | Value |
|---|---|
| Hook | `nde-search-results-top` (as in the prior project) |
| Source of loaded results | `hostComponent` path, or NgRx selector: TBD |
| Path to result titles | TBD |
| Path to result subjects | TBD |
| Primo `query` syntax for NOT confirmed | TBD (e.g. `any,contains,cats,NOT;any,contains,dogs`) |
| Navigation API used for AND/OR/new search | `SHELL_ROUTER` (existing injection token) |
