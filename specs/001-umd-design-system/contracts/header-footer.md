# Contract: Static Header and Footer

Files: `src/assets/header-footer/header_en.html`, `src/assets/header-footer/footer_en.html`.
NDE inserts these on every page. Checked by `tests/header-footer.test.js`.

## Both files

- Only absolute `https://` links; no site-relative (`/…`) or `http://` links.
- No `<script>`, no inline event handlers, no `<button>` (nothing interactive needs a script).
- No external stylesheet or font URLs; no `style` attributes that hide content.
- Every `<img>` has `alt` (empty only when decorative) and width/height.
- Links that leave Discover open in the same tab.

## Header

- One `<header>` landmark, placed after the spec 007 skip link.
- Global bar: link "University of Maryland" → `https://umd.edu/`.
  Match the library website's centered, white, uppercase wordmark on Maryland red: the heading font (`var(--font-heading)`, Crimson Pro/serif),
  14px regular text, 1.3 line-height, 1px letter spacing, and no underline. The bar is 56px high below
  1100px viewport width and 44px from 1100px upward. Keep a visible high-contrast keyboard focus ring.
- Logo link → `https://www.lib.umd.edu/`, accessible name "University of Maryland Libraries home".
- Two right-justified navigation rows beside the logo, with utility navigation above primary navigation.
  At narrow widths, both rows wrap while remaining right-justified.
- Desktop primary navigation links use the base text size of 1rem (16px at the default root size).
- At viewport widths of 1240 CSS px and narrower, replace the two visible rows with one initially
  collapsed hamburger disclosure beside the logo. Opening it reveals both utility and primary
  navigation, including their submenu links; closing it hides the panel again.
- Utility `<nav aria-label="University Libraries utility">` has links for Locations & Hours,
  System Status, Get Help, Info For, Accounts, and Search.
- Primary `<nav aria-label="University Libraries">` has the lib.umd.edu top-level items as links:
  Find, Borrow, Request (`/find`); Visit and Study (`/visit`); Research and Learning (`/research`);
  Collections (`/collections`); About (`/about`), each prefixed with
  `https://www.lib.umd.edu`.
- On desktop, navigation items with subpages pair their destination link with a native
  `<details>` / `<summary>` disclosure and a submenu of links. The summaries work with pointer,
  keyboard, and touch without scripts; each has an accessible name and its expanded state is exposed
  by the browser.
- In the mobile hamburger panel, both navigation groups and all their submenu links appear in
  nested link lists.

## Footer

- One `<footer>` landmark (role contentinfo).
- Libraries name, address, phone (`tel:` link), and link groups as headed lists
  (`<h2>` + `<ul>`): Our Libraries, Library Information, Services & Support, Get Involved,
  Stay Connected.
- Social links have accessible names (e.g. "University Libraries on Instagram"); icons are
  `aria-hidden`.
- Bottom bar: Give Now, Privacy Policy, Web Accessibility, © year University of Maryland.
