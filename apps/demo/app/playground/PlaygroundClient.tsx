'use client';

import { useEffect, useMemo, useState } from 'react';

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
  const [isReady, setIsReady] = useState(false);
  const [editorValue, setEditorValue] = useState(() =>
    prettyPrintSchema(getPresetById(INITIAL_PRESET_ID).schema),
  );
  const [submissionData, setSubmissionData] = useState<Record<string, unknown> | null>(null);

  const parsedSchema = useMemo(() => parseSchemaText(editorValue), [editorValue]);
  const schema: FormSchema | null = parsedSchema.schema;
  const error: string | null = parsedSchema.error;

  useEffect(() => {
    setIsReady(true);
  }, []);

  const handlePresetSelect = (presetId: string): void => {
    const preset = getPresetById(presetId);
    setActivePresetId(preset.id);
    setEditorValue(prettyPrintSchema(preset.schema));
    setSubmissionData(null);
  };

  return (
    <main className="ff-playground-page" data-ready={isReady ? 'true' : 'false'}>
      <header className="ff-playground-header">
        <p className="ff-eyebrow">Playground</p>
        <h1>Edit JSON and watch the form update live</h1>
        <p>
          This page parses your schema as you type. Invalid schemas stay in the editor and surface
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
