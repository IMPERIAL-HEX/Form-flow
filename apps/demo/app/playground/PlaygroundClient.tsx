'use client';

import { useEffect, useState } from 'react';

import type { FormSchema } from '@formflow/core';

import { getPresetById, schemaPresets } from '@/lib/schemas/presetSchemas';
import { parseSchemaText, prettyPrintSchema } from '@/lib/schemas/schemaUtils';

import { ErrorPanel } from './components/ErrorPanel';
import { PresetTabs } from './components/PresetTabs';
import { PreviewPanel } from './components/PreviewPanel';
import { SchemaEditor } from './components/SchemaEditor';

const INITIAL_PRESET_ID = 'education-loan';

export function PlaygroundClient(): React.ReactNode {
  const [activePresetId, setActivePresetId] = useState(INITIAL_PRESET_ID);
  const [editorValue, setEditorValue] = useState(() =>
    prettyPrintSchema(getPresetById(INITIAL_PRESET_ID).schema),
  );
  const [schema, setSchema] = useState<FormSchema | null>(
    () => getPresetById(INITIAL_PRESET_ID).schema,
  );
  const [error, setError] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const result = parseSchemaText(editorValue);
      setSchema(result.schema);
      setError(result.error);
    }, 300);

    return () => {
      window.clearTimeout(handle);
    };
  }, [editorValue]);

  const handlePresetSelect = (presetId: string): void => {
    const preset = getPresetById(presetId);
    setActivePresetId(preset.id);
    setEditorValue(prettyPrintSchema(preset.schema));
    setSchema(preset.schema);
    setError(null);
    setSubmissionData(null);
  };

  return (
    <main className="ff-playground-page">
      <header className="ff-playground-header">
        <p className="ff-eyebrow">Playground</p>
        <h1>Edit JSON and watch the form update live</h1>
        <p>
          This page parses your schema every 300ms. Invalid schemas stay in the editor and surface
          parser errors without crashing the preview.
        </p>
      </header>

      <section className="ff-playground-grid">
        <section className="ff-editor-pane" aria-label="Schema editor pane">
          <PresetTabs
            presets={schemaPresets}
            activePresetId={activePresetId}
            onSelect={handlePresetSelect}
          />
          <SchemaEditor value={editorValue} onChange={setEditorValue} />
          <ErrorPanel error={error} />
        </section>

        <PreviewPanel
          schema={schema}
          submissionData={submissionData}
          onSubmit={(payload) => setSubmissionData(payload)}
        />
      </section>
    </main>
  );
}
