'use client';

import { useState } from 'react';

import type { FormSchema } from '@formflow/core';
import { FormFlowRenderer } from '@formflow/react';

interface LiveDemoClientProps {
  schema: FormSchema;
}

export function LiveDemoClient({ schema }: LiveDemoClientProps): React.ReactNode {
  const [submission, setSubmission] = useState<Record<string, unknown> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="ff-live-demo-grid">
      <div className="ff-live-demo-form">
        <FormFlowRenderer
          schema={schema}
          onSubmit={async (payload) => {
            setIsSubmitting(true);
            setSubmission(payload);

            await fetch('/api/submissions', {
              method: schema.submission.method ?? 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            setIsSubmitting(false);
          }}
        />
      </div>

      <aside className="ff-live-demo-payload">
        <h3>Submission Payload</h3>
        <p>
          {isSubmitting
            ? 'Submitting payload...'
            : 'Payload snapshot from the latest submit event.'}
        </p>
        <pre>
          <code>
            {submission
              ? `${JSON.stringify(submission, null, 2)}\n`
              : '{\n  "hint": "Complete the flow and submit to inspect output"\n}\n'}
          </code>
        </pre>
      </aside>
    </div>
  );
}
