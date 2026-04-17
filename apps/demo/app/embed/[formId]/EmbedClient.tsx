'use client';

import type { FormSchema } from '@formflow/core';
import { FormFlowRenderer } from '@formflow/react';

interface EmbedClientProps {
  formId: string;
  schema: FormSchema;
}

export function EmbedClient({ formId, schema }: EmbedClientProps): React.ReactNode {
  return (
    <main className="ff-embed-shell">
      <FormFlowRenderer
        schema={schema}
        className="ff-embed-renderer"
        onSubmit={async (payload: Record<string, unknown>) => {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(
              {
                type: 'formflow:submit',
                formId,
                data: payload,
              },
              '*',
            );
          }

          await fetch('/api/submissions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              formId,
              source: 'embed',
              payload,
            }),
          });
        }}
      />
    </main>
  );
}
