'use client';

import { useMemo, useState } from 'react';

import { FormFlowRenderer } from '@formflow/react';

import type { SchemaPreset } from '@/lib/schemas/presetSchemas';

interface LiveDemoClientProps {
  presets: SchemaPreset[];
  initialPresetId: string;
}

export function LiveDemoClient({ presets, initialPresetId }: LiveDemoClientProps): React.ReactNode {
  const [activeId, setActiveId] = useState<string>(initialPresetId);
  const [submission, setSubmission] = useState<Record<string, unknown> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const active = useMemo(
    () => presets.find((preset) => preset.id === activeId) ?? presets[0],
    [activeId, presets],
  );

  if (!active) {
    return null;
  }

  return (
    <div className="ff-live-demo-wrap">
      <div className="ff-live-demo-picker" role="tablist" aria-label="Example flow">
        {presets.map((preset) => {
          const isActive = preset.id === active.id;
          return (
            <button
              key={preset.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`ff-live-demo-pill${isActive ? ' ff-live-demo-pill-active' : ''}`}
              onClick={() => {
                if (!isActive) {
                  setActiveId(preset.id);
                  setSubmission(null);
                }
              }}
            >
              <span className="ff-live-demo-pill-title">{preset.title}</span>
              <span className="ff-live-demo-pill-description">{preset.description}</span>
            </button>
          );
        })}
      </div>

      <div className="ff-live-demo-grid">
        <div className="ff-live-demo-form">
          <FormFlowRenderer
            key={active.id}
            schema={active.schema}
            onSubmit={async (payload) => {
              setIsSubmitting(true);
              setSubmission(payload);

              await fetch('/api/submissions', {
                method: active.schema.submission.method ?? 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  formId: active.schema.id,
                  source: 'demo',
                  payload,
                }),
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
    </div>
  );
}
