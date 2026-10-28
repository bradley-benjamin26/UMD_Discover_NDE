# Contract: NDE Homepage Hero Selectors

NDE's side of the integration: the elements the stylesheet targets. Not documented by Ex Libris.
Starting point is the prior project's selectors; the spike confirms or corrects each in proxy mode
and fills in the TBD rows. An NDE release that changes these makes the hero fall back to NDE's
default look (nothing breaks); re-check after each release.

| Purpose | Selector | Source |
|---|---|---|
| Hero area (background photo) | `.custom-search-bar-container` | prior CSS; confirm it spans the full hero |
| NDE's colour overlay (hide) | `.custom-search-bar-container .background-overlay` | prior CSS |
| Panel (wraps heading + search bar) | TBD by spike | replaces the prior two half-cards |
| Heading | `.custom-search-bar-container h1` | prior CSS |
| Search bar row | `.custom-search-bar-container .search-bar-container` | prior CSS |
| Links row (Ask Anything, Advanced Search) | `.custom-search-bar-container .flex-row.flex-1 > .flex-row.gap-075` | prior CSS |
| Input wrapper | `.search-bar-wrapper.landing-page-search-bar-wrapper` | prior CSS |
| Scope dropdown button | `.custom-search-bar-container .search-dropdown-container-button` | prior CSS |
| Ask Anything / Advanced Search labels | `[data-qa="natural-language-search-button"]`, `[data-qa="advanced_search_button"]` | prior CSS |
| How NDE sets its own background | TBD by spike (CSS background or `<img>`) | decides how to suppress it if `homepageBGImage` is set |
