'use client';

import { useState } from 'react';

import type { FormSchema } from '@formflow/core';

export type SaveStatus = 'clean' | 'saving' | 'saved' | 'error';

interface BuilderToolbarProps {
  title: string;
  schemaId: string;
  onTitleChange: (title: string) => void;
  onOpenPreview: () => void;
  onSave: () => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  onBackToList: () => void;
  schema: FormSchema;
  saveStatus: SaveStatus;
  dirty: boolean;
}

function statusLabel(status: SaveStatus, dirty: boolean): string {
  if (status === 'saving') return 'Saving…';
  if (status === 'error') return 'Save failed';
  if (dirty) return 'Unsaved changes';
  if (status === 'saved') return 'Saved';
  return 'All changes saved';
}

export function BuilderToolbar({
  title,
  schemaId,
  onTitleChange,
  onOpenPreview,
  onSave,
  onDelete,
  onBackToList,
  schema,
  saveStatus,
  dirty,
}: BuilderToolbarProps): React.ReactNode {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(`${JSON.stringify(schema, null, 2)}\n`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = (): void => {
    const blob = new Blob([`${JSON.stringify(schema, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schema.id || 'form'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="ff-builder-toolbar">
      <div className="ff-builder-title">
        <button type="button" className="ff-builder-back" onClick={onBackToList} aria-label="Back to forms list">
          ← Forms
        </button>
        <label className="ff-builder-title-label" htmlFor="ff-builder-title-input">
          Form title
        </label>
        <input
          id="ff-builder-title-input"
          className="ff-builder-title-input"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          aria-label="Form title"
        />
        <span className="ff-builder-id" aria-label="Form id">
          id: <code>{schemaId}</code>
        </span>
      </div>
      <div className="ff-builder-actions">
        <span
          className={`ff-builder-status ff-builder-status-${saveStatus}${dirty ? ' ff-builder-status-dirty' : ''}`}
          aria-live="polite"
        >
          {statusLabel(saveStatus, dirty)}
        </span>
        <button type="button" className="ff-builder-button" onClick={onOpenPreview}>
          Preview
        </button>
        <button type="button" className="ff-builder-button" onClick={handleCopyJson}>
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
        <button type="button" className="ff-builder-button" onClick={handleDownload}>
          Download JSON
        </button>
        <button
          type="button"
          className="ff-builder-button ff-builder-button-danger"
          onClick={() => void onDelete()}
        >
          Delete
        </button>
        <button
          type="button"
          className="ff-builder-button ff-builder-button-primary"
          onClick={() => void onSave()}
          disabled={saveStatus === 'saving' || !dirty}
        >
          {saveStatus === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </header>
  );
}
