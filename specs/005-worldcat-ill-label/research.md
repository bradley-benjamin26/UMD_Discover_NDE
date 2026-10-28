# Research: WorldCat ILL Request Label

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

## R1. The prior approach and its defects

`customModule-main/src/assets/js/custom.js`: on every DOM change anywhere on the page (a
`MutationObserver` on `document.body` with `subtree` and `characterData`), it scanned every
`span.ng-star-inserted` for the text "WorldCat", and if any existed, rewrote every
`span.availability-code.light-text` reading "See Request Options".

- Page-wide decision: one WorldCat result relabels all results (spec FR-002 defect).
- Cost: two full-document scans on every DOM mutation, including its own text edits and every
  keystroke-driven re-render (FR-011).
- Fragile: depends on Angular's internal `ng-star-inserted` class.
- Text replaced inside Angular-owned nodes: Angular can re-render and flash the old text (FR-006).

## R2. Options, in order of preference

1. **Label configuration, no code.** The availability text comes from a Discover code table
   (README "Translating from code tables": delivery labels such as `delivery.code.*`). If WorldCat
   results carry a delivery/availability code that UMD-held results never use, changing that one
   label in Alma for the NDE view gives the exact result with zero code, no flash, and correct
   screen-reader text everywhere it appears.
2. **Per-result component.** A small standalone component on the brief-result availability
   element's `-after` hook. It reads that result's own source from `hostComponent` (data Discover
   already loaded) and, only for sole-source WorldCat results, swaps the label text of its own
   result's availability element (scoped to that one result, never the document). Re-evaluated
   when the host changes; no page-wide observer.
3. Page-wide script (prior): rejected, R1.

- **Decision**: Spike first (task 1) to settle option 1. In proxy mode, record for one WorldCat
  result and one UMD "See Request Options" result: the delivery/availability code behind the
  label, and the record source fields in `hostComponent`. If the WorldCat code is unique to
  WorldCat records, implement option 1 and stop; otherwise implement option 2.
- **Rationale**: Option 1 is the smallest correct change (Constitution VI) and has no failure
  mode on NDE updates. Option 2 meets every FR without page-wide work.

## R3. Option 2 details (if needed)

- **Detecting WorldCat**: from the result's own data (source id / record source field), not from
  displayed text, and only when it is the sole source (spec edge case).
- **Accessible name (FR-005)**: after swapping visible text, also check the control's
  `aria-label`; if one exists, update it to the same text, so the name never says the old wording.
- **No flash (FR-006)**: the decision uses data present before the label renders; the swap runs
  in the same change-detection pass that renders the availability.
- **Fallback (spec edge cases)**: if the source field or the exact "See Request Options" text is
  missing, do nothing (original label stays; never a wrong label).
- **Results list only (FR-009)**: hooked on the brief-result element, so the full record is not
  touched.

## R4. Hidden source line (FR-007)

- **Decision**: Keep the prior CSS rule `[data-qa="brief_result_source"] { display: none }` in
  001's theme stylesheet, scoped to the results list.
- **Note**: With option 1, the source line may not need to be shown at all; if so, turn the
  setting off in Configure Views instead and drop the rule (simpler). Decided by the spike.

## R5. Testing

- Option 1: a `node:test`/manual check is all that is possible (the label lives in Alma). The
  quickstart mixed-results check (SC-001, SC-002) is the acceptance test; recorded in the PR.
- Option 2: Karma/Jasmine with host fixtures captured in the spike: WorldCat-only result
  relabeled; UMD result untouched; WorldCat + other source untouched; missing source untouched;
  `aria-label` updated with the text; host update re-evaluated. Written and failing first.

## R6. Leftover to remove

This repository's `src/assets/js/custom.js` contains only `console.log('Hello from custom.js')`.
Not part of this feature; noted for cleanup so a console message doesn't ship.
