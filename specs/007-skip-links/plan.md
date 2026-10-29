# Implementation Plan: Skip Link Before the UMD Header

**Branch**: `007-skip-links` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-skip-links/spec.md`

## Summary

Put one "Skip to main content" link before the UMD header (feature 001) so a keyboard user reaches
main content with Tab, Enter. A small standalone component on the `nde-header-before` hook (the
prior project's proven position) renders the link and moves focus straight to Discover's main
content, replacing the prior two-step "Skip to page shortcuts" button and its failing yellow focus
ring. Built and released together with 001.

## Technical Context

**Language/Version**: TypeScript 5.5, Angular 18.2 standalone component via `selectorComponentMap`

**Primary Dependencies**: None new

**Storage**: N/A

**Testing**: Karma/Jasmine (written first); manual keyboard / screen-reader checks per page type

**Target Platform**: Primo NDE customization package, evergreen browsers

**Project Type**: Front-end customization package

**Performance Goals**: Negligible (one link, one click handler)

**Constraints**: WCAG 2.2 AA (2.4.1, 2.4.7, 2.4.11, 1.4.3); DOM order with 001's static header and
the main target are undocumented (spike)

**Scale/Scope**: Every page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Accessibility | Bypass in one step; named link; visible focus 15.5:1 (fixes the prior 1.45:1); forced colours | Pass |
| II. Privacy | No requests or data | Pass |
| III. Spec-driven | Traces to FR-001…FR-009; ordering confirmed by spike before build | Pass |
| IV. TDD | Component tests written and failing first (prior had only a "creates" test) | Pass |
| V. Correctness | Prior defects (contrast, dead header script, dependency on Discover's skip class) fixed; no wrong focus if target missing | Pass |
| VI. Simplicity | One small component; one stylesheet instead of two; contingency reuses 001's markup rather than adding parts | Pass |

Post-design re-check: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/007-skip-links/
├── plan.md
├── research.md
├── quickstart.md
├── contracts/skip-link.md   # spike fills TBD rows
└── tasks.md                 # /speckit-tasks
```

No data model: the feature has no data.

### Source Code (repository root)

```text
src/app/skip-link/
├── skip-link.component.ts       # renders the link, moves focus
└── skip-link.component.spec.ts
src/app/custom1-module/customComponentMappings.ts   # add ['nde-header-before', SkipLinkComponent]
```

**Structure Decision**: One feature folder, like the prior `skip-to-main-menu/`, without its unused
second stylesheet.

## Complexity Tracking

No violations to justify.
