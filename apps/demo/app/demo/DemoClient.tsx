'use client';

import type { FormSchema } from '@formflow/core';
import { FormFlowRenderer } from '@formflow/react';

interface DemoClientProps {
  schema: FormSchema;
}

export function DemoClient({ schema }: DemoClientProps): React.ReactNode {
  const method = schema.submission.method ?? 'POST';

  return (
    <FormFlowRenderer
      schema={schema}
      onSubmit={async (payload: Record<string, unknown>) => {
        await fetch(schema.submission.endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(schema.submission.headers ?? {}),
          },
          body: JSON.stringify(payload),
        });
      }}
    />
  );
}
