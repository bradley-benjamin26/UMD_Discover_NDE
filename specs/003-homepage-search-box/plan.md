# Implementation Plan: Homepage Search Box

**Branch**: `003-homepage-search-box` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-homepage-search-box/spec.md`

## Summary

Restyle Discover's own homepage search area like the lib.umd.edu homepage: the McKeldin Library
photo full-width behind one white panel holding NDE's "UMD Discover" heading, scope selector,
input, search button, and the Ask Anything / Advanced Search links. CSS only, in 001's theme
stylesheet, plus two right-sized JPEGs. Search behavior is untouched.

## Technical Context

**Language/Version**: SCSS (001's theme stylesheet)

**Primary Dependencies**: None new

**Storage**: N/A

**Testing**: `node:test` on the built stylesheet and image files; manual checks in
proxy mode

**Target Platform**: Primo NDE customization package, evergreen browsers

**Project Type**: Front-end customization package

**Performance Goals**: Phone downloads ≤ 80 KB of photo, desktop ≤ 300 KB; search box typeable no
later than today (SC-004)

**Constraints**: WCAG 2.2 AA; no third-party requests; NDE selectors undocumented (spike, research
R3); `homepageBGImage` must be unset in Alma

**Scale/Scope**: The homepage only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Accessibility | Text sits on the white panel, never the photo; focus rings from 001; one `h1`; reflow and zoom checked; scope text not shrunk below 0.875rem | Pass |
| II. Privacy | Local images; query goes only to Discover | Pass |
| III. Spec-driven | Traces to FR-001…FR-009; input-style conflict with the prior design flagged, spec followed (research R4) | Pass |
| IV. TDD | Stylesheet and image-budget tests written and failing first | Pass |
| V. Correctness | Prior CSS's brittle width-copying and readability shrink replaced, not copied | Pass |
| VI. Simplicity | CSS only; one panel instead of two synced half-cards; no new dependencies | Pass |

Post-design re-check: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/003-homepage-search-box/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/homepage-hero-selectors.md   # spike fills TBD rows
└── tasks.md                               # /speckit-tasks
```

### Source Code (repository root)

```text
src/app/styles/_customized-theme.scss    # (001) add the homepage hero section
src/assets/homepage/
├── hero-960.jpg                         # new
└── hero-1920.jpg                        # new
tests/homepage-hero.test.js              # new
```

**Structure Decision**: Styles join 001's single theme stylesheet; images sit with the homepage
assets NDE already serves.

## Complexity Tracking

No violations to justify.
