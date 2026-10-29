# Implementation Plan: UMD Design System for Discover

**Branch**: `001-umd-design-system` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-umd-design-system/spec.md`

## Summary

Make every Discover page look like lib.umd.edu: the red UMD global bar, Libraries logo and
navigation, the Libraries footer, UMD colours and fonts, and Discover's own buttons, chips, tags,
and cards restyled to match. Approach: one compiled theme stylesheet holding the brand tokens and
an Angular Material 3 theme generated from Maryland red (so NDE's Material controls restyle
through their own theme rather than fragile selector overrides), self-hosted licensed fonts
(Interstate, Crimson Pro, Barlow Condensed), and a new static header and footer with absolute links
and no scripts. Ships together with spec 007 (skip link before the header).

## Technical Context

**Language/Version**: TypeScript 5.5, SCSS, HTML; Angular 18.2

**Primary Dependencies**: Existing only: `@angular/material` 18.2 (M3 theme mixins), Angular CLI
build. No new dependencies.

**Storage**: N/A

**Testing**: `node:test` (existing `tests/` pattern) for compiled CSS and static HTML; Karma/Jasmine
(`ng test`) unchanged; manual axe / keyboard / screen-reader checks in proxy mode

**Target Platform**: Primo NDE customization package (browser), current evergreen browsers

**Project Type**: Front-end customization package for a hosted web app

**Performance Goals**: Page load increase ≤ 10% (SC-005); theme CSS ≤ 60 KB, fonts ≤ 160 KB,
header + footer ≤ 32 KB

**Constraints**: WCAG 2.2 AA; no third-party requests; redistribution-approved fonts only; light theme only

**Scale/Scope**: All Discover page types in one view (`01USMAI_UMCP:NDE`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Accessibility | Contrast measured for every token pair; inaccessible lib.umd.edu values replaced and recorded (research R3); focus ring ≥3:1; forced colours and reduced motion handled; skip link (007) ships with the header; manual checks in quickstart | Pass |
| II. Privacy | Fonts self-hosted; no CDN, trackers, or new data flows; header/footer static | Pass |
| III. Spec-driven | Spec approved with clarifications; plan traces to FR-001…FR-011 | Pass |
| IV. TDD | Token, contrast, no-third-party, and header/footer contracts are written as failing `node:test` tests before the stylesheet and HTML exist | Pass |
| V. Correctness | Prior header/footer defects (71 broken relative links, 22 dead menu buttons, embedded licensed font) found and fixed, not copied | Pass |
| VI. Simplicity | No new dependencies; one stylesheet; static header without a menu script; Material theming instead of per-selector overrides | Pass |

Post-design re-check (after Phase 1): still Pass. One gap found and planned: `npm test` runs only
`ng test`, so it is extended to also run `node --test tests/`.

## Project Structure

### Documentation (this feature)

```text
specs/001-umd-design-system/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── theme-tokens.md
│   └── header-footer.md
├── reference/tokens.css
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/styles/
│   ├── _customized-theme.scss   # tokens, @font-face, Material theme include, gap overrides
│   └── m3-theme.scss            # regenerated from #E21833 (light)
└── assets/
    ├── fonts/                   # licensed Interstate + OFL Crimson Pro and Barlow Condensed
    └── header-footer/
        ├── header_en.html       # new
        ├── footer_en.html       # new
        └── footer-logo.svg, header-logo.svg   # from prior project (logos only)

tests/
├── theme-tokens.test.js         # new
└── header-footer.test.js        # new

package.json                     # "test": also run node --test tests/
```

**Structure Decision**: Keep the package's existing layout. Styles in the existing theme bundle,
header/footer as the static files NDE already loads, tests beside the existing `tests/*.test.js`.

## Complexity Tracking

No violations to justify.
