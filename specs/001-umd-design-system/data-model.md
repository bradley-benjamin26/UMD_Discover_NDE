# Data Model: UMD Design System for Discover

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

No stored data. The "entities" are the brand values and the styles built from them.

## Brand value set (tokens)

Defined once, as CSS custom properties, at the top of the theme bundle. Names keep lib.umd.edu's
token names (`reference/tokens.css`) so values can be compared one to one.

| Group | Tokens | Values |
|---|---|---|
| Colour | `--maryland-red`, `--dark-red`, `--maryland-yellow`, `--white`, `--black` | `#E21833`, `#A90007`, `#FFD200`, `#FFFFFF`, `#000000` |
| Gray | `--lightest-gray`, `--lighter-gray`, `--light-gray`, `--medium-gray`, `--dark-gray`, `--darker-gray` | `#FAFAFA`, `#F1F1F1`, `#E6E6E6`, `#757575`, `#454545`, `#242424` |
| Status | `--green` | `#037623` |
| Spacing | `--space-xs` … `--space-3xl` | 0.5, 1, 1.5, 2, 3, 4, 7.5 rem |
| Type family | `--font-heading`, `--font-display`, `--font-body` | Crimson Pro; Barlow Condensed; Interstate, Helvetica, Arial, sans-serif |
| Type scale | `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl` | 0.875, 1, 1.15, 1.5, 2, 2.625 rem |
| Shape | `--radius-sm`, `--radius-md`, `--radius-pill` | 0.125, 1, 999 rem |
| Focus | `--focus-ring`, `--focus-ring-on-dark`, `--focus-offset` | 3px solid `--darker-gray`; 3px solid `--maryland-yellow`; 2px |

**Validation rules**

- Every colour, font family, font size, radius, and spacing value in the stylesheet is a token
  (SC-001). Literal values appear only in the token block.
- Every text/background pair in the "Allowed pairs" table passes its contrast minimum.
- Type sizes use `rem` so they follow the patron's text-size setting.

## Allowed pairs (contrast contract)

| Foreground | Background | Minimum | Measured |
|---|---|---|---|
| `--darker-gray` | `--white` | 4.5 | 15.52 |
| `--maryland-red` | `--white` | 4.5 | 4.76 |
| `--white` | `--maryland-red` | 4.5 | 4.76 |
| `--dark-red` | `--white` | 4.5 | 7.81 |
| `--medium-gray` | `--white` | 4.5 | 4.61 |
| `--white` | `--black` | 4.5 | 21.00 |
| `--green` | `--white` | 4.5 | 5.80 |
| `--focus-ring` colour | `--white` | 3 | 15.52 |
| `--focus-ring-on-dark` colour | `--black` | 3 | 14.47 |
| `--focus-ring-on-dark` colour | `--maryland-red` | 3 | 3.28 |

Any pair not in this table is not allowed for text or control boundaries.

## Component styles

Each restyles an existing Discover control; states are default, hover, focus, active, disabled.

| Style | Default | Hover / active | Focus | Disabled |
|---|---|---|---|---|
| Primary button | `--maryland-red` fill, `--white` text, `--radius-sm` | `--dark-red` fill | `--focus-ring` | Material's disabled treatment (exempt from contrast under WCAG 1.4.3) |
| Secondary button | `--white` fill, `--maryland-red` text and 1px border | `--lightest-gray` fill, `--dark-red` text | `--focus-ring` | as above |
| Link | `--maryland-red`, underlined | `--dark-red` | `--focus-ring` | n/a |
| Chip (applied facet) | `--white` fill, `--medium-gray` border, `--darker-gray` text, `--radius-pill`, remove icon ≥24×24 px | `--lighter-gray` fill | `--focus-ring` on chip and on remove control | n/a |
| Tag/label | `--lighter-gray` fill, `--darker-gray` text, `--text-sm`, uppercase display font | none (not interactive) | n/a | n/a |
| Card (result) | `--white` fill, `--light-gray` border, `--radius-md`; title in `--font-heading` | border `--medium-gray` | `--focus-ring` on the title link | n/a |

All transitions are removed under `prefers-reduced-motion: reduce`. In forced-colours mode,
borders use `CanvasText` and focus rings use `Highlight`.

## Reference capture

`reference/tokens.css` (copied 2026-10-28) is the source for the token values. The saved
The package includes only the licensed Interstate font weights it uses; the site's full
`fonts.css` and unrelated font families stay outside the repository.
