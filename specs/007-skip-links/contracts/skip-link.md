# Contract: Skip Link

## Rendered markup (this feature)

```html
<a class="umd-skip-link" href="#{main-id}">Skip to main content</a>
```

- Exactly one, first focusable element on every page (FR-001, FR-003).
- Activation moves focus to the main content target; URL unchanged; next Tab continues inside main
  content (FR-002, FR-007).
- Hidden until focused; visible on focus with 4.5:1 text and 3:1 focus ring (FR-005).

## Discover side (filled in by the spike)

| Item | Value |
|---|---|
| Hook | `nde-header-before` (prior project) |
| Hook element is first focusable, with 001's static header in place | TBD |
| Main content target selector / id | TBD (expected: Discover's `<main>`) |
| Main target focusable by default | TBD |
| Header area re-created on navigation | TBD |
| Discover's own skip links still work | TBD |

If the hook does not come first, follow the contingency in
[research R2](../research.md#r2-where-the-skip-link-lives).
