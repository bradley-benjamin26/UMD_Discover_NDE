# Research: Subject Heading Suggestions

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

Starting point: `customModule-main/src/app/lcsh-suggestions/` (component, LoC service, result
evidence service, ranking, 21 tests). Ported with the fixes below; ranking rules kept.

## R1. What leaves the browser (Constitution II exception, FR-003, FR-015)

- **Decision**: Call id.loc.gov with plain `fetch` using `credentials: 'omit'`,
  `referrerPolicy: 'no-referrer'`, `cache: 'default'`, and `AbortSignal.timeout(3000)`. Only the
  candidate phrase (`q`) and fixed parameters are sent. No Angular `HttpClient`.
- **Rationale**: Discover's `HttpClient` may carry NDE interceptors that add session or auth
  headers; that must never reach a third party. `no-referrer` stops the Discover URL (which
  contains the full query, view id, and facets) from being sent as `Referer`. `omit` sends no
  cookies. `fetch` removes the prior `HttpClientModule` import from the app module.
- **Alternatives**: Prior code's own `HttpClientModule` (separate from NDE's interceptors, but
  default referrer policy and an extra module import).

## R2. When lookups happen (FR-003a, FR-011)

- **Decision**: Nothing is sent until the panel is first opened for the current search. The cache
  key is the normalized search (search words excluding NOT clauses, plus subject clauses), not the
  URL, so paging, sorting, and facets reuse the same suggestions. In-memory cache, at most 50
  entries, cleared on reload (FR-015).
- **Rationale**: Prior code keyed on the whole URL and fetched on every search, open or not.

## R3. Top-result subjects without a second search (FR-010)

- **Prior**: `PrimoResultEvidenceService` re-ran the search against `/primaws/rest/pub/pnxs`
  (limit 10) for every query.
- **Decision**: Read titles and subjects of the results Discover already loaded: first from the
  `hostComponent` of the `nde-search-results-top` hook, else from the NDE NgRx store via a
  selector (README "Accessing app state"). Which one, and the field paths, are set by a spike
  (first task), recorded in [contracts/nde-search-state.md](./contracts/nde-search-state.md).
- **Fallback**: If neither exposes subjects, suggest from search words only (no result-set
  evidence) rather than re-running the search. Recorded as a known reduction, not hidden.

## R4. NOT clauses (FR-005)

- Primo's `query` is `field,operator,term,BOOL;field,operator,term,…`, where the trailing boolean
  joins the clause to the **next** one. The prior parser stripped the boolean and kept every term,
  so `any,contains,cats,NOT;any,contains,dogs` suggested subjects for "dogs".
- **Decision**: Parse clauses in order; drop any clause whose preceding boolean is `NOT`. Unit
  tests for AND, OR, NOT, and mixed. Exact syntax confirmed in the spike.

## R5. Dialog (FR-006, FR-008, FR-009)

- **Decision**: Native `<dialog>` opened with `showModal()`. The browser makes the rest of the page
  inert (focus can't leave), closes on Escape (`cancel` event), and returns focus to the opener on
  close. Close button and backdrop click (click whose target is the dialog element) call
  `close()`.
- **Rationale**: Replaces the prior hand-written focus trap, the document-wide Escape listener
  (the defect that broke Discover's own dialogs), and the `body.style.overflow` save/restore.
  Nothing listens at document level, so FR-009 holds by construction.
- **Alternatives**: Angular CDK dialog (installed, but adds overlay setup for one dialog);
  keep prior code (defects).

## R6. Disclosure (FR-003b)

- **Decision**: First line inside the open panel: "Your search words are sent to the Library of
  Congress to find subject headings." with a link to the Libraries' privacy page (URL confirmed by
  the Libraries).

## R7. Unchanged from prior

Ranking (`lcsh-ranking.ts`), narrower-term lookup for the top 2 headings (≤ 3 each), ≤ 10 candidate
lookups (≤ 12 total), AND/OR/new-search query building, Boolean guide link, collapsed panel,
`aria-busy`, polite live region, error with Retry.

## R8. Testing

- Port the prior 21 tests first, run them with no implementation, confirm they fail, then port the
  code (Constitution IV).
- New failing tests before each fix: NOT-clause exclusion; cache key ignores paging/sort/facets;
  no lookup before the panel opens; fetch called with `credentials: 'omit'` and
  `referrerPolicy: 'no-referrer'`; Escape with no dialog open changes nothing; dialog closes on
  Escape/close/backdrop and returns focus; evidence read from host/store fixture, no
  `/primaws` request.
- `fetch` is replaced with a fake in tests; no network in CI.
