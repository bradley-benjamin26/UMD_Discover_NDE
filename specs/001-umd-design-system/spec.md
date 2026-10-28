# Feature Specification: UMD Design System for Discover

**Feature Branch**: `001-umd-design-system`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "implement University of Maryland design system by matching the University
of Maryland Libraries (lib.umd.edu) implementation of the design systems. Create chips or what-have-you
to control styling etc."

## Clarifications

### Session 2026-10-28

- Q: What does "chips or what-have-you to control styling" mean? → A: Restyle Discover's existing
  chips, buttons, tags, and cards to match UMD. No staff style kit and no patron-facing controls.
- Q: Which pages are in scope? → A: All Discover pages, including My Library/account and
  collections.
- Q: Which typefaces? → A: Free (openly licensed) fonts only, packaged with Discover. lib.umd.edu
  uses Interstate (licensed, so excluded), Crimson Pro, and Barlow Condensed (both free).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover looks like part of UMD Libraries (Priority: P1)

A patron who moves from lib.umd.edu into UMD Discover (Primo NDE) sees the same brand: the red UMD
global bar, the Libraries logo, the same typefaces, colors, link and button styles. The move between
the two sites feels like one website rather than a vendor product.

**Why this priority**: Brand consistency is the core value of the feature; the controls in story 2
build on the shared colors and type defined here.

**Independent Test**: Load each Discover page type side by side with lib.umd.edu; compare header,
footer, colors, typography, and links against the reference capture.

**Acceptance Scenarios**:

1. **Given** a patron opens any Discover page, **When** the page loads, **Then** a UMD global bar
   (Maryland red background, "University of Maryland" link to umd.edu) and the UMD Libraries logo
   (linking to lib.umd.edu) appear at the top.
2. **Given** any Discover page, **When** body text, headings, and links render, **Then** they use
   the typefaces, sizes, and colors recorded in the reference capture.
3. **Given** any Discover page, **When** the patron reaches the bottom, **Then** a footer matching
   the lib.umd.edu footer content and style appears.

---

### User Story 2 - Discover's controls look and behave like UMD's (Priority: P2)

A patron searching, filtering, and managing their account sees Discover's existing controls
restyled to the UMD look: primary and secondary buttons, filter chips (applied facets), tags and
labels (e.g. availability, resource type), and result cards. Each control looks the same
everywhere it appears. No new controls are added.

**Why this priority**: Controls are where patrons spend their time; unbranded vendor controls next
to a branded header look inconsistent.

**Independent Test**: Run a search, apply two facets, open a record, and open My Library; every
button, chip, tag, and card matches the reference in default, hover, focus, active, and disabled
states.

**Acceptance Scenarios**:

1. **Given** a search with applied facets, **When** results render, **Then** each applied facet
   shows as a UMD-styled chip whose remove control stays keyboard-operable and has an accessible
   name (e.g. "Remove filter: Books").
2. **Given** any button or chip, **When** it receives keyboard focus, **Then** a visible focus
   indicator with at least 3:1 contrast against its background appears and is not hidden by other
   content.
3. **Given** a result with availability or resource-type labels, **When** it renders, **Then** the
   labels use the UMD tag style and convey meaning by text, not color alone.

---

### Edge Cases

- A brand font fails to load: text falls back to a similar system font with no invisible text and
  no layout break.
- A Discover vendor update changes its own markup: UMD styling degrades to Discover defaults rather
  than breaking layout or hiding content.
- Very long facet values in chips: text wraps or truncates, and the full value stays available to
  assistive technology and on focus/hover.
- 200% text zoom and 320 CSS px width: header, footer, chips, and buttons reflow with no horizontal
  scroll and no overlap.
- Windows High Contrast / forced-colors mode: chips, buttons, and focus indicators remain visible.
- A patron's system prefers reduced motion: no animated transitions on controls.
- A reference color fails contrast for a given use: lib.umd.edu's Maryland yellow focus outline
  (`#FFD200`) is about 1.4:1 on white, below the 3:1 minimum. Where a color fails, an accessible
  variant is used and the deviation is recorded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Discover MUST display a UMD global bar and UMD Libraries header matching the
  reference capture on every page.
- **FR-002**: Discover MUST display a footer matching the lib.umd.edu footer content and style on
  every page.
- **FR-003**: Discover MUST use one shared set of brand values (colors, typefaces, type scale,
  spacing, corner radius, focus style) taken from the reference capture. Every styled element MUST
  draw from that set rather than repeating literal values.
- **FR-004**: Discover's existing primary buttons, secondary buttons, links, chips, tags, and cards
  MUST each be restyled to one UMD style with defined default, hover, focus, active, and disabled
  states.
- **FR-005**: Restyled applied-facet chips MUST stay removable by mouse, touch, and keyboard, and
  each remove control MUST keep an accessible name stating which filter it removes.
- **FR-006**: All styling MUST meet WCAG 2.2 AA: text contrast 4.5:1 (3:1 large), UI component and
  focus indicator contrast 3:1, targets at least 24×24 CSS px, reflow at 320 CSS px, usable at
  200% zoom, and visible in forced-colors mode.
- **FR-007**: Fonts MUST be openly licensed and served from the Discover customization package
  itself. No requests to third-party font or style services are allowed (Constitution II).
- **FR-008**: Headings MUST use Crimson Pro and display/label text MUST use Barlow Condensed, as on
  lib.umd.edu. Body text MUST use a free substitute for Interstate chosen to match its proportions,
  with a Helvetica/Arial/sans-serif fallback.
- **FR-009**: The feature MUST NOT add tracking, analytics, or any new transmission of patron data.
- **FR-010**: Styling MUST NOT hide, reorder, or remove Discover content or functionality.
- **FR-011**: The styling MUST cover all Discover pages: home, search results, full record,
  My Library/account, collections, and any other page in the view.

### Key Entities

- **Brand value set**: The named colors, typefaces, type sizes, spacing steps, radii, and focus
  style taken from lib.umd.edu; the single source every style draws from.
- **Component style**: The UMD look for one existing Discover control (button, chip, tag, card),
  including its states, built only from the brand value set.
- **Reference capture**: The lib.umd.edu files and screenshots recorded on 2026-10-28, used as the
  standard for "matching".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of colors, typefaces, and type sizes used on Discover pages come from the brand
  value set (no stray values).
- **SC-002**: In a side-by-side review against the reference capture, reviewers judge the header,
  footer, typography, buttons, chips, tags, and cards as matching on every page type.
- **SC-003**: Automated accessibility checks report 0 WCAG 2.2 AA violations on every page type,
  and a manual keyboard and screen-reader pass completes every primary task (search, filter,
  remove filter, open record, view My Library).
- **SC-004**: 0 network requests to third-party domains are added by the feature.
- **SC-005**: Page load time increases by no more than 10% over the current Discover baseline.

## Assumptions

- "Matching lib.umd.edu" means visual consistency with the site as captured on 2026-10-28; it does
  not follow later changes automatically.
- lib.umd.edu blocks automated retrieval. The reference capture is the set of CSS/JS files saved
  from browser dev tools on 2026-10-28; the color and spacing tokens are copied into
  `reference/tokens.css`. Key values: Maryland red `#E21833`, Maryland yellow `#FFD200`, dark red
  `#A90007`, a gray scale from `#FAFAFA` to `#242424`, status green `#037623`, and spacing steps of
  8/16/24/32/48/64/120 px.
- The saved `fonts.css` embeds licensed Interstate font data and MUST NOT be copied into this
  repository.
- lib.umd.edu defines a dark theme. Discover gets the light theme only; dark theme is out of scope.
- Where the reference conflicts with WCAG 2.2 AA, accessibility wins (Constitution I).
- English is the only interface language in scope.
- Discover's layout, search behavior, and data are unchanged; only presentation, header, and footer
  are customized.
- The UMD Libraries logo and UMD marks may be used on Discover as an official UMD Libraries site.
