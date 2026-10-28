---

description: "Task list for 006 Subject Heading Suggestions"
---

# Tasks: Subject Heading Suggestions

**Input**: Design documents from `/specs/006-lcsh-subject-suggestions/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/loc-requests.md](./contracts/loc-requests.md),
[contracts/nde-search-state.md](./contracts/nde-search-state.md), [quickstart.md](./quickstart.md)

**Tests**: Required (Constitution IV). Prior tests are ported and seen failing against stubs before
any code is ported; every fix gets a new failing test first. `fetch` is faked in every test; no
network in CI. Record failing output in the PR.

**Source of the port**: `../customModule-main/src/app/lcsh-suggestions/` (sibling of this repo):
`lcsh-ranking.ts` (7 tests), `lcsh-suggestions.service.ts` (2 tests),
`lcsh-suggestions.component.ts/.html/.scss` (12 tests). `primo-result-evidence.service.ts` is not
ported (FR-010).

**Depends on**: 001's Foundational phase (`specs/001-umd-design-system/tasks.md` T009 tokens, T012
focus rings) for styling.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = discover the right subject heading; US2 = add a heading to the search;
  US3 = graceful when the subject service is slow or down

---

## Phase 1: Setup

- [ ] T001 After 001 task T013 passes, create branch `006-lcsh-subject-suggestions` from `001-umd-design-system` (`git checkout 001-umd-design-system && git checkout -b 006-lcsh-subject-suggestions`).
- [ ] T002 Spike in proxy mode (`npm run build`, `npm run start:proxy`). Temporarily map a probe component that does `console.log(this.hostComponent)` to `nde-search-results-top` in `src/app/custom1-module/customComponentMappings.ts` (remove it afterwards). Search "climate change farming" and fill every TBD in `specs/006-lcsh-subject-suggestions/contracts/nde-search-state.md`: whether loaded results come from `hostComponent` or the NgRx store (and the selector), and the paths to result titles and subjects. Run an advanced search "cats" NOT "dogs" and record the exact `query` URL parameter. Save fixtures with session ids and tokens removed: `src/app/lcsh-suggestions/fixtures/host-climate.json` (the host or store slice with ≥ 10 results) and `fixtures/queries.json` (the NOT query, an AND query, an OR query, and one with a `sub` clause). If neither source exposes subjects, record that and the research R3 fallback (suggest from search words only) in the contract.
- [ ] T003 [P] Ask the Libraries to confirm the privacy page URL for the disclosure link (research R6) and that the Boolean guide is still `https://lib.guides.umd.edu/umd-discover/boolean`. Record both in `specs/006-lcsh-subject-suggestions/research.md` R6.

---

## Phase 2: Foundational

**⚠️ Blocks all stories.**

- [ ] T004 Create stubs in `src/app/lcsh-suggestions/` that export every name the specs below import, with no logic (empty arrays/strings, `false`, or `of()`): `lcsh-ranking.ts` (same exports as the prior file), `primo-query.ts`, `result-evidence.ts`, `lcsh-suggestions.service.ts`, `lcsh-suggestions.component.ts` (standalone, selector `custom-lcsh-suggestions`, `@Input() hostComponent`) with empty `lcsh-suggestions.component.html` and `.scss`. Specs must compile and fail on assertions, not imports.
- [ ] T005 Write a fake-`fetch` helper in `src/app/lcsh-suggestions/testing/fake-fetch.ts` (test-only): `spyOn(window, 'fetch')` returning canned JSON per URL from the prior service spec's responses, recording every `(url, init)`; supports "never resolve", "reject", and "resolve later" per URL.

**Checkpoint**: Specs can be written against stubs.

---

## Phase 3: User Story 1 - Discover the right subject heading (P1) 🎯 MVP

**Goal**: A collapsed panel above results that, once opened, lists up to 5 headings with reasons,
looked up privately and only after opening.

**Independent Test**: Search a common topic, open the panel; it lists relevant headings with
reasons, none already in the search, with 0 LoC requests before opening.

### Tests (write first, see fail)

- [ ] T006 [P] [US1] Port `../customModule-main/src/app/lcsh-suggestions/lcsh-ranking.spec.ts` to `src/app/lcsh-suggestions/lcsh-ranking.spec.ts` unchanged except import paths (7 tests).
- [ ] T007 [P] [US1] Write `src/app/lcsh-suggestions/primo-query.spec.ts` for parsing (data-model "Search clause"): port the 4 `extractPrimoSearchTerm` tests and the 2 "Primo subject query detection" tests from the prior component spec, adapted to `parseQuery(query): Clause[]` (`field`, `operator`, `term` trimmed, `joinedBy` `AND`/`OR`/`NOT`/none = the boolean joining this clause to the previous one), `searchWords(clauses)` (terms of clauses not joined by `NOT` and not `sub`), `subjectTerms(clauses)`, and `cacheKey(clauses)`. New: the T002 NOT query gives search words without "dogs" (FR-005); AND, OR, and mixed queries; commas inside a term preserved; `sub` terms excluded from search words but returned by `subjectTerms`; `cacheKey` equal for the same words in different case/spacing.
- [ ] T008 [P] [US1] Write `src/app/lcsh-suggestions/lcsh-suggestions.service.spec.ts` with the fake `fetch` (T005), no `HttpClient` provider in `TestBed`: port the 2 prior tests ("deduplicated authorized subject headings", "reports an error when every LOC suggestion request fails"). New, per [contracts/loc-requests.md](./contracts/loc-requests.md): every `fetch` URL matches either `https://id.loc.gov/authorities/subjects/suggest2/?q=…&count=8&searchtype=keyword` or `https://id.loc.gov/authorities/subjects/{id}.json`; every `init` has `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, and an `AbortSignal`; for a search with many candidates, ≤ 10 suggest calls and ≤ 2 narrower calls (≤ 3 narrower headings each); a narrower call is made only for ids from `http://id.loc.gov/authorities/subjects/` URIs (a response with another URI triggers none); the same cache key twice → no second `fetch`; the cache holds at most 50 entries (the 51st key evicts the oldest); suggestions are deduplicated by URI then label, at most 5, none equal to a subject term (FR-004).
- [ ] T009 [P] [US1] Write `src/app/lcsh-suggestions/result-evidence.spec.ts` with the T002 fixture: `readEvidence(source)` returns the first 10 titles and first 30 subject strings, split on `$$Q` with `--` normalized (data-model "Result evidence"); missing or empty fields → empty evidence (research R3 fallback); `fetch` is never called and no `HttpClient` is injected (FR-010).
- [ ] T010 [US1] Write `src/app/lcsh-suggestions/lcsh-suggestions.component.spec.ts` (US1 part) with `TestBed`, a fake `SHELL_ROUTER` (from `src/app/injection-tokens.ts`) whose `url` and `events` the test controls, the T002 host fixture, and the fake `fetch`: query < 2 characters → no panel; ≥ 2 → one collapsed panel whose heading contains a `<button aria-expanded="false">` "Suggested Library of Congress subjects" (FR-001, FR-002); **0** `fetch` calls before the button is pressed (FR-003a); pressing it sets `aria-expanded="true"`, shows the disclosure "Your search words are sent to the Library of Congress to find subject headings." with a link to the T003 privacy URL (FR-003b), and sets `aria-busy="true"` while loading; when ready, ≤ 5 suggestions each with its explanation; a heading already in a `sub` clause is not listed (FR-004); no results → "No additional controlled subjects were found for “{query}”." (prior wording); a polite live region announces loading, ready, and empty, and `document.activeElement` doesn't change (FR-013); navigating to a URL with the same `query` but different `offset`, `sortby`, or facets → no new `fetch`, same suggestions (FR-011); new search words → panel collapsed and no `fetch`; two quick searches where the first's `fetch` resolves last → only the second's suggestions shown.
- [ ] T011 [US1] Run `ng test --watch=false --browsers=ChromeHeadless`; confirm every T006–T010 test fails on its assertion against the stubs. Record output.

### Implementation

- [ ] T012 [P] [US1] Replace the stub `src/app/lcsh-suggestions/lcsh-ranking.ts` with the prior file, unchanged (research R7).
- [ ] T013 [P] [US1] Implement parsing in `src/app/lcsh-suggestions/primo-query.ts`: `parseQuery`, `searchWords`, `subjectTerms`, `cacheKey`, with the NOT syntax confirmed in T002 (research R4).
- [ ] T014 [P] [US1] Implement `src/app/lcsh-suggestions/result-evidence.ts` reading from the source and paths recorded in T002 (or returning empty evidence if the contract records the fallback).
- [ ] T015 [US1] Implement `src/app/lcsh-suggestions/lcsh-suggestions.service.ts` by porting the prior service onto plain `fetch` with `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, `cache: 'default'`, `signal: AbortSignal.timeout(3000)` (research R1); the limits in [contracts/loc-requests.md](./contracts/loc-requests.md); an in-memory `Map` cache of ≤ 50 entries keyed by `cacheKey`, nothing in browser storage (FR-015). No `HttpClient`.
- [ ] T016 [US1] Implement the panel in `src/app/lcsh-suggestions/lcsh-suggestions.component.ts`, `.html`, and `.scss`, porting the prior component minus the dialog, the evidence search service, `HttpClientModule`, and all `@HostListener('document:…')` and `document.body.style` code: read `query` from `SHELL_ROUTER`, react to `NavigationEnd` only when `cacheKey` changes, fetch only after the panel is first opened for that key, keep the latest search's results only (`switchMap`), panel states per the [data-model state diagram](./data-model.md#panel-state). Styles from 001 tokens only; long headings wrap.
- [ ] T017 [US1] Register `['nde-search-results-top', LcshSuggestionsComponent]` in `src/app/custom1-module/customComponentMappings.ts`.
- [ ] T018 [US1] Run `ng test --watch=false --browsers=ChromeHeadless`; all T006–T010 tests pass. Fix code, not tests.
- [ ] T019 [US1] Manual US1 checks from [quickstart.md](./quickstart.md): network panel filtered to `loc.gov` shows 0 requests until the panel is opened; on opening, the disclosure is shown and there are ≤ 12 requests, each without `Referer` or cookies; ≤ 5 suggestions with reasons within 3 s; page 2, sort by date, add a facet → no new LoC requests; `cats` NOT `dogs` gives nothing built from "dogs"; network filtered to `primaws` shows no second search from the feature (SC-004); headings with diacritics display correctly. Record results.

**Checkpoint**: US1 complete; suggestions visible and private, but not yet actionable.

---

## Phase 4: User Story 2 - Add a heading to the search (P1)

**Goal**: Choosing a suggestion opens a native modal "Add search term" dialog that runs AND, OR, or
a new subject search.

**Independent Test**: Choose a suggestion and each action in turn; the resulting search matches the
choice, and the dialog behaves as a modal.

### Tests (write first, see fail)

- [ ] T020 [P] [US2] Extend `src/app/lcsh-suggestions/primo-query.spec.ts`: port the prior `createPrimoSubjectQuery` test (1) and `appendPrimoSubjectQuery` tests (5) to `subjectQuery(label)` and `appendSubject(query, label, 'AND' | 'OR')`; add: appending to the T002 NOT query keeps the NOT clause intact.
- [ ] T021 [US2] Extend `src/app/lcsh-suggestions/lcsh-suggestions.component.spec.ts` (US2 part): choosing a suggestion opens a `<dialog>` with `open` true and matching `:modal`, named "Add search term" via `aria-labelledby`, showing the heading, buttons "Add with AND", "Add with OR", "Start new search", "Close", and a link to the T003 Boolean guide URL; focus is inside the dialog (FR-006, FR-008); each action calls `SHELL_ROUTER.navigateByUrl` with the URL whose `query` is the expected result from T020 (FR-007, SC-002); dispatching `cancel` (Escape), pressing Close, and a click whose target is the `<dialog>` element itself each close it and return focus to the chosen suggestion button; a click on content inside the dialog doesn't close it; for the component's whole life, `document.addEventListener` is never called with a keyboard event type and `document.body.style.overflow` is never written (spy on both); dispatching `keydown` Escape on `document` with no dialog open changes nothing (FR-009).
- [ ] T022 [US2] Run `ng test --watch=false --browsers=ChromeHeadless`; confirm the T020–T021 tests fail. Record output.

### Implementation

- [ ] T023 [US2] Implement `subjectQuery` and `appendSubject` in `src/app/lcsh-suggestions/primo-query.ts`, ported from the prior component's query builders.
- [ ] T024 [US2] Add the dialog to `src/app/lcsh-suggestions/lcsh-suggestions.component.html`/`.ts`/`.scss`: native `<dialog>` opened with `showModal()`; `(cancel)` and Close call `close()`; `(click)` closes only when `event.target` is the dialog; on close, focus the suggestion that opened it; actions navigate via `SHELL_ROUTER.navigateByUrl`; `::backdrop` and button styles from 001 tokens; nothing at document level (research R5).
- [ ] T025 [US2] Run `ng test --watch=false --browsers=ChromeHeadless`; all tests pass.
- [ ] T026 [US2] Manual US2 checks: Add with AND, Add with OR, Start new search each produce the expected query (SC-002); Tab cycles inside the dialog; Escape, Close, and backdrop click each close it with focus back on the suggestion; open Discover's Cite dialog and press Escape (works normally, page scrolls normally after, SC-006); VoiceOver announces the dialog as "Add search term". Record results.

**Checkpoint**: US1 and US2 form the minimum useful feature.

---

## Phase 5: User Story 3 - Graceful when the subject service is slow or down (P2)

**Goal**: If LoC is slow or down, results are unaffected and the panel offers Retry.

**Independent Test**: Block `id.loc.gov`; results load normally and the panel shows the unavailable
message with Retry.

### Tests (write first, see fail)

- [ ] T027 [US3] Extend the specs: in `lcsh-suggestions.service.spec.ts`, `AbortSignal.timeout` is called with `3000` (spy), and a `fetch` that rejects with a `TimeoutError`/`AbortError` for every suggest call yields the error result; in `lcsh-suggestions.component.spec.ts`, that error shows "Subject suggestions are temporarily unavailable." and a "Retry" button, announced in the polite live region without moving focus (FR-012, FR-013); Retry clears the cache entry for that key and calls `fetch` again; on success after Retry the suggestions show; the host fixture is never mutated by the component. Run `ng test --watch=false --browsers=ChromeHeadless`; confirm the new tests fail.

### Implementation

- [ ] T028 [US3] Add the error state and Retry to `src/app/lcsh-suggestions/lcsh-suggestions.component.ts`/`.html` and error caching rules to `lcsh-suggestions.service.ts` (don't cache failures). Run `ng test --watch=false --browsers=ChromeHeadless`; all tests pass.
- [ ] T029 [US3] Manual US3 check: block `id.loc.gov` in DevTools, open the panel; results unaffected, unavailable message and Retry announced by VoiceOver; unblock, Retry, suggestions appear (SC-003). Record results.

**Checkpoint**: All three stories work.

---

## Phase 6: Polish & Release

- [ ] T030 [P] Write `src/app/lcsh-suggestions/README.md` from the prior project's README, updated with the fixes, the LoC request rules from [contracts/loc-requests.md](./contracts/loc-requests.md), and the T002 data source (and fallback, if any).
- [ ] T031 Run axe DevTools on the results page with the panel open and the dialog open; 0 WCAG 2.2 AA violations (SC-005). Check 320 px, 200% zoom, and forced colours for panel and dialog. Record results.
- [ ] T032 Have a subject librarian review 20 common topic searches; ≥ 80% show at least one relevant heading (SC-001). Record the list and judgments.
- [ ] T033 Confirm `npm test` passes end to end and `npm run build` succeeds with no `HttpClientModule` added to `src/app/app.module.ts`.
- [ ] T034 Open the PR (into `001-umd-design-system` if 001 hasn't merged, else `main`); include T011/T022/T027 failure output, T019/T026/T029/T031/T032 results, the filled `nde-search-state.md` contract, and the privacy summary (what's sent, when, to whom), citing the constitution v1.1.0 Principle II exception.

---

## Dependencies & Execution Order

- 001 T013 → T001 → T002, T003 → T004, T005 → US1 (T006–T019) → US2 (T020–T026) → US3 (T027–T029)
  → Polish (T030–T034).
- T002 (data source, NOT syntax, fixtures) blocks T007, T009, T010, and T014.
- US2 and US3 both extend US1's component and `primo-query.ts`, so they follow US1; US3 can go
  before US2 if needed (no shared code beyond the component file).

## Parallel Opportunities

- T002 and T003.
- T006, T007, T008, T009 (different spec files) once T004/T005 exist.
- T012, T013, T014 (different files) once T011 has been seen failing.
- T020 alongside T021 (different files).
- T030 alongside T031/T032.

## Implementation Strategy

1. MVP = Setup + Foundational + US1 + US2 (both P1): suggestions that can be acted on. Don't ship
   US1 alone; a list you can't use has little value (spec US2 rationale).
2. Then US3 (error handling and Retry).
3. Port tests before code at every step: run the prior tests against stubs, see them fail, then
   port the code.
