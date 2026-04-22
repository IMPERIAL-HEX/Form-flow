export interface HowItWorksItem {
  title: string;
  description: string;
  code: string;
}

export interface SchemaFieldReference {
  field: string;
  summary: string;
  example: string;
}

export interface QuickLinkItem {
  title: string;
  description: string;
  href: string;
}

export interface ValuePropItem {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface DeliveryStage {
  phase: string;
  status: 'complete' | 'in-progress' | 'next';
  summary: string;
  artifacts: string[];
}

export const howItWorksItems: HowItWorksItem[] = [
  {
    title: '1. Define Schema',
    description:
      'Describe your flow, fields, validation, and conditional steps as JSON. No component code needed for each form.',
    code: `{
  "id": "education-loan",
  "layout": { "template": "sidebar-left" },
  "steps": [
    { "id": "loan-amount", "fields": [/* ... */] }
  ]
}`,
  },
  {
    title: '2. Render It',
    description:
      'Pass schema into the React SDK. Layout, field variants, and validation are resolved automatically.',
    code: `<FormFlowRenderer
  schema={schema}
  onSubmit={async (payload) => {
    await fetch('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }}
/>`,
  },
  {
    title: '3. Receive Submission',
    description:
      'Payload shape follows schema keys and can be transformed into nested objects before forwarding to your backend.',
    code: `{
  "loan": { "amount": 8000, "purpose": "medical" },
  "personal": { "firstName": "Sam", "lastName": "Green" }
}`,
  },
];

export const sdkUsageSnippets = {
  basic: `import { FormFlowRenderer } from '@formflow/react';
import type { FormSchema } from '@formflow/core';

export function LoanForm({ schema }: { schema: FormSchema }) {
  return <FormFlowRenderer schema={schema} />;
}`,
  headless: `import { useFormFlow } from '@formflow/react';

export function CustomFlow({ schema }: { schema: FormSchema }) {
  const flow = useFormFlow({ schema });

  return (
    <div>
      <h2>{flow.currentStep.title}</h2>
      <button onClick={flow.previous}>Back</button>
      <button onClick={() => void flow.next()}>Next</button>
    </div>
  );
}`,
  customComponents: `import { FormFlowRenderer } from '@formflow/react';

const customComponents = {
  text: {
    default: MyTextField,
  },
};

<FormFlowRenderer schema={schema} customComponents={customComponents} />;`,
  iframe: `<iframe
  src="https://your-domain/embed/education-loan?layout=sidebar-left&primaryColor=%230d9488"
  width="100%"
  height="900"
  style={{ border: 0 }}
/>`,
};

export const schemaFieldReference: SchemaFieldReference[] = [
  {
    field: 'text',
    summary: 'Single-line text input with min/max length and regex support.',
    example: `{
  "type": "text",
  "key": "personal.firstName",
  "label": "First name",
  "required": true,
  "minLength": 2
}`,
  },
  {
    field: 'currency',
    summary: 'Numeric currency input with min/max constraints and quick-select options.',
    example: `{
  "type": "currency",
  "key": "loan.amount",
  "currency": "GBP",
  "min": 1000,
  "max": 10000,
  "quickSelect": [2000, 5000, 8000]
}`,
  },
  {
    field: 'select',
    summary: 'Single-select options rendered as dropdowns, radio groups, or icon cards.',
    example: `{
  "type": "select",
  "key": "employment.status",
  "ui": { "variant": "radio-group" },
  "options": [
    { "value": "employed", "label": "Employed" },
    { "value": "student", "label": "Student" }
  ]
}`,
  },
  {
    field: 'file',
    summary: 'File metadata capture with accepted file types and max size validation.',
    example: `{
  "type": "file",
  "key": "documents.identityDocument",
  "accept": [".pdf", ".jpg", ".png"],
  "maxSizeMb": 10
}`,
  },
  {
    field: 'condition',
    summary: 'Conditional visibility for steps and fields with logical operators.',
    example: `{
  "showIf": {
    "field": "employment.status",
    "operator": "in",
    "value": ["employed", "self-employed"]
  }
}`,
  },
];

export const quickLinks: QuickLinkItem[] = [
  {
    title: 'Live demo section',
    description: 'Jump to the in-page interactive renderer on the landing page.',
    href: '#live-demo',
  },
  {
    title: 'Full demo route',
    description: 'Open the dedicated multi-step flow route used for product walkthroughs.',
    href: '/demo',
  },
  {
    title: 'Schema playground',
    description: 'Edit JSON presets and watch renderer output update in real time.',
    href: '/playground',
  },
  {
    title: 'Analytics dashboard',
    description: 'Inspect live submission telemetry and per-form activity snapshots.',
    href: '/analytics',
  },
  {
    title: 'Embed endpoint',
    description: 'Load the iframe-safe renderer surface for partner integrations.',
    href: '/embed/education-loan',
  },
];

export const valueProps: ValuePropItem[] = [
  {
    title: 'Deterministic core behavior',
    description:
      'Navigation, visibility, and validation logic run in a pure TypeScript engine with repeatable state transitions.',
  },
  {
    title: 'Schema-first implementation speed',
    description:
      'Teams define product flows as data instead of duplicating form logic across UI components.',
  },
  {
    title: 'Adapter-friendly architecture',
    description:
      'The React package is one adapter over a headless core, making future framework adapters straightforward.',
  },
  {
    title: 'Release-oriented quality gates',
    description:
      'Typecheck, tests, and demo E2E checks are automated to keep merges objective and predictable.',
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'Can I use FormFlow without React?',
    answer:
      'Yes. The core engine is framework-agnostic. React is an adapter package that consumes the same schema and state machine APIs.',
  },
  {
    question: 'How does FormFlow handle hidden conditional fields at submit?',
    answer:
      'Hidden step and field values are excluded from the final payload so downstream systems only receive currently visible data.',
  },
  {
    question: 'How is validation triggered during the flow?',
    answer:
      'Validation runs on blur and on step transitions, balancing immediate feedback with low noise while typing.',
  },
  {
    question: 'Can embed integrations receive submission payloads?',
    answer:
      'Yes. Embed mode emits postMessage events with form ID and submission payload so host applications can handle completion.',
  },
  {
    question: 'What is still required before final release merge?',
    answer: 'A final quality-gate sweep on branch HEAD and PR approval before merge into main.',
  },
];

export const deliveryStages: DeliveryStage[] = [
  {
    phase: 'Core engine',
    status: 'complete',
    summary: 'Schema parsing, condition evaluation, validation, and step state machine are stable.',
    artifacts: ['packages/core', 'packages/core/__tests__'],
  },
  {
    phase: 'React SDK',
    status: 'complete',
    summary:
      'Renderer, field registry, layout shells, and hook-based headless integration are available.',
    artifacts: ['packages/react', 'packages/react/__tests__'],
  },
  {
    phase: 'Demo + APIs',
    status: 'complete',
    summary:
      'Hosted flow, schema endpoint, submissions endpoint, embed mode, and playground are live.',
    artifacts: ['apps/demo/app/demo', 'apps/demo/app/api', 'apps/demo/app/embed'],
  },
  {
    phase: 'Landing and docs polish',
    status: 'complete',
    summary:
      'Public narrative, usage references, accessibility touches, and progress sections are complete.',
    artifacts: ['apps/demo/app/page.tsx', 'apps/demo/app/components/home', 'README.md'],
  },
  {
    phase: 'Conditional logic builder',
    status: 'complete',
    summary:
      'Playground-embedded editor compiles condition rows into showIf rules and applies them to the active schema.',
    artifacts: [
      'apps/demo/app/playground/components/ConditionBuilder.tsx',
      'apps/demo/app/playground/components/ConditionRow.tsx',
      'apps/demo/lib/schemas/conditionBuilderUtils.ts',
    ],
  },
  {
    phase: 'Visual builder',
    status: 'complete',
    summary:
      'Drag-and-drop builder route with sortable steps and fields, property editors for all 13 field types, and a live renderer preview.',
    artifacts: [
      'apps/demo/app/builder',
      'apps/demo/lib/builder',
    ],
  },
  {
    phase: 'Analytics dashboard',
    status: 'complete',
    summary:
      'Submission telemetry API, dashboard filters, and source/form breakdown views are now live.',
    artifacts: [
      'apps/demo/app/analytics',
      'apps/demo/app/api/analytics',
      'apps/demo/lib/analytics',
    ],
  },
  {
    phase: 'KYC integration',
    status: 'complete',
    summary:
      'Mock KYC provider with configurable modes, verification endpoints, submission-level decisions, and KYC-provider breakdowns in analytics are live.',
    artifacts: [
      'apps/demo/app/api/kyc',
      'apps/demo/lib/kyc',
      'apps/demo/lib/analytics/submissionsStore.ts',
    ],
  },
  {
    phase: 'Save and resume',
    status: 'complete',
    summary:
      'Session-backed drafts with tokenised resume links let applicants pause a flow and restore progress on the same or another device.',
    artifacts: [
      'apps/demo/app/api/sessions',
      'apps/demo/lib/sessions/sessionStore.ts',
      'apps/demo/app/demo/DemoClient.tsx',
    ],
  },
];

export const remainingChecklist: string[] = [
  'Roadmap scope is shipped — the project runs end-to-end as a local demo.',
  'Deferred for production hardening: swap the in-memory submission, KYC event, and session stores for a persistent database.',
  'Deferred for distribution: publish @formflow/core and @formflow/react to npm so external apps can consume the SDK directly.',
];
