# Implementation Plan: Subject Heading Suggestions

**Branch**: `006-lcsh-subject-suggestions` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-lcsh-subject-suggestions/spec.md`

## Summary

Port the prior project's Library of Congress subject suggestions panel to this package, keeping its
ranking and AND/OR/new-search flow, and fix what the review found: lookups only after the patron
opens the panel, no second Discover search (read results already loaded), NOT terms excluded, no
refetch on paging/sorting/facets, a native modal dialog instead of document-wide key handling, and
LoC requests sent without cookies, referrer, or Discover's interceptors.

## Technical Context

**Language/Version**: TypeScript 5.5, Angular 18.2 standalone component via `selectorComponentMap`

**Primary Dependencies**: Existing only (RxJS, `SHELL_ROUTER`, NgRx store if needed). Plain `fetch`;
no `HttpClientModule`

**Storage**: In-memory session cache (≤ 50 entries)

**Testing**: Karma/Jasmine: ported 21 tests + new fix tests, fake `fetch`, host/store fixtures

**Target Platform**: Primo NDE customization package, evergreen browsers (native `<dialog>`,
`AbortSignal.timeout`)

**Project Type**: Front-end customization package

**Performance Goals**: Results render no later than without the feature (SC-003); 0 extra Discover
searches (SC-004); suggestions within 3 s of opening or error state

**Constraints**: Constitution II exception limits (contracts/loc-requests.md); WCAG 2.2 AA; where
Discover exposes loaded results is undocumented (spike)

**Scale/Scope**: Results page, every search

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Accessibility | Native modal dialog (inert background, Escape, focus return); collapsed panel is a heading button with `aria-expanded`; polite status; nothing at document level | Pass |
| II. Privacy | Within the v1.1.0 exception: only search words/headings sent, only after opening, disclosure shown, ≤ 12 requests, no cookies/referrer/interceptor headers, in-memory only | Pass |
| III. Spec-driven | Traces to FR-001…FR-015; spike results recorded in contracts | Pass |
| IV. TDD | Prior tests ported and seen failing before the code; each fix has a failing test first | Pass |
| V. Correctness | Four prior defects fixed with regression tests; fallback if subjects aren't exposed is stated, not hidden | Pass |
| VI. Simplicity | Removes the evidence search service, `HttpClientModule`, hand-written focus trap, and scroll lock; no new dependencies | Pass |

Post-design re-check: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/006-lcsh-subject-suggestions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── loc-requests.md
│   └── nde-search-state.md   # spike fills TBD rows
└── tasks.md                  # /speckit-tasks
```

### Source Code (repository root)

```text
src/app/lcsh-suggestions/
├── lcsh-suggestions.component.ts / .html / .scss / .spec.ts
├── lcsh-suggestions.service.ts / .spec.ts     # fetch-based LoC client + cache
├── lcsh-ranking.ts / .spec.ts                 # ported as is
├── primo-query.ts / .spec.ts                  # clause parsing (NOT fix), query building
├── result-evidence.ts / .spec.ts              # reads already-loaded results (replaces the search service)
├── fixtures/                                  # from the spike, no patron data
└── README.md
src/app/custom1-module/customComponentMappings.ts   # add ['nde-search-results-top', LcshSuggestionsComponent]
```

**Structure Decision**: Same folder layout as the prior project, so the port is easy to compare;
query parsing split out of the component into its own file so it can be tested alone.

## Complexity Tracking

No violations to justify.
