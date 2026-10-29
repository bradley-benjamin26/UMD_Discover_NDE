# Research: Skip Link Before the UMD Header

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

## R1. Prior solution

`customModule-main/src/app/skip-to-main-menu/`: a standalone component on the `nde-header-before`
hook rendering a visually hidden `<button>` "Skip to page shortcuts" that, when activated,
focused Discover's first skip button (`button.skip-h2-button`). Two steps to reach content.

Problems found:

- Focus outline Maryland yellow on white: 1.45:1 (needs 3:1).
- Styles defined twice: inline `styles` in the component and an unused `.scss` file.
- Depends on Discover's skip button class; if renamed, the skip does nothing.
- `header_en.js` click handler for `#skip-h2-button`: no such element in the header, and scripts
  in the static header don't run anyway. Dead code.
- Test only checks that the component is created.

## R2. Where the skip link lives

- **Decision**: Keep the prior hook, `nde-header-before`: the user's earlier fix proved its output
  comes before the header area. The spike (first task) confirms with 001's new static header in
  place that the hook's element is the first focusable element on every page type.
- **Contingency**: If the static header turns out to render before the hook, move 001's header
  markup into this same component's template (skip link first, then the header). Same markup, one
  component, order guaranteed; 001's header-footer test moves to Karma. Decided by the spike, so
  001 and 007 are built together.
- **Alternatives**: Skip link as the first element of the static header HTML: scripts don't run
  there, and a bare `href="#…"` changes the URL, which Discover's router may react to; focus
  movement for screen readers is unreliable without script. Rejected.

## R3. Target and focus (FR-002, FR-007)

- **Decision**: Target Discover's main content element directly (the `<main>` landmark; exact
  selector recorded by the spike in [contracts/skip-link.md](./contracts/skip-link.md)), not
  Discover's own skip buttons. On activation: if the target is not focusable, give it
  `tabindex="-1"`; call `focus()`; Tab then continues from inside main content.
- **Fallback**: If the target isn't found (page still loading), wait for the next animation frame
  up to ~1 s, then focus it; if still missing, do nothing rather than focus the wrong thing.
- **Rationale**: One activation, no dependency on Discover's skip button class.

## R4. Element and name (FR-003, FR-006)

- **Decision**: `<a class="umd-skip-link" href="#{main id}">Skip to main content</a>` with a click
  handler that prevents the default and moves focus (R3), so the URL is not changed. If the main
  element has no id, the `href` is the page URL without fragment and the handler does all the
  work.
- **Rationale**: Screen-reader users expect a link named "Skip to main content"; the text is the
  accessible name (no ARIA).

## R5. Look (FR-005)

- **Decision**: Visually hidden (clip pattern) until `:focus`; on focus, fixed at top-left above
  everything, `--white` background, `--darker-gray` text (15.5:1), `--focus-ring` (15.5:1),
  `--text-base`, padding `--space-xs`/`--space-sm`. Forced colours: system colours. One stylesheet
  (component styles), no duplicate.
- Replaces the prior yellow ring.

## R6. In-page navigation (FR-008)

- The component lives in the header area, which Discover keeps across route changes, so it stays
  first in tab order. The target is looked up on each activation, not cached, so it is right after
  navigation. The spike confirms the header area is not re-created on navigation; if it is, the
  component is re-created with it, which is equally fine.

## R7. Testing

- Karma/Jasmine, written first: renders one link named "Skip to main content"; hidden until
  focused (computed style), visible on focus; activation focuses a fixture `<main>`; adds
  `tabindex="-1"` only when needed; no URL change; does nothing when no target; no document-level
  listeners left after destroy.
- Manual: first-Tab check on every page type, after navigation, VoiceOver, 320 px / 200%, forced
  colours (quickstart).
