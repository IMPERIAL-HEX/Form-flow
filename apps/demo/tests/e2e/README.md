# E2E Tests

This folder contains Playwright-based browser tests for the demo app.

Coverage focus:

1. Landing/docs page rendering
2. Demo route step flow shell
3. Playground schema editing behavior
4. Embed page loading and query override behavior
5. API smoke checks for form and submission endpoints

Run locally:

```bash
pnpm --filter @formflow/demo test:e2e
```

Open interactive runner:

```bash
pnpm --filter @formflow/demo test:e2e:ui
```
