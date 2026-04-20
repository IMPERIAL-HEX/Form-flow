'use client';

import { useState } from 'react';

import type { FormSchema } from '@formflow/core';

interface BuilderToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onOpenPreview: () => void;
  schema: FormSchema;
}

export function BuilderToolbar({
  title,
  onTitleChange,
  onOpenPreview,
  schema,
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
      </div>
      <div className="ff-builder-actions">
        <button type="button" className="ff-builder-button" onClick={onOpenPreview}>
          Preview
        </button>
        <button type="button" className="ff-builder-button" onClick={handleCopyJson}>
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
        <button
          type="button"
          className="ff-builder-button ff-builder-button-primary"
          onClick={handleDownload}
        >
          Download JSON
        </button>
      </div>
    </header>
  );
}
