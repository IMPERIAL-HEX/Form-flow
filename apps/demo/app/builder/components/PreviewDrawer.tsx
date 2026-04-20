'use client';

import type { FormSchema } from '@formflow/core';

interface PreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  schema: FormSchema | null;
  error: string | null;
}

export function PreviewDrawer({ open, onClose, schema, error }: PreviewDrawerProps): React.ReactNode {
  if (!open) return null;

  return (
    <div className="ff-builder-preview-overlay" role="dialog" aria-label="Form preview" aria-modal="true">
      <div className="ff-builder-preview-shell">
        <header className="ff-builder-preview-header">
          <h2>Preview</h2>
          <button type="button" className="ff-builder-button" onClick={onClose} aria-label="Close preview">
            Close
          </button>
        </header>
        <div className="ff-builder-preview-body">
          {error ? (
            <div className="ff-builder-preview-error">{error}</div>
          ) : schema ? (
            <pre className="ff-builder-preview-json">{JSON.stringify(schema, null, 2)}</pre>
          ) : (
            <div className="ff-builder-empty">Nothing to preview yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
