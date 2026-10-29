# Feature Specification: Subject Heading Suggestions

**Feature Branch**: `006-lcsh-subject-suggestions`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "you should find in customModule-main/src/app a subject term feature. I
would like to implement that in this version and potentially improve it"

## Clarifications

### Session 2026-10-28

- Prior work (in the `customModule-main` project, re-implemented here): above the search results,
  a collapsible panel titled "Suggested Library of Congress subjects" lists up to 5 Library of
  Congress Subject Headings (LCSH) related to the patron's search, each with a reason (e.g.
  "Appears in 3 top results", "Narrower topic under …", "Authorized heading for …"). Choosing one
  opens an "Add search term" dialog: Add with AND, Add with OR, or Start new search, plus a link
  to the Libraries' Boolean searching guide.
- Defects found in the prior version, fixed here:
  - Pressing Escape anywhere on the page, even with no suggestion dialog open, reset the page's
    scroll lock, which can break Discover's own dialogs.
  - Words from NOT clauses (terms the patron excluded) were used to suggest subjects.
  - Each search was run a second time in the background to read the top results' subjects,
    doubling search load, even though Discover has already loaded those results.
- Q: Library of Congress lookups vs. Constitution II? → A: Keep the lookups; the constitution was
  amended (v1.1.0) to allow this one disclosed exception.
- Q: Panel collapsed or expanded at first? → A: Collapsed, as in the prior version.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover the right subject heading for a search (Priority: P1)

A patron searches in everyday words (e.g. "climate change farming"). Above the results, a panel
offers official subject headings that describe their topic (e.g. "Crops and climate"), each with a
short reason, so they learn the vocabulary the catalog actually uses.

**Why this priority**: Patrons rarely know subject headings; surfacing them is the feature's core
value.

**Independent Test**: Search a common topic; the panel lists relevant headings with reasons, and
none of them is already in the search.

**Acceptance Scenarios**:

1. **Given** a search of 2 or more characters, **When** results load, **Then** a collapsed panel
   titled "Suggested Library of Congress subjects" appears above the results.
2. **Given** the collapsed panel, **When** the patron opens it, **Then** suggestions are looked up
   and the panel notes that search words are sent to the Library of Congress.
3. **Given** the open panel, **When** suggestions are ready, **Then** up to 5 headings are listed, each
   with its reason.
4. **Given** a heading already used as a subject in the current search, **When** suggestions are
   listed, **Then** it is not suggested again.
5. **Given** no matching headings, **When** suggestions are ready, **Then** the panel says no
   additional subjects were found for the search.

---

### User Story 2 - Add a heading to the search (Priority: P1)

The patron chooses a suggested heading and decides how to use it: narrow the search (AND), widen
it (OR), or start a fresh search on that subject alone.

**Why this priority**: Without acting on a suggestion, the suggestion has little value; the two P1
stories together form the minimum useful feature.

**Independent Test**: Choose a suggestion and each of the three actions in turn; the resulting
search matches the choice.

**Acceptance Scenarios**:

1. **Given** a suggestion, **When** the patron chooses it, **Then** a dialog titled "Add search
   term" opens with focus inside it, showing the heading and the three choices plus the Boolean
   searching guide link.
2. **Given** the dialog, **When** the patron chooses "Add with AND" or "Add with OR", **Then** the
   search reruns with the heading added as a subject term using that operator, keeping the
   existing search.
3. **Given** the dialog, **When** the patron chooses "Start new search", **Then** a search for
   only that subject runs.
4. **Given** the dialog is open, **When** the patron presses Escape, selects Close, or clicks
   outside it, **Then** it closes and focus returns to the suggestion they chose.
5. **Given** the dialog is open, **When** the patron presses Tab repeatedly, **Then** focus stays
   inside the dialog.

---

### User Story 3 - Graceful when the subject service is slow or down (Priority: P2)

If subject suggestions can't be fetched quickly, the patron's search results are unaffected and
the panel says suggestions are unavailable, with a Retry option.

**Why this priority**: Protects the core search experience; the feature is an extra.

**Independent Test**: Make the subject source unavailable; results load normally and the panel
shows the unavailable message with Retry.

**Acceptance Scenarios**:

1. **Given** the subject source does not respond within 3 seconds, **When** suggestions are
   requested, **Then** the panel shows "Subject suggestions are temporarily unavailable" and a
   Retry button, announced to assistive technology.
2. **Given** that state, **When** the patron selects Retry, **Then** suggestions are requested
   again.

---

### Edge Cases

- Search under 2 characters: no panel.
- Search containing NOT clauses: excluded words are never used to find suggestions.
- The patron pages, sorts, or filters without changing the search words: suggestions are not
  fetched again.
- The patron runs several searches quickly: only the latest search's suggestions are shown.
- Escape pressed with no suggestion dialog open: nothing in this feature reacts, and Discover's
  own dialogs keep working.
- Very long headings: wrap within the panel at 320 CSS px and 200% zoom.
- Headings with diacritics or non-Latin scripts: displayed and searched correctly.
- A known-item search (the search matches a title closely): suggestions favor the subjects of the
  matching results rather than individual words of the title.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: For searches of 2 or more characters, the results page MUST show a subject
  suggestions panel above the results, listing up to 5 headings, each with a reason.
- **FR-002**: The panel MUST start collapsed, taking one line until the patron opens it.
- **FR-003**: Suggestions MUST be found by looking up words from the search, and subject headings
  from Discover's top results, in the Library of Congress subject authority (Constitution II
  exception), with at most 12 lookups per search.
- **FR-003a**: Lookups MUST NOT be sent until the patron opens the panel, so patrons who never
  open it send nothing to the Library of Congress.
- **FR-003b**: The open panel MUST tell the patron, in plain words, that their search words are
  sent to the Library of Congress to find subjects.
- **FR-004**: Headings already used as subjects in the current search MUST NOT be suggested.
- **FR-005**: Words from NOT clauses MUST NOT be used to find suggestions.
- **FR-006**: Choosing a suggestion MUST open an "Add search term" dialog offering Add with AND,
  Add with OR, and Start new search, and linking to the Libraries' Boolean searching guide.
- **FR-007**: Add with AND/OR MUST rerun the search with the heading added as a subject term and
  the existing search kept; Start new search MUST run a search for only that subject.
- **FR-008**: The dialog MUST be a modal dialog: focus moves into it on open, Tab stays within it,
  Escape / Close / outside click close it, and focus returns to the chosen suggestion.
- **FR-009**: Closing behavior (Escape, scroll lock) MUST act only while this feature's dialog is
  open and MUST NOT interfere with Discover's own dialogs.
- **FR-010**: The feature MUST NOT run the patron's search a second time; it MUST use results
  Discover has already loaded.
- **FR-011**: Suggestions MUST NOT be fetched again when only the page, sort, or filters change.
- **FR-012**: If suggestions can't be fetched within 3 seconds, the panel MUST show an
  unavailable message with Retry, and the search results MUST be unaffected.
- **FR-013**: Loading, ready, empty, and error states MUST be announced to assistive technology
  without moving focus.
- **FR-014**: All of the feature MUST meet WCAG 2.2 AA and use the UMD brand value set
  (feature 001).
- **FR-015**: The feature MUST NOT send patron identity, session data, or full records to the
  Library of Congress; only search words and subject headings. It MUST NOT store searches beyond
  the current browser session.

### Key Entities

- **Subject suggestion**: An official heading with its label, identifier, how it was found
  (direct match, alternate term, narrower topic, or appears in top results), and a reason shown to
  the patron.
- **Current search**: The patron's search clauses (field, operator, words), including any
  subject clauses already added.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a test set of 20 common topic searches, at least 80% show at least one heading
  that a subject librarian judges relevant.
- **SC-002**: 100% of AND/OR/new-search actions produce the expected search.
- **SC-003**: The search results appear no later than without the feature; suggestions appear
  within 3 seconds or show the unavailable message.
- **SC-004**: The feature adds 0 repeat searches to Discover per patron search.
- **SC-005**: Automated accessibility checks report 0 WCAG 2.2 AA violations, and a keyboard-only
  and screen-reader pass completes stories 1 and 2.
- **SC-006**: Discover's own dialogs open, close, and scroll correctly with the feature installed
  (0 regressions).

## Assumptions

- Looking up only when the panel is opened (FR-003a) is a change from the prior version, which
  looked up every search; it limits what leaves Discover and cuts outside requests.
- The prior version's ranking rules (prefer exact and multi-word matches, skip generic
  subdivisions such as "History" on their own, favor subjects shared by top results for title-like
  searches, add up to 3 narrower topics from the top 2 headings) are kept and covered by tests.
- The Boolean searching guide stays at lib.guides.umd.edu.
- Placement: above the search results, as in the prior version.
- English is the only interface language in scope.
- The prior version's tests are a starting point, but every behavior here gets a failing test
  first (Constitution IV).
