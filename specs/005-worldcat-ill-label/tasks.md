---

description: "Task list for 005 WorldCat ILL Request Label"
---

# Tasks: WorldCat ILL Request Label

**Input**: Design documents from `/specs/005-worldcat-ill-label/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/discover-availability.md](./contracts/discover-availability.md),
[quickstart.md](./quickstart.md)

**Tests**: Required (Constitution IV) for any code. Option 1 (Alma label, no code) is accepted by
the recorded manual check; option 2 tests are seen failing on their assertions before the code.

**Depends on**: 001's Foundational phase (`specs/001-umd-design-system/tasks.md` T002 test
scripts) for the hidden-source CSS rule.

**Fork**: T003 picks option 1 or option 2 (research R2). Do only the tasks for the chosen option;
mark the other option's tasks "N/A (option N chosen)" rather than deleting them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = know that a WorldCat item comes through ILL; US2 = labels stay correct as
  results change

---

## Phase 1: Setup

- [ ] T001 After 001 task T013 passes, create branch `005-worldcat-ill-label` from `001-umd-design-system` (`git checkout 001-umd-design-system && git checkout -b 005-worldcat-ill-label`).
- [ ] T002 Confirm with the Alma administrator that the record source is shown on the results list in Configure Views (spec Assumptions). Record the answer for the PR.
- [ ] T003 Spike in proxy mode (`npm run build`, `npm run start:proxy`), "Libraries Worldwide" scope, search "cats" until one page has a WorldCat-only result and a UMD-held "See Request Options" result (and, if you can find one, a WorldCat + other source result). Temporarily map a probe component that does `console.log(this.hostComponent)` to the brief-result availability element's `-after` hook in `src/app/custom1-module/customComponentMappings.ts` (remove it afterwards). Fill every TBD in `specs/005-worldcat-ill-label/contracts/discover-availability.md`: delivery/availability code behind each label, Alma code table and label key, record source field path in `hostComponent`, hook tag, whether the label element has its own `aria-label`. Check in Alma whether the WorldCat code is ever used by UMD-held records. Write the outcome line: **option 1** if the WorldCat code is unique to WorldCat records, else **option 2**. Also record whether the source line is still needed with option 1 (research R4). For option 2, save the three host objects as JSON in `src/app/worldcat-ill-label/fixtures/` (`worldcat-only.json`, `umd.json`, `worldcat-plus-other.json`) with session ids and tokens removed.

No foundational phase.

---

## Phase 3: User Story 1 - Know that a WorldCat item comes through ILL (P1) 🎯 MVP

**Goal**: WorldCat-only results say "Request from Interlibrary Loan"; nothing else changes.

**Independent Test**: On a page mixing UMD-held and WorldCat results, only the WorldCat-only results
are relabeled.

### Hidden source line (both options, unless T003 shows option 1 lets the source setting be turned off)

- [ ] T004 [US1] Extend `tests/theme-tokens.test.js` with a `describe('results source line')` block: the built `dist/01USMAI_UMCP-NDE/custom.css` has a rule whose selector contains `[data-qa="brief_result_source"]` (or the selector from T003) setting `display: none` (FR-007). Run `npm run test:assets`; confirm it fails.
- [ ] T005 [US1] Add a "Results source line" section to `src/app/styles/_customized-theme.scss`: `[data-qa="brief_result_source"] { display: none; }` scoped to `.custom-nde-theme`. Run `npm run test:assets`; it passes. If T003 says the source setting can be turned off instead, ask the Alma admin to turn it off, mark T004–T005 N/A, and record why.

### Option 1: Alma label (no code)

- [ ] T006 [US1] Ask the Alma administrator to change the English label for the WorldCat code (table and key from T003) to "Request from Interlibrary Loan" for the NDE view. Record the table, key, old value, and new value for the PR.

### Option 2: per-result component — tests (write first, see fail)

- [ ] T007 [US1] Create stubs so the specs compile and fail on assertions: `src/app/worldcat-ill-label/is-worldcat-only.ts` exporting `isWorldcatOnly(result): boolean` returning `false`, and `src/app/worldcat-ill-label/worldcat-ill-label.component.ts` (standalone, selector `custom-worldcat-ill-label`, `@Input() hostComponent`, empty template, no logic).
- [ ] T008 [P] [US1] Write `src/app/worldcat-ill-label/is-worldcat-only.spec.ts` covering the [data-model decision table](./data-model.md#decision-table) with the T003 fixtures: `worldcat-only.json` → true; `umd.json` → false; `worldcat-plus-other.json` → false; source field missing or empty → false; source given in different case/whitespace ("worldcat ") follows the T003 finding.
- [ ] T009 [P] [US1] Write `src/app/worldcat-ill-label/worldcat-ill-label.component.spec.ts` (Jasmine, `TestBed`): render the component next to a fixture availability element built from the T003 hook markup, inside a wrapper per result. Cases: WorldCat-only + "See Request Options" → visible text "Request from Interlibrary Loan"; same element and same `href`/click handler as before (only the text changed, FR-004); if the element had an `aria-label`, it now equals the new text (FR-005); UMD result → unchanged; WorldCat + other → unchanged; WorldCat-only with a different label (e.g. online access) → unchanged; missing source → unchanged; two results side by side, one WorldCat-only and one UMD → only the WorldCat one changes (FR-002); the component never queries `document` (spy on `document.querySelector`/`querySelectorAll`).
- [ ] T010 [US1] Run `ng test --watch=false --browsers=ChromeHeadless`; confirm every T008–T009 case that expects a change fails on its assertion. Record output.

### Option 2: implementation

- [ ] T011 [US1] Implement `isWorldcatOnly` in `src/app/worldcat-ill-label/is-worldcat-only.ts` from the source field path recorded in T003: true only when the result's sole source is WorldCat.
- [ ] T012 [US1] Implement `src/app/worldcat-ill-label/worldcat-ill-label.component.ts`: from `hostComponent`, find this result's own availability label element (scoped to the host element, never `document`); if `isWorldcatOnly` and its trimmed text is exactly "See Request Options", set its text to "Request from Interlibrary Loan" and, if it has an `aria-label`, set that to the same text. Otherwise do nothing. No `MutationObserver`, no page-wide scan, no network.
- [ ] T013 [US1] Register `['<hook tag from T003>-after', WorldcatIllLabelComponent]` in `src/app/custom1-module/customComponentMappings.ts`.
- [ ] T014 [US1] Run `ng test --watch=false --browsers=ChromeHeadless`; all T008–T009 cases pass. Fix code, not tests.

### Both options: acceptance

- [ ] T015 [US1] Manual US1 checks from [quickstart.md](./quickstart.md): mixed page, only WorldCat-only results relabeled (SC-001); a relabeled link opens the same destination; VoiceOver announces "Request from Interlibrary Loan" (SC-003); full record of a WorldCat item unchanged (FR-009); source line not visible; same styling as other availability links (FR-008). Record results.

**Checkpoint**: US1 complete.

---

## Phase 4: User Story 2 - Labels stay correct as results change (P2)

**Goal**: Correct labels after paging, filtering, sorting, and scope changes, with no flash of the
old label.

**Independent Test**: Load results, go to page 2, apply a filter, return; every view has the
correct label on every result.

### Option 2 only: tests (write first, see fail)

- [ ] T016 [US2] Extend `src/app/worldcat-ill-label/worldcat-ill-label.component.spec.ts`: the same component instance whose host switches from the WorldCat-only fixture to the UMD fixture shows Discover's label for the UMD result, and back again (Angular reuses components when paging); availability that arrives after the component initialises (label element added later) is relabeled in the same change-detection pass that renders it; after the first `fixture.detectChanges()` with data present, the old text is never in the DOM (record text on every `MutationObserver` callback in the test and assert "See Request Options" never appears for the WorldCat result). Run `ng test --watch=false --browsers=ChromeHeadless`; confirm the new cases fail.

### Option 2 only: implementation

- [ ] T017 [US2] Re-evaluate in `src/app/worldcat-ill-label/worldcat-ill-label.component.ts` when the host's result or availability changes, by the mechanism T003 showed (host input change or the host's own observable), staying scoped to the one result. Run `ng test --watch=false --browsers=ChromeHeadless`; all cases pass.

### Both options: acceptance

- [ ] T018 [US2] Manual US2 checks: 5 consecutive changes (next page, filter, sort, scope change, back), labels correct every time (SC-002); reload with network throttled to Slow 3G, old label never flashes on WorldCat results. Record results.

**Checkpoint**: US1 and US2 both work.

---

## Phase 5: Polish & Release

- [ ] T019 Run axe DevTools on a mixed results page; 0 WCAG 2.2 AA violations (SC-003). Record results.
- [ ] T020 Measure paging time (Performance panel, 5 page changes) with the feature on vs. off: increase ≤ 2% (SC-004), no long tasks from the feature, no new requests (SC-005). Record numbers.
- [ ] T021 Confirm `npm test` passes end to end.
- [ ] T022 Open the PR (into `001-umd-design-system` if 001 hasn't merged, else `main`); include the filled contract, the option chosen and why, T010/T016 failure output (option 2), the Alma changes (T002, T006), T015/T018–T020 results. Note separately, as out of scope: `src/assets/js/custom.js` still logs "Hello from custom.js" (research R6), and the WorldCat "-2" result-count issue (spec Assumptions).

---

## Dependencies & Execution Order

- 001 T013 → T001 → T002, T003 → fork:
  - Option 1: T004/T005 → T006 → T015 → T018 → T019–T022.
  - Option 2: T004/T005, then T007 → T008/T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016 →
    T017 → T018 → T019–T022.
- T003 blocks everything after it (option, selectors, fixtures).

## Parallel Opportunities

- T002 and T003 at the same time.
- T004/T005 (CSS) alongside T007–T014 (component): different files.
- T008 and T009 (different spec files).
- T019 and T020 by different people.

## Implementation Strategy

1. MVP = Setup + US1. If T003 lands on option 1, the feature is an Alma label change plus one CSS
   rule, and US2 is a manual check only.
2. Option 2: US1 then US2, each test seen failing first.
