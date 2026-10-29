# Implementation Plan: WorldCat ILL Request Label

**Branch**: `005-worldcat-ill-label` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-worldcat-ill-label/spec.md`

## Summary

On the results list, WorldCat-only results should say "Request from Interlibrary Loan" instead of
"See Request Options", decided per result. First check whether Discover's label configuration can
do it with no code (the WorldCat results may use their own availability code). If not, a small
per-result component on the brief-result availability hook relabels only its own result, using the
result's own source data. The prior page-wide script is not carried over.

## Technical Context

**Language/Version**: Option 1: Alma label configuration (no code). Option 2: TypeScript 5.5,
Angular 18.2 standalone component via `selectorComponentMap`

**Primary Dependencies**: None new

**Storage**: N/A

**Testing**: Option 2: Karma/Jasmine with captured host fixtures. Both: manual mixed-results checks
in proxy mode

**Target Platform**: Primo NDE customization package, evergreen browsers

**Project Type**: Front-end customization package

**Performance Goals**: ≤ 2% slower paging (SC-004); work is per result and only on render, never a
page-wide scan

**Constraints**: WCAG 2.2 AA (label in name); results list only; English only; NDE codes and host
shape undocumented (spike)

**Scale/Scope**: Every result on every results page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Accessibility | Visible text and accessible name change together (2.5.3); no flash; link behavior unchanged | Pass |
| II. Privacy | Uses data already on the page; no requests | Pass |
| III. Spec-driven | Traces to FR-001…FR-011; option chosen by evidence from the spike | Pass |
| IV. TDD | Option 2: fixture-based failing tests first. Option 1 has no code; acceptance is the recorded manual check | Pass |
| V. Correctness | Prior page-wide mislabeling defect fixed by per-result decision; unknown source falls back to the original label | Pass |
| VI. Simplicity | Configuration first; component only if needed; no page-wide observer | Pass |

Post-design re-check: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/005-worldcat-ill-label/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/discover-availability.md   # spike fills TBD rows
└── tasks.md                             # /speckit-tasks
```

### Source Code (repository root)

```text
# Option 1: no source changes (Alma label edit, recorded in the PR)

# Option 2:
src/app/worldcat-ill-label/
├── worldcat-ill-label.component.ts
├── worldcat-ill-label.component.spec.ts
├── is-worldcat-only.ts              # pure decision from the result's data
└── fixtures/                        # host objects from the spike, no patron data
src/app/custom1-module/customComponentMappings.ts   # add ['<tag>-after', …]
src/app/styles/_customized-theme.scss               # (001) hide the source line, if still shown
```

**Structure Decision**: Feature folder under `src/app/`, as for other hooked components.

## Complexity Tracking

No violations to justify.
