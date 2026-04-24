# FormFlow

Schema-driven multi-step forms for any data-collection workflow — intake forms, surveys, onboarding, applications, or anything else you can describe in JSON.

## What It Is

FormFlow is a monorepo with:

1. `@formflow/core`: headless TypeScript engine for schema parsing, conditions, validation, and step-state transitions.
2. `@formflow/react`: React SDK that renders schemas with built-in field components, layouts, and theming.
3. `@formflow/demo`: Next.js app with a live demo, schema playground, and iframe embed route.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open:

1. `http://localhost:3000` for docs + live landing demo
2. `http://localhost:3000/demo` for full-page application flow
3. `http://localhost:3000/playground` for live schema editor
4. `http://localhost:3000/embed/education-loan` for embed mode

## Architecture

```text
formflow/
├── packages/
│   ├── core/      # schema parser, runtime validation, condition engine, state machine
│   └── react/     # renderer, field components, layouts, hooks, theme
└── apps/
  └── demo/      # docs/landing, demo flow, playground, embed route, API routes
```

## Quality Gates

Merges to main are expected to pass:

1. `pnpm typecheck`
2. `pnpm test`
3. `pnpm --filter @formflow/demo test:e2e`

CI workflow:

1. `.github/workflows/quality-gates.yml`

## Minimal Usage

```tsx
import { FormFlowRenderer } from '@formflow/react';
import type { FormSchema } from '@formflow/core';

export function LoanFlow({ schema }: { schema: FormSchema }) {
  return (
    <FormFlowRenderer
      schema={schema}
      onSubmit={async (payload) => {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }}
    />
  );
}
```

## Headless Mode

```tsx
import { useFormFlow } from '@formflow/react';

function CustomShell({ schema }: { schema: FormSchema }) {
  const flow = useFormFlow({ schema });

  return (
    <div>
      <h2>{flow.currentStep.title}</h2>
      <button onClick={flow.previous} disabled={flow.isFirstStep}>
        Previous
      </button>
      <button onClick={() => void flow.next()}>{flow.isLastStep ? 'Submit' : 'Next'}</button>
    </div>
  );
}
```

## Schema Example

```json
{
  "id": "education-loan",
  "version": "1.0.0",
  "layout": { "template": "sidebar-left" },
  "submission": {
    "endpoint": "/api/submissions",
    "method": "POST",
    "transformKeys": true
  },
  "steps": [
    {
      "id": "loan-amount",
      "title": "Loan Amount",
      "fields": [
        {
          "type": "currency",
          "key": "loan.amount",
          "label": "Requested amount",
          "required": true,
          "currency": "GBP",
          "min": 1000,
          "max": 10000
        }
      ]
    }
  ]
}
```

## Embed Mode

```html
<iframe
  src="https://your-domain/embed/education-loan?layout=sidebar-left&primaryColor=%230d9488"
  width="100%"
  height="920"
  style="border:0"
></iframe>
```

Submissions from embed mode are posted to parent windows with:

```ts
{ type: 'formflow:submit', formId: 'education-loan', data: { ...payload } }
```

## Scripts

```bash
pnpm typecheck
pnpm test
pnpm build
```

## E2E Testing (Demo App)

Playwright scaffolding is included in `apps/demo/tests/e2e` for landing, demo flow,
playground, embed route, and API smoke checks.

Install browser binaries once:

```bash
pnpm --filter @formflow/demo exec playwright install
```

Run E2E tests:

```bash
pnpm --filter @formflow/demo test:e2e
```

Run with Playwright UI mode:

```bash
pnpm --filter @formflow/demo test:e2e:ui
```

## Why This Exists

This project demonstrates a practical DSL-style runtime for any multi-step form:

1. Define once in JSON.
2. Validate and execute conditions in a headless core.
3. Render via reusable UI adapters.

The included example schemas cover a contact intake, a customer feedback survey, and an education loan application to show the same runtime handling generic data collection, structured surveys, and long regulated flows. It is built as a portfolio-quality architecture that can evolve into hosted builders, analytics, and multi-framework SDKs.

## Project Status

The roadmap scope is complete. The project runs end-to-end as a local demo.

1. Complete: headless core engine and tests
2. Complete: React SDK renderer, fields, layouts, and hooks
3. Complete: demo flow, embed mode, playground, and API routes
4. Complete: landing, docs, and release polish
5. Complete: conditional-logic builder
6. Complete: drag-and-drop visual builder
7. Complete: analytics dashboard with submission telemetry
8. Complete: mock KYC provider and verification flow
9. Complete: save-and-resume drafts via tokenised session links

Explicitly deferred:

1. Persistent database — submissions, KYC events, and session drafts all live in in-memory stores and reset on server restart
2. npm package publishing — `@formflow/core` and `@formflow/react` are workspace-only today
