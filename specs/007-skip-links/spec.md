# Feature Specification: Skip Links Before the UMD Header

**Feature Branch**: `007-skip-links`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "Accessibility features. When I first worked on the interface, using the
hook and adding the header meant that the skip content keyboard control was after the header. Need
to find a way to fix this. My solution at a time was a skip for the header that skipped to the
other skip content option"

## Clarifications

### Session 2026-10-28

- Problem: adding the UMD header (feature 001) places it before Discover's own skip links, so a
  keyboard or screen-reader user must Tab through every header link before reaching "skip to
  content". That defeats the purpose of a skip link (WCAG 2.4.1 Bypass Blocks).
- Prior work (in `customModule-main`, re-implemented and improved here): a hidden "Skip to page
  shortcuts" button placed before the header, shown on focus, that moved focus to Discover's own
  skip links. Reaching main content took two steps: activate the first skip, then a second one.
- Defects found in the prior version, fixed here:
  - Its focus outline was Maryland yellow on white, about 1.4:1 contrast, below the 3:1 minimum.
  - The header script's skip handler looked for an element that the header does not contain, so
    it never ran.
- Q: Which skip options go before the header? → A: One "Skip to main content" link that goes
  straight there. Discover's own skip links stay where they are and are not required.
- Q: Scope? → A: Skip links only. Broader accessibility work will come from an accessibility
  audit, with each finding addressed in its own spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Skip the header with the first keystroke (Priority: P1)

A keyboard user lands on any Discover page and presses Tab once. A visible skip control appears at
the top of the page, before the UMD header. Activating it takes them straight to the page's main
content.

**Why this priority**: This is the defect being fixed; without it, every page forces keyboard users
through the whole header.

**Independent Test**: On each page type, load the page, press Tab once, then Enter; focus lands on
the main content.

**Acceptance Scenarios**:

1. **Given** any Discover page just loaded, **When** the patron presses Tab once, **Then** the
   first focused element is a skip control placed before the UMD header, visible while focused.
2. **Given** that control is focused, **When** the patron presses Enter, **Then** focus moves
   directly to the start of the main content in one step, and the next Tab continues from there.
3. **Given** a screen-reader user, **When** they reach the control, **Then** its name says where it
   goes (e.g. "Skip to main content").
4. **Given** the control is not focused, **When** the page is viewed, **Then** it is not visible
   and takes no space.

---

### Edge Cases

- Discover changes or renames its own skip links: the skip control still reaches main content, and
  an automated test fails to alert maintainers.
- Page content is still loading when the skip is used: focus lands on the main content area once it
  exists, never on nothing.
- Navigation between pages without a full reload: after each page change, the first Tab from the
  top of the page again reaches the skip control first.
- Mouse or touch users: never see the control unless they use the keyboard.
- 200% zoom and 320 CSS px wide: the visible control fits on screen and does not cover the focused
  destination.
- Forced-colors mode: the control and its focus indicator remain visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On every Discover page, the first focusable element MUST be a skip control placed
  before the UMD header.
- **FR-002**: "Skip to main content" MUST move focus to the start of the main content in one
  activation.
- **FR-003**: Exactly one skip control, "Skip to main content", MUST appear before the header.
- **FR-004**: Discover's own skip links MUST keep working where they are, and reaching main
  content MUST NOT require them.
- **FR-005**: Skip controls MUST be hidden until focused and fully visible when focused, with a
  focus indicator of at least 3:1 contrast against its background and text contrast of 4.5:1.
- **FR-006**: Each skip control's accessible name MUST state its destination.
- **FR-007**: After moving focus, the next Tab MUST continue from the destination, not from the top
  of the page.
- **FR-008**: The behavior MUST hold after in-page navigation (searching, paging, opening a
  record) without a full reload.
- **FR-009**: The feature MUST NOT add network requests, tracking, or data transmission.

### Key Entities

- **Skip control**: The "Skip to main content" link at the top of the page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On 100% of page types, a keyboard user reaches main content in 2 keystrokes (Tab,
  Enter) from page load.
- **SC-002**: 0 header links are focused before the skip control on any page type.
- **SC-003**: Automated accessibility checks report 0 violations for bypass blocks, focus
  visibility, and contrast on every page type; a screen-reader pass confirms the control's name
  and destination.
- **SC-004**: Skip behavior is still correct after 5 consecutive in-page navigations.

## Assumptions

- The UMD header comes from feature 001 and sits before Discover's own content; this feature
  depends on 001 and must ship with or before it.
- "Main content" is the region Discover marks as its main content on each page.
- The control styling uses the UMD brand value set (feature 001) with an accessible focus color.
- English is the only interface language in scope.
