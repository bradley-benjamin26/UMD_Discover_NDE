# Research: Homepage Cards

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

## R1. UMD design system icons (FR-002)

- **Source**: `@universityofmaryland/web-icons-library` 2.1.0 (npm, MIT licence, © University of
  Maryland). Icons are inline SVG strings, one per name.
- **Inventory** (all 47): arrows (up, left, right, long); brand (fearless, quote); calendar
  (calendar, clock, calendar_multi_day); communication (email, phone); controls (chevron_down,
  close, close_large, pause, play, fullscreen, print, external_link); files (document);
  indicators (alert, warning, info); location (pin); media (gif); people (person); search
  (search); social (facebook, x, twitter, instagram, youtube, linkedin, threads, bluesky,
  substack).
- **Mapping for the prior five-card draft**:

| Card | UMD icon | Fit |
|---|---|---|
| Library Hours | `clock` | Good |
| Ask Us FAQs | `info` (or `email`) | Good |
| UMD Discover Research Guide | `document` | Good |
| Digital Collections | none suitable (no image/photo icon; `gif` reads as "GIF") | **Gap** |
| Archives | none suitable (no box/archive icon; `document` already used) | **Gap** |

- **Decision**: Use the three good matches. The two gaps go back to the Libraries per FR-002
  (pick another icon from the set, or change the card set). Until they decide, those two cards are
  built without an icon and flagged in the PR; FR-002 forbids other sources, and reusing
  `document` on three cards would make them look alike.
- **Alternatives**: Lucide icons from the prior draft (FR-002 forbids mixing sources); drawing
  new icons (not "from the UMD design system").

## R2. How icons are shipped

- **Decision**: Copy the chosen SVG markup into the homepage HTML inline, not as `<img>` files,
  with `fill`/`stroke` set to `currentColor`, `aria-hidden="true"`, `focusable="false"`, and the
  package's `title` and `id` attributes removed (the same icon twice would duplicate ids). Add the
  MIT notice to `src/assets/homepage/THIRD_PARTY_NOTICES.md`.
- **Rationale**: Inline + `currentColor` lets icon colour come from 001's tokens and follow
  forced-colours mode; no extra requests (FR-008); no npm dependency for a handful of shapes
  (Constitution VI).
- **Alternatives**: Add the npm package and import at build: a dependency for ~3 icons in static
  HTML. `<img src=".svg">`: colour fixed in the file, invisible in some forced-colour themes.

## R3. Card markup (FR-003, FR-005, FR-006)

- **Decision**: One `<ul>` of `<li>`, each containing one `<a href>` that wraps icon, title, and
  description; external cards append the `external_link` icon (decorative) and visually hidden
  text "(external site)". No `role`, no `aria-label` (the link's text is its name, so
  label-in-name holds), no `id`s.
- **Rationale**: Native list announces the count; one link per card = one tab stop; text-derived
  names stay in sync with what is shown.
- **Fixes to the prior/out-of-the-box markup**: links without `href` (not keyboard reachable),
  `role="link"`/`role="listitem"` on native elements, `aria-label` that differs from the visible
  title (e.g. "FAQ" vs. "Ask Us FAQs", a WCAG 2.5.3 failure), the Archives card with no
  destination (spec edge case: not shown).

## R4. Where card styles live

- **Decision**: In 001's theme stylesheet (tokens), section "homepage cards", selectors scoped to
  the homepage's card list class.
- **Unknown, resolved by a spike (first task)**: whether NDE renders the homepage HTML in the main
  document (so the theme stylesheet and tokens apply) or isolated (shadow DOM / frame). The prior
  homepage file linked its own `homepage.css`, which hints at isolation. If isolated: put card
  styles in `src/assets/homepage/homepage.css` and import 001's token block there (one shared
  partial compiled into both, so values still live in one place).

## R5. Layout (US2)

- **Decision**: CSS grid, `repeat(auto-fit, minmax(min(100%, 14rem), 1fr))`, gap `--space-md`;
  one column at 320 px, up to four on wide screens (lib.umd.edu card groups); cards equal height
  by grid stretch.
- Card look from lib.umd.edu: white, `--light-gray` 1px border, title in `--font-heading`,
  description `--darker-gray` `--text-sm`; hover border `--medium-gray` and title underline;
  focus ring on the whole card (`--focus-ring`); no transitions under reduced motion.

## R6. Testing

- **Decision**: Karma/Jasmine spec (existing `ng test`, which already serves `src/assets`) that
  fetches `assets/homepage/homepage_en.html`, parses it with the browser's `DOMParser`, and checks
  the [card contract](./contracts/homepage-cards.md): 3–8 cards, each a single `https://` link
  with title and description, icons hidden, external marker present exactly on off-site links,
  no duplicate ids, no `role`/`aria-label` on cards, other homepage sections byte-identical to the
  template (FR-009). No new dependency. Visual and screen-reader checks in quickstart.
