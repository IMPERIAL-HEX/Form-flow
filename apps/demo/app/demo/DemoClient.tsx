'use client';

import type { FormSchema } from '@formflow/core';
import { FormFlowRenderer } from '@formflow/react';

interface DemoClientProps {
  schema: FormSchema;
}

export function DemoClient({ schema }: DemoClientProps): React.ReactNode {
  return (
    <FormFlowRenderer
      schema={schema}
      onSubmit={async (payload: Record<string, unknown>) => {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }}
    />
  );
}
