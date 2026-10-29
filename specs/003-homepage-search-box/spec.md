# Feature Specification: Homepage Search Box

**Feature Branch**: `003-homepage-search-box`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "homepage search box"

## Clarifications

### Session 2026-10-28

- Prior work (from "Primo NDE Customizations" notes, re-implemented here): goal is to display the
  Discover homepage search box like the lib.umd.edu homepage and keep it readable; styling and the
  background image's scale were still unfinished. The prior "After" design: a white, rounded panel
  over a campus photo, holding a large "UMD Discover" heading, the scope selector, a rounded input
  with a Maryland-red border and voice/search icons, and the "Ask Anything" and "Advanced Search"
  links below it.
- Q: Include lib.umd.edu extras (quick-action links, Discover/Search All tabs)? → A: No. Only
  Discover's own search box, restyled.
- Q: Which background photo? → A: A new photo supplied by the Libraries.
  Update: the photo is the McKeldin Library campus photo from the prior project
  (`customModule-main/src/assets/homepage/homepage_background.svg`). That file is a 1920×1080
  JPEG wrapped in an SVG (740 KB); the photo itself is 555 KB.
- Prior heading style (from the prior project's CSS): "UMD Discover" in Barlow Condensed, bold
  italic, uppercase, with wide letter spacing.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a search from a familiar, readable search box (Priority: P1)

A patron arriving at the Discover homepage sees a large search box laid out like the lib.umd.edu
homepage search: a white search panel over a full-width photo, a "UMD Discover" heading, the scope
selector, a bold input with a visible search button, and Discover's "Ask Anything" and "Advanced
Search" links. They type a query, press Enter or the button, and get results.

**Why this priority**: The homepage search is the first thing every patron uses; matching
lib.umd.edu makes the move from the Libraries site feel seamless.

**Independent Test**: Open the Discover homepage beside lib.umd.edu; the search panel layout,
type, and colors match the reference, and a search from it returns the same results as Discover's
standard search.

**Acceptance Scenarios**:

1. **Given** the Discover homepage, **When** it loads, **Then** the search panel appears over a
   full-width background photo with a visible label, input, and search button, styled from the
   UMD brand value set (feature 001).
2. **Given** a query typed in the box, **When** the patron presses Enter or activates the search
   button, **Then** Discover's standard search runs with that query and the selected search scope.
3. **Given** a keyboard-only patron, **When** they tab to the input, scope selector, and button,
   **Then** each shows a visible focus indicator with at least 3:1 contrast.
4. **Given** a screen-reader user, **When** they reach the search box, **Then** the input has an
   accessible name (e.g. "Search Discover") and the button has one (e.g. "Search").

---

### User Story 2 - Readable on any screen (Priority: P2)

A patron on a phone, or with enlarged text, can read and use the search box without the photo
making text hard to read or the panel overflowing.

**Why this priority**: Readability was an explicit goal of the prior work; a photo behind text is
the most common cause of contrast failures.

**Independent Test**: View the homepage at 320 CSS px wide, at 200% zoom, and in forced-colors
mode; the panel stays readable and usable in each.

**Acceptance Scenarios**:

1. **Given** a narrow screen (320 CSS px), **When** the homepage loads, **Then** the search panel
   spans the width with no horizontal scrolling, and the photo is cropped rather than squashed.
2. **Given** any screen size, **When** the panel sits over the photo, **Then** all text and
   controls in the panel meet contrast minimums against the panel itself, not the photo.
3. **Given** the photo fails to load, **When** the homepage renders, **Then** the panel is shown on
   a solid brand background and search still works.

---

### Edge Cases

- Empty query submitted: Discover's standard behavior for an empty search applies; no error is
  added by this feature.
- Very long query: the input scrolls its text; the layout does not grow or break.
- The photo is decorative and has no credit line (it belongs to the Libraries, as on the
  lib.umd.edu homepage).
- Reduced-motion preference: no animated transitions on the panel or image.
- lib.umd.edu removes focus outlines from its search input; Discover MUST NOT copy that.
- Discover autocomplete/suggestions: keep Discover's own suggestions working and readable inside
  the restyled box.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Discover homepage MUST show a search panel laid out like the lib.umd.edu
  homepage search (white panel over a full-width photo, panel up to about 50rem wide on large
  screens, input with a dark bottom rule, prominent search button).
- **FR-002**: The panel MUST use Discover's own search box, so search behavior, scopes, and
  suggestions are unchanged.
- **FR-003**: The panel MUST contain only Discover's own search elements: a "UMD Discover" heading,
  scope selector, query input, search button, and the "Ask Anything" and "Advanced Search" links.
  No quick-action links or tabs from lib.umd.edu are added.
- **FR-004**: The background photo MUST be the McKeldin Library campus photo supplied by the
  Libraries, with no credit line, served from the Discover customization package as a plain
  photo file (not wrapped in another format), in sizes matched to the screen so phones do not
  download the full-size image.
- **FR-005**: The photo MUST be scaled to cover the hero area at every width without distortion,
  and sized for fast loading.
- **FR-006**: The input and button MUST have accessible names, visible labels or equivalent, and
  visible focus indicators with at least 3:1 contrast.
- **FR-007**: All panel text and controls MUST meet WCAG 2.2 AA contrast against the panel
  background, with targets at least 24×24 CSS px, reflow at 320 CSS px, and use at 200% zoom.
- **FR-008**: The feature MUST NOT add tracking, analytics, third-party requests, or new
  transmission of patron data; the query goes only to Discover's own search.
- **FR-009**: Styling MUST come from the UMD brand value set (feature 001).

### Key Entities

- **Search panel**: The homepage box holding the label, query input, scope selector, and search
  button.
- **Hero image**: The decorative background photo behind the panel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a side-by-side review with lib.umd.edu, reviewers judge the Discover homepage
  search panel as matching in layout, type, and color.
- **SC-002**: 100% of searches started from the homepage panel return the same results as the same
  query in Discover's standard search.
- **SC-003**: Automated accessibility checks report 0 WCAG 2.2 AA violations on the homepage, and a
  keyboard-only and screen-reader pass completes a search.
- **SC-004**: The homepage becomes usable (search box ready for typing) in no more time than the
  current homepage, measured on a mid-range phone.
- **SC-005**: 0 third-party network requests are added.

## Assumptions

- Reference capture: the lib.umd.edu files saved on 2026-10-28 (`hero-search` styles and script)
  define the target layout: white panel (1rem padding on small screens, 1.5rem/3rem and 50rem wide
  from 896px), 3.5rem-tall input with a 1px dark bottom rule, photo covering the hero.
- The Discover homepage HTML template in this package is the place the panel lives; the existing
  template is still the out-of-the-box version.
- The photo file is in hand and is owned by the Libraries; no credit line is needed.
- Depends on feature 001 for brand values; until 001 ships, Discover defaults are used.
- English is the only interface language in scope.
