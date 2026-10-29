# Research: Larger Availability Line in Search Results

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

## R1. How to enlarge the line

- **Decision**: Two CSS rules in feature 001's theme stylesheet, using the 1.15rem type token
  (`--text-lg`), on the selectors the prior work proved:
  `.available-at-button .mdc-button__label` (availability line) and `.quicklink-button`
  ("Available now").
- **Rationale**: Smallest change that meets the spec; no component, no script, no new data.
- **Alternatives**: A component adding a labeled call number line (dropped by clarification).

## R2. Wrapping

- **Decision**: Also allow the availability label to wrap (`white-space: normal`) so a longer line
  at 1.15rem doesn't overflow its button at 320 px.
- **Rationale**: Material button labels default to one line; at a larger size long locations would
  be clipped (FR-004). To be confirmed in proxy mode; drop the rule if Discover already wraps.

## R3. Risk

- These are Discover class names, not a documented hook; an Ex Libris update can rename them, and
  the line would fall back to Discover's default size (nothing breaks). Caught by the quickstart
  check after each NDE release.

## R4. Testing

- **Decision**: Add to 001's `tests/theme-tokens.test.js` (or a sibling test): the built
  stylesheet sets both selectors to `var(--text-lg)`. Written first and seen failing. The visual
  result is checked manually in quickstart.

## Spike findings (T002, proxy mode, 2026-10-29)

Method: `npm run build`, `npm run start:proxy -- --port 4202` (target `https://usmai-umcp.primo.exlibrisgroup.com`),
headless Chrome via puppeteer-core, `networkidle2` plus an 8 s wait. Pages:
`/nde/search?query=cats&vid=01USMAI_UMCP:NDE&lang=en` (default scope), the same with
`tab=Everything&search_scope=MyInst_and_CI` (same first page of results), and with `facet=rtype,include,books`
(the page used for the measurements below). 120 results walked in all (6 pages each of the default scope
and the books facet, plus newest-first sorts).

### Per result type

| Type | Example | Availability markup (trimmed) | `.available-at-button .mdc-button__label` | `.quicklink-button` | Element holding status + location + call number | Computed (1280 px) |
|---|---|---|---|---|---|---|
| Print | "Cats : a history": "Available at UMCP McKeldin Library Stacks (QL737.C23 P45 2026)" | `nde-physical-availability-line > div.availability-status[data-qa=brief_result_availability] > mat-icon + button[mat-button].available-at-button.mat-mdc-button > span.mdc-button__label > span.availability-code.light-text > "Available at " + span.bold-text(location + call number)` | matches, whole line | no match | `span.availability-code` (the only child of `.mdc-button__label`, so the label covers the same text) | label 14px, line-height 24px, `display: inline`, `white-space: normal`, `text-overflow: ellipsis`, `overflow: hidden`; button 14px/24px, `white-space: normal`, `overflow: visible` |
| Print, not available here | "Cats": "See Request Options" | same as print, icon `Unavailable-record-indicator`, label text only "See Request Options" (no location or call number) | matches | no match | `span.availability-code` | same as print |
| Electronic | "Scientific and humane issues…": "Available Online" | `nde-online-availability > div.availability-container > div > button[mat-button][color=primary].quicklink-button.mat-body-medium.mat-mdc-button > span.mdc-button__label > span("Available Online")` | no match | matches | n/a (no location or call number) | button 14px, line-height 32px, `white-space: normal`; label 14px |
| Request link (online block) | "Cats" (Book): "See Request Options" | same `.quicklink-button` markup inside `nde-online-availability` | no match | matches | n/a | 14px |
| On order | — | NOT OBSERVED — no on-order (or "in process") status in the 120 "cats" results walked, in either scope or newest-first | | | | |

- The text is "Available Online", not "Available now"; no "Available now" string was seen. `.quicklink-button` also
  carries "See Request Options" on some results, so the rule enlarges that too (same block, acceptable).
- Both selectors are 14px today, as expected.
- Prior 001 selectors (`nde-physical-availability-line .availability-status`, `nde-online-availability .quicklink-button`)
  hit the same elements; the label/button selectors are narrower and fine.

### Cascade

- The rule setting the label's 14px is NDE's component style
  `.available-at-button[_ngcontent-…] .mdc-button__label { font-size: 0.875rem }` (specificity 0,3,0), injected as a
  `<style>` **after** our theme stylesheet (`/nde/custom/01USMAI_UMCP-NDE/custom.css` loads as link 7 of ~83 sheets).
- `.quicklink-button` gets 14px from `.mat-mdc-button { font-size: var(--mdc-text-button-label-text-size, …) }` (0,1,0).
- With a `<style>` placed right after our custom.css link (the real load position):
  - `.custom-nde-theme .available-at-button .mdc-button__label { font-size: 1.15rem }` → stays **14px** (NDE wins: equal
    specificity, later in the cascade). Injected at the end of `<head>` (page.addStyleTag) it showed 18.4px, which is
    misleading.
  - Same rule with `!important` → 18.4px.
  - `body.custom-nde-theme .available-at-button .mdc-button__label` (0,3,1) → 18.4px, no `!important`.
  - `.custom-nde-theme .available-at-button.mdc-button .mdc-button__label` (0,4,0) → 18.4px, no `!important`.
  - `.custom-nde-theme .quicklink-button { font-size: 1.15rem }` → 18.4px (button and its label), no `!important`.
  - Inner spans (`.availability-code`, `.bold-text`) inherit 18.4px from the label.

### 320 px

- At NDE's default 14px, the long print lines already wrap (2 lines; e.g. "Available at UMCP Performing Arts Library
  Folio (ML410.L78 C4 1981)"), ending at x≈292 inside a button ending at 300.
- At 18.4px they wrap to 2–3 lines, no clipping, no ellipsis: the label is `display: inline`, so its
  `overflow: hidden` / `text-overflow: ellipsis` have no effect; `white-space` is already `normal` on the label and the button.
- Page `scrollWidth`/`clientWidth` is 324/320 with and without the rule; the 4 px comes from the result card's
  `button.show-more-btn` menu trigger, not the availability line (existing Discover behaviour, out of scope).

### Decisions (for T003 and T005)

- **Availability line selector**: `.custom-nde-theme .available-at-button.mdc-button .mdc-button__label`
  (one extra class to beat NDE's 0,3,0 component rule; `.available-at-button .mdc-button__label` itself is confirmed).
- **"Available Online" selector**: `.custom-nde-theme .quicklink-button` (confirmed).
- **`!important` needed**: No, given the specificity bump above (the plain `.custom-nde-theme .available-at-button .mdc-button__label`
  would need it).
- **`white-space: normal` needed (R2)**: No; Discover already wraps the label. Drop the R2 rule.
- **Unit (T007 fix)**: `font-size: medium` on both buttons and `1.15em` on their `.mdc-button__label` replaced `var(--text-lg)`, because NDE's `html { font-size: 16px }` pins rem; `medium` follows the browser default (18.4px at 16, 23px at 20).
