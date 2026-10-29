# Implementation Plan: Larger Availability Line in Search Results

**Branch**: `002-results-call-number` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-results-call-number/spec.md`

## Summary

Make Discover's availability line (status, location, call number) and "Available now" text
1.15rem instead of 0.875rem, with two CSS rules in feature 001's theme stylesheet that use the
`--text-lg` token, plus wrapping so the larger text doesn't clip on small screens.

## Technical Context

**Language/Version**: SCSS (compiled into 001's theme stylesheet)

**Primary Dependencies**: None new

**Storage**: N/A

**Testing**: `node:test` check on the built stylesheet; manual check in proxy mode

**Target Platform**: Primo NDE customization package, evergreen browsers

**Project Type**: Front-end customization package

**Performance Goals**: No added requests; a few bytes of CSS

**Constraints**: WCAG 2.2 AA; relies on two Discover class names (research R3)

**Scale/Scope**: Every result on the results list

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Accessibility | Larger rem text, wraps at 320 px, contrast unchanged | Pass |
| II. Privacy | CSS only | Pass |
| III. Spec-driven | Spec updated to the CSS-only scope before planning | Pass |
| IV. TDD | Stylesheet test written and seen failing before the rules | Pass |
| V. Correctness | Dependence on Discover class names recorded as a risk with a release check | Pass |
| VI. Simplicity | Two rules, reusing 001's token | Pass |

Post-design re-check: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/002-results-call-number/
├── plan.md
├── research.md
├── quickstart.md
└── tasks.md        # /speckit-tasks
```

No data model or contracts: nothing is added to the page.

### Source Code (repository root)

```text
src/app/styles/_customized-theme.scss   # (from 001) add the availability-size rules
tests/theme-tokens.test.js              # (from 001) add the availability-size assertions
```

**Structure Decision**: No new files; the rules live with the rest of the brand styles.

## Complexity Tracking

No violations to justify.
