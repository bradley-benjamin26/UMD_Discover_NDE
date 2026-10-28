# Research: UMD Design System for Discover

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

## R1. Where brand styles live

- **Decision**: All brand CSS goes in the existing theme bundle `src/app/styles/_customized-theme.scss`,
  which `angular.json` already compiles to the separate `custom` stylesheet (`inject: false`) that
  NDE loads. Brand values are CSS custom properties defined once at the top of that bundle.
  `src/assets/css/custom.css` stays empty.
- **Rationale**: One compiled file, one source of truth for tokens (FR-003, SC-001), Sass available
  for the Material theme, no new build step. Matches the package's documented theming path
  (README "Creating your own color theme").
- **Alternatives**: Hand-written `assets/css/custom.css` (the prior project's approach): no Sass, no
  Material theme mixins, and values were repeated as literals (e.g. `#ffffff`, `#000000` scattered).
  Two stylesheets: rejected, values drift between them.

## R2. Restyling Discover's buttons, chips, tags, cards

- **Decision**: Generate an Angular Material 3 theme from Maryland red `#E21833`
  (`ng generate @angular/material:m3-theme`, light only, system variables on) into
  `src/app/styles/m3-theme.scss`, and enable it in `_customized-theme.scss` under
  `.custom-nde-theme` as the README describes. Override only what the theme cannot express
  (typography families, focus ring, chip/tag shape) with a small number of rules that use tokens.
- **Rationale**: NDE's controls are Angular Material components; theming them through Material's
  own tokens restyles every instance at once and survives NDE markup changes far better than
  overriding vendor class names (edge case: vendor update degrades to defaults, not broken layout).
- **Alternatives**: Per-selector overrides with `!important` (prior project): fragile, each new NDE
  release can break them, and hard to test. Rejected except for the few gaps above.
- **Dependency**: The view must use the custom theme in Alma's view configuration; noted in
  quickstart.

## R3. Colors and contrast

Measured WCAG contrast for the lib.umd.edu tokens (`reference/tokens.css`):

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| Maryland red `#E21833` | white | 4.76 | Text, links, borders: pass |
| white | Maryland red | 4.76 | Global bar, primary button text: pass |
| dark red `#A90007` | white | 7.81 | Hover/active text: pass |
| medium gray `#757575` | white | 4.61 | Secondary text: pass (barely) |
| medium gray `#757575` | lightest gray `#FAFAFA` | 4.41 | **Fails** for body text |
| Maryland red | lighter gray `#F1F1F1` | 4.21 | **Fails** for body text (lib.umd.edu active tab) |
| Maryland yellow `#FFD200` | white | 1.45 | **Fails** (lib.umd.edu focus ring) |
| Maryland yellow | black | 14.47 | Pass |
| Maryland yellow | Maryland red | 3.28 | Pass for focus ring (3:1) |
| darker gray `#242424` | white | 15.52 | Pass |
| status green `#037623` | white | 5.80 | Pass |
| border gray `#BDBFC8` | white | 1.83 | Decorative only, never sole boundary of a control |

- **Decision**: Focus ring = 3px solid darker gray `#242424` with 2px offset on light surfaces;
  Maryland yellow on dark surfaces (red global bar, black footer). Medium gray text only on white.
  Red text only on white. Control boundaries that must be seen use `#757575` or darker (≥3:1).
- **Rationale**: Every pair used meets FR-006; deviations from lib.umd.edu are recorded here, as the
  spec requires.
- **Alternatives**: Copying lib.umd.edu's yellow ring everywhere: fails 3:1 on white.

## R4. Fonts (FR-007, FR-008)

- **Decision**: Self-host WOFF2, Latin subset, `font-display: swap`, in `src/assets/fonts/` with
  each font's OFL licence file:
  - Headings: **Crimson Pro** 400/600/700 (as lib.umd.edu).
  - Display/labels: **Barlow Condensed** 600/700 italic (as lib.umd.edu).
  - Body (Interstate substitute): **Barlow** 400/600/700. Interstate is a highway-signage grotesque;
    Barlow is drawn from the same highway-sign tradition and is Barlow Condensed's own family, so
    body and labels match. Fallback: Helvetica, Arial, sans-serif.
- **Rationale**: Free licences, zero third-party requests, `swap` gives no invisible text
  (edge case: font fails to load).
- **Alternatives**: Overpass (Highway Gothic based): close, but a separate family from Barlow
  Condensed. Source Sans Pro: what the lib.umd.edu error page uses, but further from Interstate.
  Google Fonts CDN: third-party request, violates Constitution II.
- **Budget**: about 8 files × ~20 KB ≈ 160 KB, loaded once and cached. Only weights actually used are
  shipped.

## R5. Header (FR-001)

Findings in the prior project's header (`customModule-main/src/assets/header-footer/header_en.html`,
copied from the lib.umd.edu Drupal page):

- 61 of its links are site-relative (`href="/find"`), so on the Primo host they point to
  `usmai-umcp.primo.exlibrisgroup.com/find`: broken.
- 22 menu buttons (`aria-expanded`, submenus) depend on a script that was commented out, so none of
  them work: announced as menu controls but do nothing (WCAG 4.1.2 failure).
- It loaded `drupal_theme.css`, which references licensed Interstate.

- **Decision**: A new, hand-written static header in `src/assets/header-footer/header_en.html`:
  the red UMD global bar ("University of Maryland" → umd.edu), the Libraries logo
  (→ www.lib.umd.edu), and the lib.umd.edu top-level navigation as plain absolute links that wrap
  on narrow screens. No submenus and no buttons, so nothing needs a script.
- **Rationale**: Static HTML is the mechanism the prior project proved NDE loads. Plain links are
  accessible with no script, work at 320 px, and match the look of the header at rest (submenus
  are hidden until opened on lib.umd.edu anyway). Smallest thing that meets FR-001.
- **Alternatives**: Full mega-menu as an Angular component at a header hook: matches more closely,
  but adds interactive code, focus management, and tests for a menu that duplicates lib.umd.edu's
  navigation. Rejected for v1; can be a later spec if needed.
- **Skip link**: Spec 007 puts "Skip to main content" before this header; it ships with this
  feature.

## R6. Footer (FR-002)

- **Decision**: Static `src/assets/header-footer/footer_en.html`: Libraries name and address,
  library list, information, services, and social links as in the prior footer, with all links
  absolute, black background, white text, yellow focus ring. No embedded fonts.
- **Rationale**: The prior footer's content is right (seen in the PDF), but its 777 KB stylesheet
  embeds licensed Interstate and it has 10 site-relative links. A clean rewrite is smaller than
  cleaning it.

## R7. Testing (Constitution IV)

- **Decision**:
  - `node:test` tests in `tests/` (the repo's existing pattern, no new dependency) for:
    token set completeness; every colour literal in the compiled `custom` stylesheet is a token
    (SC-001); WCAG contrast of every declared foreground/background pair (FR-006); fonts are local
    and OFL-licensed, no third-party URLs anywhere in the bundle or header/footer (SC-004); header
    and footer HTML have only absolute `https://` links, alt text on images, no buttons without
    scripts, landmark elements present.
  - `ng test` (Karma/Jasmine, existing) only if an Angular component is added (not planned here).
  - Page-level checks (axe browser extension, keyboard, screen reader, 320 px, 200% zoom,
    forced colours) run manually through proxy mode, recorded in quickstart.
- **Rationale**: Every testable rule gets a failing test first; the rest has a written manual
  check. No Playwright/axe dependency added (Constitution VI); revisit if manual checks prove
  unreliable.
- **Gap**: `npm test` runs only `ng test`. Add `node --test tests/` to the test script so both run.

## R8. Performance (SC-005)

- **Decision**: Budget: theme stylesheet ≤ 60 KB uncompressed, fonts ≤ 160 KB, header + footer
  HTML ≤ 20 KB, no images except the logo SVG. Measured before/after with the browser's network
  panel in proxy mode.
