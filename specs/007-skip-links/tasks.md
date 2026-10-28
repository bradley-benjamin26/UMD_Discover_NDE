---

description: "Task list for 007 Skip Link Before the UMD Header"
---

# Tasks: Skip Link Before the UMD Header

**Input**: Design documents from `/specs/007-skip-links/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[contracts/skip-link.md](./contracts/skip-link.md), [quickstart.md](./quickstart.md)

**Tests**: Required (Constitution IV). Each test is run and seen failing on its assertion (not a
compile error) before the implementation; record the failing output in the PR.

**Release rule**: Ships in the same release as 001 (`specs/001-umd-design-system/tasks.md` T028).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = skip the header with the first keystroke (the only story)

---

## Phase 1: Setup

- [ ] T001 After 001's header exists (001 task T016), create branch `007-skip-links` from `001-umd-design-system` (`git checkout 001-umd-design-system && git checkout -b 007-skip-links`).
- [ ] T002 Spike in proxy mode with 001's header in place (`npm run build`, `npm run start:proxy`); temporarily map a trivial component rendering `<a href="#">probe</a>` to `nde-header-before` in `src/app/custom1-module/customComponentMappings.ts`. On home, results, full record, My Library, and a collection page, record in the "Discover side" table of `specs/007-skip-links/contracts/skip-link.md`: whether the probe is the first focusable element (Tab once from page load); the main content element's selector and id; whether it is focusable without `tabindex`; whether the header area is re-created on in-app navigation (probe element identity before/after a search); whether Discover's own skip links still work. Remove the probe mapping afterwards. If the probe is **not** first, do T011 in Phase 3.

No foundational phase: the only shared prerequisite is 001's header (T001).

---

## Phase 3: User Story 1 - Skip the header with the first keystroke (P1) 🎯 MVP

**Goal**: Tab, Enter from page load lands in main content, on every page.

**Independent Test**: On each page type, Tab once shows "Skip to main content" before any header
link; Enter then Tab continues inside main content.

### Tests (write first, see fail)

- [ ] T003 [US1] Create a stub `src/app/skip-link/skip-link.component.ts` (standalone, selector `custom-skip-link`, empty template, no logic) so the spec compiles and fails on assertions, not imports.
- [ ] T004 [US1] Write `src/app/skip-link/skip-link.component.spec.ts` (Jasmine, `TestBed`) with a fixture `<main id="{id from T002}">` appended to `document.body` and removed after each test, covering: renders exactly one `a.umd-skip-link` whose text is "Skip to main content" and has no `aria-label`; `href` is `#{main id}`; when not focused its computed width/height is 1px and it is clipped; when focused it is visible (width > 1px); click calls `preventDefault` (URL unchanged) and makes `document.activeElement` the `<main>`; adds `tabindex="-1"` only if `<main>` was not focusable, and leaves an existing `tabindex` alone; with no `<main>` present, click does nothing and throws nothing (and gives up after ~1 s, using `fakeAsync`/`tick`); after the fixture is destroyed, no listeners remain on `document` or `window` (spy on `addEventListener`).
- [ ] T005 [US1] Run `ng test --watch=false --browsers=ChromeHeadless`; confirm every T004 case fails on its assertion against the stub. Record output.

### Implementation

- [ ] T006 [US1] Implement `src/app/skip-link/skip-link.component.ts` (inline template and styles, one stylesheet only): template `<a class="umd-skip-link" [href]="'#' + mainId" (click)="skip($event)">Skip to main content</a>` with `mainId` from T002; `skip()` prevents default, finds the target by the T002 selector at click time (not cached), adds `tabindex="-1"` only if needed, calls `focus()`; if not found, retries on `requestAnimationFrame` for up to ~1 s, then stops without focusing anything. Styles: visually hidden clip pattern until `:focus`; on `:focus` `position: fixed; top: var(--space-xs); left: var(--space-xs); z-index: 2147483647`, `background: var(--white)`, `color: var(--darker-gray)`, `font: var(--text-base)/1.25 var(--font-body)`, padding `var(--space-xs) var(--space-sm)`, `outline: var(--focus-ring); outline-offset: var(--focus-offset)`; `@media (forced-colors: active)` outline `Highlight`. No document- or window-level listeners.
- [ ] T007 [US1] Register `['nde-header-before', SkipLinkComponent]` in `src/app/custom1-module/customComponentMappings.ts` (import from `../skip-link/skip-link.component`).
- [ ] T008 [US1] Run `ng test --watch=false --browsers=ChromeHeadless`; all T004 cases pass. Fix code, not tests.
- [ ] T009 [US1] Manual checks from [quickstart.md](./quickstart.md) on all five page types: first Tab, Enter then Tab, URL unchanged, 5 in-app navigations then back to top, Discover's own skip links, VoiceOver ("Skip to main content, link"), mouse-only invisible, 320 px and 200% zoom, forced colours. Record results.
- [ ] T010 [US1] Run axe DevTools on the five page types; 0 bypass-block, focus-visible, or contrast violations from this feature (SC-003). Record results.

### Contingency (only if T002 shows the hook is not first)

- [ ] T011 [US1] Move the markup of `src/assets/header-footer/header_en.html` into `SkipLinkComponent`'s template after the skip link (skip link first), delete `header_en.html`, move the header assertions from `tests/header-footer.test.js` into `skip-link.component.spec.ts` (same rules, run against the rendered template), see them fail before moving the markup, then pass. Re-run T009–T010. Record the change in `specs/001-umd-design-system/research.md` R5 and `specs/007-skip-links/research.md` R2.

**Checkpoint**: US1 complete; 001 + 007 ready to release together.

---

## Phase 4: Polish & Release

- [ ] T012 Confirm `npm test` passes end to end on `007-skip-links` (includes 001's tests).
- [ ] T013 Open the PR together with 001's (001 T028); include the recorded T005 failures, T009–T010 results, and whether T011 was needed.

---

## Dependencies & Execution Order

- 001 T016 (header) → T001 → T002 (spike) → T003 → T004 → T005 → T006 → T007 → T008 → T009/T010
  → T012 → T013.
- T011 only if T002 says so; it then precedes T009.
- T009 and T010 can run in parallel (manual checks by different people).

## Parallel Opportunities

Little: one small component. T009 and T010 in parallel; T006's styles and T007's mapping touch
different files but T007 is a one-line change best done right after T006.

## Implementation Strategy

The whole feature is the MVP (one story). Build it on top of 001's branch as soon as 001's header
exists, so 001's manual keyboard checks (001 T020) run with the skip link in place.
