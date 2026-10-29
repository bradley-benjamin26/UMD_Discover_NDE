# Feature Specification: Larger Availability Line in Search Results

**Feature Branch**: `002-results-call-number`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "I want to adjust the display on the search results page so that critical
information such as the call number is more easily visible"

## Clarifications

### Session 2026-10-28

- Q: Which fields besides the call number are "critical"? → A: Only call number, location, and
  availability.
- Q: How are items held in several locations shown? → A: The results list shows one location per
  result, as Discover already does; other locations stay on the full record.
- Prior work (from "Primo NDE Customizations" notes, re-implemented here): call number text
  enlarged from 0.875rem to 1.15rem; "Available now" text enlarged to 1.15rem.
- Q: Keep the divider between the summary and other details (from the same notes)? → A: No,
  removed from scope.
- Q: Add a separate labeled "Call number:" line? → A: No. Only make Discover's existing
  availability line (status, location, and call number) and "Available now" text larger.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read availability, location, and call number at a glance (Priority: P1)

A patron scans the results list and can read each result's availability line, which already holds
the status, the location, and the call number, without squinting or opening the record.

**Why this priority**: It is the whole feature; the call number is in this line today but too
small to notice.

**Independent Test**: Search for a known print title; its availability line, including the call
number in parentheses, is shown at 1.15rem.

**Acceptance Scenarios**:

1. **Given** a result with an availability line, **When** the results list loads, **Then** the
   whole line (status, location, call number) is shown at 1.15rem instead of 0.875rem.
2. **Given** a result with an "Available now" link, **When** the list loads, **Then** that text is
   also 1.15rem.
3. **Given** the patron's browser is set to a larger text size, **When** the list loads, **Then**
   the line grows with it.

---

### Edge Cases

- Long availability lines (long location names and call numbers): wrap without breaking the
  layout at 320 CSS px and 200% zoom.
- Electronic-only and on-order results: whatever Discover shows instead of a call number is
  enlarged the same way; nothing is added.
- Results loaded later (paging, filters, sort): enlarged the same way.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Discover's availability line in each search result MUST be shown at 1.15rem
  (up from 0.875rem).
- **FR-002**: The "Available now" text MUST be shown at 1.15rem.
- **FR-003**: Sizes MUST be relative so they follow the patron's browser text size.
- **FR-004**: Enlarged lines MUST wrap rather than overflow at 320 CSS px and 200% zoom.
- **FR-005**: Content, wording, and behavior of the availability line MUST NOT change; nothing is
  added, hidden, or moved.
- **FR-006**: The change MUST NOT add network requests, scripts, tracking, or data transmission.
- **FR-007**: Colors MUST continue to meet WCAG 2.2 AA contrast at the new size.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a usability check, at least 90% of participants find a print item's call number
  from the results list in under 10 seconds, without opening the record.
- **SC-002**: 100% of availability lines and "Available now" texts on a sampled results page are
  1.15rem.
- **SC-003**: 0 WCAG 2.2 AA violations on the results page; no horizontal scrolling at 320 CSS px.
- **SC-004**: Results page load time unchanged (no added requests).

## Assumptions

- Applies to the search results list in every search scope; the full record page is out of scope.
- The size comes from the 1.15rem type token in feature 001's theme stylesheet; the rules live
  there.
- The call number stays unlabeled, in parentheses at the end of Discover's line, as Discover
  renders it.
