---

description: "Task list for 002 Larger Availability Line in Search Results"
---

# Tasks: Larger Availability Line in Search Results

**Input**: Design documents from `/specs/002-results-call-number/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[quickstart.md](./quickstart.md)

**Tests**: Required (Constitution IV). Each test is run and seen failing on its assertion before
the implementation; record the failing output in the PR.

**Depends on**: 001's Foundational phase (`specs/001-umd-design-system/tasks.md` T002 `test:assets`
script, T006 `tests/theme-tokens.test.js`, T009 `--text-lg` token).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = read availability, location, and call number at a glance (the only story)

---

## Phase 1: Setup

- [ ] T001 After 001 task T013 passes, create branch `002-results-call-number` from `001-umd-design-system` (`git checkout 001-umd-design-system && git checkout -b 002-results-call-number`).
- [ ] T002 Spike in proxy mode (`npm run build`, `npm run start:proxy`), search "cats" in a scope with print, electronic, and on-order results. Record in a new "Spike findings" section at the end of `specs/002-results-call-number/research.md`: whether `.available-at-button .mdc-button__label` matches the whole availability line (status, location, call number) and `.quicklink-button` matches the "Available now" text on each result type; their current computed `font-size` (expected 14px); whether NDE's rules beat a `.custom-nde-theme`-scoped rule without `!important`; whether the label already wraps at 320 px (decides research R2's `white-space: normal` rule). If a selector doesn't match, record the one that does and use it in T003 and T005.

No foundational phase: 001 provides the stylesheet, token, and test file.

---

## Phase 3: User Story 1 - Read availability, location, and call number at a glance (P1) 🎯 MVP

**Goal**: The availability line and "Available now" text are 1.15rem on every result.

**Independent Test**: Search a known print title; its availability line, including the call number
in parentheses, computes to 18.4px at default browser settings.

### Tests (write first, see fail)

- [ ] T003 [US1] Extend `tests/theme-tokens.test.js` (reads `dist/01USMAI_UMCP-NDE/custom.css`) with a `describe('availability line size')` block, using the selectors confirmed in T002: a rule whose selector contains `.available-at-button .mdc-button__label` sets `font-size: var(--text-lg)`; a rule whose selector contains `.quicklink-button` sets `font-size: var(--text-lg)`; neither rule declares a `px` font size (FR-003); if T002 found the label doesn't wrap, the availability rule also sets `white-space: normal` (FR-004).
- [ ] T004 [US1] Run `npm run test:assets`; confirm the new assertions fail because the rules are missing (and 001's existing assertions still pass). Record output.

### Implementation

- [ ] T005 [US1] Add a "Results availability line" section to `src/app/styles/_customized-theme.scss`, scoped to `.custom-nde-theme`: `.available-at-button .mdc-button__label { font-size: var(--text-lg); }` (plus `white-space: normal` if T002 requires it) and `.quicklink-button { font-size: var(--text-lg); }`. Use `!important` only if T002 showed NDE's specificity requires it, with a one-line comment saying why. Do not change colour, content, or order (FR-005, FR-007).
- [ ] T006 [US1] Run `npm run test:assets`; all assertions pass. Fix code, not tests.
- [ ] T007 [US1] Manual checks from [quickstart.md](./quickstart.md): computed size 18.4px on availability line and "Available now"; grows with browser text size Large; long lines wrap at 320 px and 200% zoom with no clipping or horizontal scroll; next page, filter, and sort keep the size; electronic-only and on-order results enlarged the same way; network panel shows no new requests (SC-004). Record results.
- [ ] T008 [US1] Run axe DevTools on a results page; 0 WCAG 2.2 AA violations introduced (SC-003). Record results.

**Checkpoint**: US1 complete.

---

## Phase 4: Polish & Release

- [ ] T009 Confirm `npm test` passes end to end on `002-results-call-number`.
- [ ] T010 Open the PR (into `001-umd-design-system` if 001 has not merged yet, else `main`); include the T004 failure output, T007–T008 results, and research R3's note that these are undocumented Discover class names to re-check after each NDE release.

---

## Dependencies & Execution Order

- 001 T013 → T001 → T002 → T003 → T004 → T005 → T006 → T007/T008 → T009 → T010.
- T007 and T008 can run in parallel.

## Parallel Opportunities

Little: two CSS rules. T007 and T008 by different people. 002 can be built in parallel with 003,
004, and 007 once 001 T013 is done, but all edit `_customized-theme.scss`, so merge one at a time.

## Implementation Strategy

The whole feature is the MVP (one story). It's small enough to ship in the same release as 001.
