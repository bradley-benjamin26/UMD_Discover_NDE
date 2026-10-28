# Contract: Homepage Card List

Markup in `src/assets/homepage/homepage_en.html`, replacing the template's menu block. Checked by
the Karma spec described in [research R6](../research.md#r6-testing).

```html
<ul class="umd-home-cards">
  <li>
    <a class="umd-home-card" href="https://umd.libcal.com/hours">
      <svg class="umd-home-card__icon" aria-hidden="true" focusable="false" …>…</svg>
      <span class="umd-home-card__title">Library Hours</span>
      <span class="umd-home-card__text">…one-line description…</span>
      <svg class="umd-home-card__external" aria-hidden="true" focusable="false" …>…</svg>
      <span class="visually-hidden">(external site)</span>
    </a>
  </li>
  …
</ul>
```

Rules:

- 3–8 `<li>`, each with exactly one `<a>` with an absolute `https://` `href`.
- Each link has a non-empty title and description; no placeholder text.
- Every `<svg>` has `aria-hidden="true"` and `focusable="false"`, no `id`, no `title`, and paints
  with `currentColor`.
- External marker (arrow + "(external site)") present if and only if the link's host differs from
  the Discover host.
- No `role`, `aria-label`, `tabindex`, or `id` attributes in the list.
- Everything outside `.umd-home-cards` is unchanged from `homepage_en.html.tmpl`.
