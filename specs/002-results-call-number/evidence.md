# 002 test & check evidence

## T004 — availability-line assertions fail before implementation (RED)

`npm run test:assets` (log: .superpowers/sdd/tasks/T004.log)

```
ℹ tests 63
ℹ pass 61
ℹ fail 2
AssertionError: no font-size rule for .custom-nde-theme .available-at-button.mdc-button .mdc-button__label
AssertionError: no font-size rule for .custom-nde-theme .quicklink-button
```

Both new tests fail because the rules are missing; the existing 61 pass.

## T008 — axe

axe-core 4.14.0 (puppeteer-core, headless Chrome), tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa.
Page: `/nde/search?query=cats&vid=01USMAI_UMCP:NDE&lang=en` via `npm run start:proxy` on port 4203, 12 s settle after results render.
A = normal. B = same page with our two rules neutralised: custom.css response intercepted and
`.custom-nde-theme .available-at-button.mdc-button .mdc-button__label, .custom-nde-theme .quicklink-button { font-size: revert-layer }` appended.
Verified B restores 14px (computed 14px on the availability label and quicklink buttons; A computes 18.4px).

| Width | A violations | B violations | OURS (in A, not in B) |
|---|---|---|---|
| 1440 | 1 rule, 2 nodes | 1 rule, 2 nodes | 0 |
| 320 | 1 rule, 1 node | 1 rule, 1 node | 0 |

OUR violations: none. No target-size, color-contrast or reflow findings at either width.

Discover-owned (identical in A and B): `label-content-name-mismatch` on
`button[aria-label="Available at {{idx_1}} (Cats)"]` (unrendered template placeholder in the aria-label; 1440 and 320) and
`.general-search-actions-dropdown-button` (1440 only).
