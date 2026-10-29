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
