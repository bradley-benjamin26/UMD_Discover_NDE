# Contract: Requests to the Library of Congress

The only outside requests this feature may make (Constitution II exception). Tests assert every
rule with a fake `fetch`.

| Request | URL | Per search |
|---|---|---|
| Suggest | `https://id.loc.gov/authorities/subjects/suggest2/?q={phrase}&count=8&searchtype=keyword` | ≤ 10 |
| Narrower terms | `https://id.loc.gov/authorities/subjects/{id}.json` | ≤ 2 |

- `{phrase}`: one candidate phrase from the search words or a top-result subject heading. Nothing
  else from the page.
- Options: `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, 3-second timeout.
- No requests before the panel is opened for that search; none repeated for the same cache key in
  the session.
- `{id}` only from a `http://id.loc.gov/authorities/subjects/` URI returned by the suggest call.
- Failure of any or all requests never affects Discover's results.
