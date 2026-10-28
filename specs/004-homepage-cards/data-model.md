# Data Model: Homepage Cards

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-28

No stored data. Cards are content in `src/assets/homepage/homepage_en.html`; changing the set means
editing that file (FR-001).

## Card

| Field | Rule |
|---|---|
| title | Required, short (≤ 4 words) |
| description | Required, one line (≤ 60 characters) |
| destination | Required, absolute `https://` URL; a card with none is not shown |
| external | True when the destination host is not the Discover host; shows the arrow and "(external site)" |
| icon | Optional; if present, one UMD design system icon ([research R1](./research.md#r1-umd-design-system-icons-fr-002)) |

Card set: 3 to 8 cards, in the order the Libraries choose.

## Current draft (from the prior project, until the Libraries decide)

| Title | Description | Destination | Icon |
|---|---|---|---|
| Library Hours | TBD by Libraries | `https://umd.libcal.com/hours` | clock |
| Ask Us FAQs | TBD by Libraries | `https://umd.libanswers.com/` | info |
| Digital Collections | Find unique digitized materials. | `https://digital.lib.umd.edu/` | none (gap) |
| UMD Discover Research Guide | TBD by Libraries | `https://lib.guides.umd.edu/umd-discover` | document |
| Archives | Find unique, historic materials. | none yet, so not shown | none (gap) |

Three descriptions are missing in the prior draft; FR-001 requires one per card, so the Libraries
supply them (placeholders fail the test, so they can't ship by accident).
