# Feature Specification: WorldCat ILL Request Label

**Feature Branch**: `005-worldcat-ill-label`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "WorldCat ILL request label"

## Clarifications

### Session 2026-10-28

- Prior work (from "Primo NDE Customizations" notes, re-implemented here): goal is to give
  Interlibrary Loan (ILL) visibility and tell patrons how they can get an item. For results whose
  record source is WorldCat, the availability link "See Request Options" was relabeled "Request
  from Interlibrary Loan". The record source was turned on for the results list in the Discover
  view settings so it could be detected, then hidden from view.
- Defect found in the prior version, fixed here: it relabeled every "See Request Options" link on
  the page as soon as any one result came from WorldCat, so non-WorldCat results on the same page
  were mislabeled.
- Q: Link or button styling? → A: A link styled like the other availability links, as before.
- Q: Results list only, or also the full record? → A: Results list only, for now; the full record
  may be added later.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Know that a WorldCat item comes through ILL (Priority: P1)

A patron searching beyond UMD's collections sees a result from WorldCat. Instead of the vague
"See Request Options", the result says "Request from Interlibrary Loan", so they know UMD doesn't
own the item and can still get it through ILL.

**Why this priority**: This is the whole feature: a clear, honest label for how to get the item.

**Independent Test**: Run a search that returns both UMD-held and WorldCat results on one page;
only the WorldCat results say "Request from Interlibrary Loan".

**Acceptance Scenarios**:

1. **Given** a result whose record source is WorldCat and whose availability link says "See
   Request Options", **When** the results list loads, **Then** the link reads "Request from
   Interlibrary Loan".
2. **Given** a result from any other source on the same page, **When** the list loads, **Then** its
   link keeps its original text.
3. **Given** the relabeled link, **When** a patron activates it, **Then** it goes to the same
   destination as before; only the label changes.
4. **Given** a screen-reader user on a relabeled link, **When** they reach it, **Then** it is
   announced as "Request from Interlibrary Loan", never the old text.

---

### User Story 2 - Labels stay correct as results change (Priority: P2)

A patron pages through results, changes filters, or switches scope. Every newly shown WorldCat
result is relabeled, and no other result is.

**Why this priority**: Results load and reload without a full page refresh; a label that only
works on first load would be inconsistent.

**Independent Test**: Load results, go to page 2, apply a filter, and return; each view shows the
correct label on every result.

**Acceptance Scenarios**:

1. **Given** the patron moves to the next page of results, **When** new results appear, **Then**
   WorldCat results are relabeled and others are not.
2. **Given** a result's availability is still loading, **When** it finishes, **Then** the correct
   label appears without the patron seeing the old text flash and change.

---

### Edge Cases

- A result has several sources, one of which is WorldCat: not relabeled, because another source
  may mean UMD holds it. Only results whose sole source is WorldCat are relabeled.
- A WorldCat result whose availability says something other than "See Request Options" (e.g.
  online access): left unchanged.
- The Discover interface language is not English: not relabeled (English only for now).
- The record source line is hidden from view but still available to the relabeling; if Discover
  stops providing it, results fall back to the original "See Request Options" label (never a
  wrong label).
- Ex Libris changes the wording "See Request Options": nothing is relabeled, and an automated test
  fails to alert maintainers.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: For each result whose record source is WorldCat, the availability link text "See
  Request Options" MUST read "Request from Interlibrary Loan".
- **FR-002**: The decision MUST be made per result, from that result's own source; one WorldCat
  result MUST NOT change the label of any other result.
- **FR-003**: Results from any source other than WorldCat MUST keep Discover's original label.
- **FR-004**: The link destination and behavior MUST NOT change; only its visible text and
  accessible name.
- **FR-005**: The accessible name of the relabeled link MUST match its visible text (WCAG 2.5.3
  Label in Name).
- **FR-006**: The relabeling MUST apply to every result shown, including after paging, filtering,
  sorting, or changing scope, and MUST appear without a visible flash of the old label.
- **FR-007**: The record source line MUST stay hidden from patrons in the results list, as in the
  prior version.
- **FR-008**: The relabeled link MUST keep the same styling as other availability links.
- **FR-009**: The relabeling MUST apply on the search results list only; the full record page is
  unchanged.
- **FR-010**: The feature MUST NOT add network requests, tracking, or new transmission of patron
  data; it uses only information already on the page.
- **FR-011**: The feature MUST NOT noticeably slow the results page (see SC-004).

### Key Entities

- **Result**: One search result; has a record source (e.g. WorldCat, UMD catalog) and an
  availability link with a label and destination.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a test page mixing WorldCat and non-WorldCat results, 100% of WorldCat results
  with "See Request Options" are relabeled and 0% of other results are.
- **SC-002**: Labels remain 100% correct across 5 consecutive page/filter/sort changes.
- **SC-003**: Screen-reader and automated accessibility checks report the relabeled link's name
  as "Request from Interlibrary Loan" with 0 WCAG 2.2 AA violations.
- **SC-004**: Results page load and paging time increases by no more than 2%.
- **SC-005**: 0 network requests are added.

## Assumptions

- The record source is already configured to show on the results list in the Discover view
  settings (done in the prior work); that setting is a Discover configuration step outside this
  package and must stay on.
- WorldCat results are identified by the record source text "WorldCat".
- The ILL request flow behind "See Request Options" already works; this feature only changes its
  label.
- English is the only interface language in scope.
- The prior issue "filters return incorrect result counts (e.g. -2) with WorldCat" is a separate
  problem, not caused or fixed by this feature; it is tracked separately.
