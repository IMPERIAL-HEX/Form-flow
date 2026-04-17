import type { FormSchema } from '@formflow/core';
import { FormFlowRenderer } from '@formflow/react';

interface PreviewPanelProps {
  schema: FormSchema | null;
  submissionData: Record<string, unknown> | null;
  onSubmit: (payload: Record<string, unknown>) => void;
}

export function PreviewPanel({
  schema,
  submissionData,
  onSubmit,
}: PreviewPanelProps): React.ReactNode {
  return (
    <section className="ff-preview-pane" aria-label="Live preview pane">
      <div className="ff-preview-card">
        <h2>Live Preview</h2>
        {!schema ? (
          <p className="ff-preview-placeholder">Fix schema errors to render the preview.</p>
        ) : (
          <FormFlowRenderer schema={schema} onSubmit={onSubmit} />
        )}
      </div>

      <div className="ff-preview-payload">
        <h3>Submission Payload</h3>
        <pre>
          {submissionData
            ? JSON.stringify(submissionData, null, 2)
            : '{\n  "message": "Submit the form to preview payload"\n}'}
        </pre>
      </div>
    </section>
  );
}
