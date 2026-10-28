<!--
Sync Impact Report
- Version change: (unratified template) → 1.0.0
- Modified principles: none (initial adoption; all template placeholders replaced)
- Added principles:
  I. Accessibility: WCAG 2.2 AA (NON-NEGOTIABLE)
  II. Privacy by Default
  III. Spec-Driven Development
  IV. Test-Driven Development (NON-NEGOTIABLE)
  V. Correctness Over Appearance
  VI. Simplicity and Efficiency
- Added sections: Quality Gates, Development Workflow, Governance
- Removed sections: none
- Follow-up TODOs: none
-->

# UMD Discover NDE Constitution

## Core Principles

### I. Accessibility: WCAG 2.2 AA (NON-NEGOTIABLE)

Every user-facing change to the UMD Discover (Primo NDE) customization MUST conform to WCAG 2.2
Level AA.

- Interactive elements MUST be operable by keyboard alone, with a visible focus indicator that
  is not obscured (SC 2.4.7, 2.4.11).
- Text and meaningful non-text content MUST meet contrast minimums (4.5:1 text, 3:1 large text
  and UI components).
- Images, icons, and controls MUST have accessible names; semantic HTML is preferred over ARIA,
  and ARIA, when used, MUST be valid.
- Pointer targets MUST be at least 24×24 CSS px or meet the spacing exception (SC 2.5.8).
- Content MUST reflow at 320 CSS px width and remain usable at 200% text zoom.
- Dynamic updates (loading states, results, errors) MUST be announced to assistive technology.
- Accessibility acceptance criteria MUST appear in every spec and be verified by tests
  (automated where possible, plus a documented manual keyboard/screen-reader check).

Rationale: the library serves the entire university community; inaccessible discovery is a
barrier to access and a legal compliance risk.

### II. Privacy by Default

User privacy MUST take priority over convenience, analytics, or feature richness.

- Collect, store, or transmit only the data a feature strictly requires; no data collection
  "for later".
- No third-party trackers, analytics, fonts, or scripts MAY be added without a documented
  privacy review in the feature spec.
- Patron data (identity, searches, loans, saved items) MUST NOT be logged, persisted to browser
  storage, or sent to any service other than the Ex Libris platform that already holds it.
- Secrets and credentials MUST NOT be committed to the repository.
- Any new data flow MUST be described in the spec, including what is sent, where, and why.

Rationale: library patrons have a long-standing expectation of confidentiality in what they
search and read.

### III. Spec-Driven Development

Features MUST begin as a written specification before planning or code.

- Workflow order: specify → (clarify) → plan → tasks → implement, using the Spec Kit commands.
- Specs describe user value, acceptance criteria, accessibility and privacy requirements, and
  are free of implementation detail.
- Code that implements behavior absent from an approved spec MUST NOT be merged; the spec is
  updated first.
- When implementation reveals a spec is wrong, the spec MUST be corrected, not silently bypassed.

Rationale: a shared, reviewable spec prevents scope drift and makes the intent testable.

### IV. Test-Driven Development (NON-NEGOTIABLE)

No production code MAY be written for a feature or fix until a test for it exists and has been
observed to fail.

1. Write a test that expresses the required behavior.
2. Run it and confirm it fails for the expected reason (red).
3. Write the minimum code that makes it pass (green).
4. Refactor with all tests passing.

- Bug fixes MUST start with a test that reproduces the bug.
- A test that passes before the implementation exists is invalid and MUST be fixed.
- The full test suite (`npm test`) MUST pass before a change is merged.

Rationale: a test seen failing proves it actually checks the behavior; one never seen failing
proves nothing.

### V. Correctness Over Appearance

Finding and fixing real problems takes precedence over making work look complete or correct.

- Failures, warnings, and known defects MUST be reported honestly, never hidden, suppressed,
  or worked around to make a check pass.
- Tests MUST NOT be weakened, skipped, or mocked into passing to satisfy a gate.
- Root causes MUST be fixed rather than symptoms patched.
- "Done" means verified by running the code and tests, not by inspection alone.

Rationale: surface polish over hidden defects shifts cost to patrons and future maintainers.

### VI. Simplicity and Efficiency

The project MUST favor the simplest architecture that fully meets the spec, and code MUST be
efficient in runtime, payload, and maintenance cost.

- Prefer existing code, Angular/platform features, and installed dependencies before adding
  anything new; new dependencies require justification in the plan.
- No speculative abstractions, configuration, or options (YAGNI).
- Minimize bundle size, network requests, and change-detection work; avoid redundant loops and
  repeated computation.
- Any added complexity MUST be justified in the plan's Complexity Tracking section.

Rationale: the customization module loads into every Discover page view; each byte and each
abstraction has a cost paid by every user and every maintainer.

## Quality Gates

A change MUST NOT be merged unless all of the following hold:

- An approved spec exists and the change traces to it (Principle III).
- Tests were written first, observed failing, and now pass; `npm test` and `npm run build`
  succeed (Principle IV).
- WCAG 2.2 AA criteria for the change are verified (Principle I).
- No new data collection or third-party calls without documented privacy review (Principle II).
- No unresolved known defects are concealed (Principle V).
- Added complexity or dependencies are justified (Principle VI).

## Development Workflow

- Work happens on a feature branch, never directly on `main`.
- Each plan includes a Constitution Check that evaluates the design against every principle;
  violations MUST be resolved or justified before tasks are generated.
- Tasks lists order test tasks before the implementation tasks they cover.
- Code review MUST confirm the Quality Gates above.

## Governance

This constitution supersedes other project practices where they conflict.

- Amendments are made through `/speckit-constitution`, reviewed via pull request, and recorded
  with an updated version and amendment date.
- Versioning follows semantic versioning: MAJOR for removing or redefining a principle, MINOR for
  adding a principle or materially expanding guidance, PATCH for clarifications and wording.
- Compliance is reviewed at every plan (Constitution Check) and every pull request review.
  Exceptions MUST be documented with rationale in the relevant plan.

**Version**: 1.0.0 | **Ratified**: 2026-10-28 | **Last Amended**: 2026-10-28
