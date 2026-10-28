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
- Logo link → `https://www.lib.umd.edu/`, accessible name "University of Maryland Libraries home".
- One `<nav aria-label="University Libraries">` with the lib.umd.edu top-level items as plain links:
  Find, Borrow, Request (`/find`); Research and Learning (`/research`); Visit and Study
  (`/visit`); Collections (`/collections`); Info For (`/information`); About (`/about`), each
  prefixed with `https://www.lib.umd.edu`. Taken from the prior header; re-checked against
  lib.umd.edu before release.

## Footer

- One `<footer>` landmark (role contentinfo).
- Libraries name, address, phone (`tel:` link), and link groups as headed lists
  (`<h2>` + `<ul>`): Our Libraries, Library Information, Services & Support, Get Involved,
  Stay Connected.
- Social links have accessible names (e.g. "University Libraries on Instagram"); icons are
  `aria-hidden`.
- Bottom bar: Give Now, Privacy Policy, Web Accessibility, © year University of Maryland.
