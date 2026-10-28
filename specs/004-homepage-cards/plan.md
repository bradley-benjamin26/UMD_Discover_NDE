# Implementation Plan: Homepage Cards

**Branch**: `004-homepage-cards` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-homepage-cards/spec.md`

## Summary

Replace the out-of-the-box homepage shortcut row with a list of working, described cards styled
like lib.umd.edu's. Each card is one link with a title, a one-line description, and an icon copied
inline from the UMD design system's icon library; off-site cards show an external arrow. Static
HTML in a new `homepage_en.html` (from the template) plus a card section in 001's theme
stylesheet. The rest of the homepage is untouched.

## Technical Context

**Language/Version**: HTML (homepage template), SCSS (001's theme stylesheet)

**Primary Dependencies**: None new. Icon shapes copied from `@universityofmaryland/web-icons-library`
2.1.0 (MIT) with its notice; the package itself is not installed.

**Storage**: N/A

**Testing**: Karma/Jasmine spec parsing the homepage HTML with `DOMParser` against the card
contract; manual checks in proxy mode

**Target Platform**: Primo NDE customization package, evergreen browsers

**Project Type**: Front-end customization package

**Performance Goals**: No added requests; card markup + icons < 10 KB

**Constraints**: WCAG 2.2 AA; icons only from the UMD set (two draft cards have no match,
research R1); unknown whether homepage HTML shares the page's stylesheet (spike, research R4)

**Scale/Scope**: The homepage card row; 3–8 cards

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Accessibility | Native list and links, one tab stop per card, names from visible text (fixes the template's label-in-name failure and unreachable links), icons hidden, forced colours via `currentColor` | Pass |
| II. Privacy | Inline icons, no requests | Pass |
| III. Spec-driven | Traces to FR-001…FR-009; icon gaps returned to the Libraries per FR-002, not filled from another set | Pass |
| IV. TDD | Card contract spec written and failing before the HTML | Pass |
| V. Correctness | Missing descriptions and the Archives link are reported, and the test fails on placeholders rather than shipping them | Pass |
| VI. Simplicity | Static HTML and CSS; ~3 icons copied instead of adding a package | Pass |

Post-design re-check: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/004-homepage-cards/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/homepage-cards.md
└── tasks.md                     # /speckit-tasks
```

### Source Code (repository root)

```text
src/assets/homepage/
├── homepage_en.html             # new, from homepage_en.html.tmpl; card list replaces the menu
└── THIRD_PARTY_NOTICES.md       # MIT notice for the UMD icons
src/app/styles/_customized-theme.scss   # (001) homepage cards section (or homepage.css, research R4)
src/app/homepage-cards.spec.ts   # Karma contract spec
```

**Structure Decision**: Content stays in the homepage template NDE already loads; styles join the
theme stylesheet unless the spike shows the homepage is isolated.

## Complexity Tracking

No violations to justify.
