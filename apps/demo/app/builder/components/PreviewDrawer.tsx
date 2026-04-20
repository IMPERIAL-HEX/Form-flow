'use client';

import { useEffect } from 'react';

import type { FormSchema } from '@formflow/core';
import { FormFlowRenderer } from '@formflow/react';

interface PreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  schema: FormSchema | null;
  error: string | null;
}

export function PreviewDrawer({ open, onClose, schema, error }: PreviewDrawerProps): React.ReactNode {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ff-builder-preview-overlay"
      role="dialog"
      aria-label="Form preview"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ff-builder-preview-shell">
        <header className="ff-builder-preview-header">
          <h2>Preview</h2>
          <button
            type="button"
            className="ff-builder-button"
            onClick={onClose}
            aria-label="Close preview"
          >
            Close
          </button>
        </header>
        <div className="ff-builder-preview-body">
          {error ? (
            <div className="ff-builder-preview-error">
              <strong>Schema error</strong>
              <p>{error}</p>
            </div>
          ) : schema ? (
            <FormFlowRenderer schema={schema} onSubmit={() => undefined} />
          ) : (
            <div className="ff-builder-empty">Nothing to preview yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
