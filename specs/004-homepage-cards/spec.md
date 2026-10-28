# Feature Specification: Homepage Cards

**Feature Branch**: `004-homepage-cards`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "homepage cards"

## Clarifications

### Session 2026-10-28

- Prior work (from "Primo NDE Customizations" notes, re-implemented here): the homepage button
  cards gained descriptions and icons from the same source as the Libraries website; styling was
  still unfinished. The prior draft had five cards: Library Hours, Ask Us FAQs, Digital
  Collections ("Find unique digitized materials."), UMD Discover Research Guide, and Archives
  ("Find unique, historic materials."), with icons in mixed styles.
- Prior draft links (from the prior project's homepage template): Library Hours →
  umd.libcal.com/hours; Ask Us FAQs → umd.libanswers.com; Digital Collections →
  digital.lib.umd.edu; UMD Discover Research Guide → lib.guides.umd.edu/umd-discover; Archives →
  no link yet. Three draft icons (archive, digital collections, graduation cap) came from the
  Lucide icon set, not the UMD design system.
- Q: Which cards? → A: Not decided yet. The Libraries choose the final set; the prior draft is the
  starting point.
- Q: Icon source? → A: The UMD design system, for every card.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pick a service from clear, described cards (Priority: P1)

A patron on the Discover homepage sees a row of cards for common services. Each card has an icon,
a title, and a one-line description saying what it does, so the patron can choose without
guessing. Selecting a card takes them to that service.

**Why this priority**: Today's out-of-the-box cards have titles only and no destinations; cards
that work and explain themselves are the core value.

**Independent Test**: Open the homepage; every card shows an icon, title, and description, and
activating each card opens its destination.

**Acceptance Scenarios**:

1. **Given** the Discover homepage, **When** it loads, **Then** each card shows an icon, a title,
   and a short description.
2. **Given** a card, **When** the patron clicks or taps anywhere on it, or focuses it and presses
   Enter, **Then** the card's destination opens.
3. **Given** a card that leads off Discover (e.g. to lib.umd.edu), **When** it renders, **Then** it
   shows an external-link arrow as lib.umd.edu cards do, and its accessible name says it leads to
   another site.
4. **Given** a screen-reader user, **When** they reach the cards, **Then** they hear a list with
   the number of cards, and each card is announced once as a link with its title and description
   (icons are not announced).

---

### User Story 2 - Cards look like lib.umd.edu cards (Priority: P2)

The cards match the lib.umd.edu card style (layout, type, colors, hover and focus treatment) and
lay out in a responsive grid.

**Why this priority**: Brand consistency; the cards work without it, but look out of place.

**Independent Test**: Compare the homepage cards with cards on lib.umd.edu at desktop and phone
widths; style and grid behavior match the reference capture.

**Acceptance Scenarios**:

1. **Given** a wide screen, **When** the homepage loads, **Then** cards sit in a grid of up to four
   columns; on narrow screens they stack in one column.
2. **Given** a card, **When** hovered or focused, **Then** it shows the lib.umd.edu hover treatment
   and a visible focus indicator with at least 3:1 contrast.

---

### Edge Cases

- Description longer than one line: wraps, and all cards in a row keep equal height.
- An icon fails to load: the card still shows its title and description with no broken-image
  marker.
- 320 CSS px wide and 200% zoom: cards stack with no horizontal scrolling or clipped text.
- Forced-colors mode: card borders, icons, and focus indicators remain visible.
- A destination URL is missing: the card is not shown rather than shown as a dead link.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST show the card set chosen by the Libraries (3 to 8 cards), each with
  a title, a one-line description, and a destination. The card set is content, and can change
  without changing the card design.
- **FR-002**: Every card icon MUST come from the UMD design system, in one consistent style. If the
  set has no suitable icon for a card, the Libraries pick a different icon from the same set;
  icons from other sources MUST NOT be mixed in.
- **FR-003**: The whole card MUST be a single link target (one tab stop per card), at least 24×24
  CSS px, with a link name made of the title and description.
- **FR-004**: Icons MUST be decorative (hidden from assistive technology); meaning comes from the
  text.
- **FR-005**: Cards that lead off Discover MUST show an external-link arrow and say so in their
  accessible name; cards within Discover MUST NOT.
- **FR-006**: Cards MUST be presented as a list so assistive technology announces the count.
- **FR-007**: Card styling MUST match the lib.umd.edu card reference and come from the UMD brand
  value set (feature 001), meeting WCAG 2.2 AA contrast, reflow, zoom, and forced-colors
  requirements.
- **FR-008**: Icons MUST be served from the Discover customization package; no third-party
  requests, tracking, or new transmission of patron data.
- **FR-009**: The rest of the homepage (welcome, announcements, about sections) MUST be left
  unchanged by this feature.

### Key Entities

- **Card**: One homepage service shortcut; has a title, a one-line description, an icon, a
  destination, and whether the destination is external.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of cards have a working destination (0 dead or empty links).
- **SC-002**: In a 5-person check, each person correctly says what every card does from its
  description before opening it.
- **SC-003**: Automated accessibility checks report 0 WCAG 2.2 AA violations on the cards, and a
  keyboard-only pass reaches and opens every card with one tab stop each.
- **SC-004**: In a side-by-side review with lib.umd.edu, reviewers judge the card style as
  matching.
- **SC-005**: 0 third-party network requests are added.

## Assumptions

- The final card list (titles, descriptions, links) is supplied by the Libraries before
  implementation is accepted; the design and tests are built using the prior five-card draft.
- The UMD design system's icon set includes icons suitable for common library services; this is
  checked during planning.
- The cards live in the Discover homepage template in this package; the current template is the
  out-of-the-box version.
- The out-of-the-box cards have accessibility defects that this feature fixes rather than copies:
  links with no destination (not reachable by keyboard), redundant role/label attributes, and
  generic "Library image" alt text on decorative icons.
- Reference capture: lib.umd.edu card styles saved on 2026-10-28 (2/3/4-column card groups,
  external-link arrow on off-site card links).
- Card content (titles, descriptions, links) is English only and edited by changing the template.
- Depends on feature 001 for brand values; until 001 ships, Discover defaults are used.
