'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { FormSchema } from '@formflow/core';
import { parseFormSchema } from '@formflow/core';

import {
  addField,
  addStep,
  moveField,
  moveFieldToStep,
  moveStep,
  removeField,
  removeStep,
  replaceField,
  updateField,
  updateStep,
} from '@/lib/builder/schemaMutations';
import type { BuilderSelection } from '@/lib/builder/types';
import type { FieldType } from '@/lib/builder/fieldTypeMeta';
import type { FieldSchema } from '@formflow/core';

import { BuilderToolbar, type SaveStatus } from './components/BuilderToolbar';
import { FieldList } from './components/FieldList';
import { FieldPalette } from './components/FieldPalette';
import { PreviewDrawer } from './components/PreviewDrawer';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { StepList } from './components/StepList';

interface BuilderClientProps {
  initialSchema: FormSchema;
  schemaId: string;
}

export function BuilderClient({ initialSchema, schemaId }: BuilderClientProps): React.ReactNode {
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [selection, setSelection] = useState<BuilderSelection>({
    kind: 'step',
    stepId: initialSchema.steps[0]?.id ?? '',
  });
  const [isReady, setIsReady] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('clean');
  const [dirty, setDirty] = useState(false);
  const lastSavedRef = useRef<string>(JSON.stringify(initialSchema));

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    setDirty(JSON.stringify(schema) !== lastSavedRef.current);
  }, [schema]);

  useEffect(() => {
    if (selection.kind === 'step' && !selection.stepId && schema.steps[0]) {
      setSelection({ kind: 'step', stepId: schema.steps[0].id });
    }
  }, [selection, schema.steps]);

  const selectedStepId = selectionStepId(selection, schema);
  const selectedStep = useMemo(
    () => schema.steps.find((step) => step.id === selectedStepId),
    [schema.steps, selectedStepId],
  );

  const handleTitleChange = (title: string): void => {
    setSchema((prev) => ({ ...prev, title }));
  };

  const handleAddStep = (): void => {
    const next = addStep(schema);
    const newStep = next.steps[next.steps.length - 1];
    setSchema(next);
    if (newStep) setSelection({ kind: 'step', stepId: newStep.id });
  };

  const handleRemoveStep = (stepId: string): void => {
    const next = removeStep(schema, stepId);
    if (next === schema) return;
    const fallback = next.steps[0];
    setSchema(next);
    if (fallback) setSelection({ kind: 'step', stepId: fallback.id });
  };

  const handleSelectStep = (stepId: string): void => {
    setSelection({ kind: 'step', stepId });
  };

  const handleReorderSteps = (fromIndex: number, toIndex: number): void => {
    setSchema((prev) => moveStep(prev, fromIndex, toIndex));
  };

  const handleUpdateStep = (stepId: string, patch: { title?: string; description?: string; heading?: string }): void => {
    setSchema((prev) => updateStep(prev, stepId, patch));
  };

  const handleAddField = (type: FieldType): void => {
    if (!selectedStepId) return;
    const next = addField(schema, selectedStepId, type);
    const step = next.steps.find((entry) => entry.id === selectedStepId);
    const newField = step?.fields[step.fields.length - 1];
    setSchema(next);
    if (newField) setSelection({ kind: 'field', stepId: selectedStepId, fieldKey: newField.key });
  };

  const handleRemoveField = (stepId: string, fieldKey: string): void => {
    const next = removeField(schema, stepId, fieldKey);
    if (next === schema) return;
    setSchema(next);
    setSelection({ kind: 'step', stepId });
  };

  const handleSelectField = (stepId: string, fieldKey: string): void => {
    setSelection({ kind: 'field', stepId, fieldKey });
  };

  const handleReorderFields = (stepId: string, fromIndex: number, toIndex: number): void => {
    setSchema((prev) => moveField(prev, stepId, fromIndex, toIndex));
  };

  const handleMoveFieldToStep = (
    fieldKey: string,
    fromStepId: string,
    toStepId: string,
    toIndex: number,
  ): void => {
    const next = moveFieldToStep(schema, fieldKey, fromStepId, toStepId, toIndex);
    if (next === schema) return;
    setSchema(next);
    setSelection({ kind: 'field', stepId: toStepId, fieldKey });
  };

  const handleUpdateField = useCallback(
    (stepId: string, fieldKey: string, patch: Partial<FieldSchema>): void => {
      setSchema((prev) => updateField(prev, stepId, fieldKey, patch));
      if (patch.key && patch.key !== fieldKey) {
        setSelection({ kind: 'field', stepId, fieldKey: patch.key });
      }
    },
    [],
  );

  const handleReplaceField = useCallback(
    (stepId: string, fieldKey: string, nextField: FieldSchema): void => {
      setSchema((prev) => replaceField(prev, stepId, fieldKey, nextField));
      if (nextField.key !== fieldKey) {
        setSelection({ kind: 'field', stepId, fieldKey: nextField.key });
      }
    },
    [],
  );

  const handleSave = useCallback(async (): Promise<void> => {
    setSaveStatus('saving');
    try {
      const response = await fetch(`/api/builder-schemas/${schemaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schema),
      });
      if (!response.ok) {
        setSaveStatus('error');
        return;
      }
      lastSavedRef.current = JSON.stringify(schema);
      setDirty(false);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [schema, schemaId]);

  const handleDelete = useCallback(async (): Promise<void> => {
    const confirmed = typeof window !== 'undefined' && window.confirm('Delete this form?');
    if (!confirmed) return;
    const response = await fetch(`/api/builder-schemas/${schemaId}`, { method: 'DELETE' });
    if (response.ok) {
      router.push('/builder');
    }
  }, [router, schemaId]);

  const previewSchema = useMemo(() => safeParseSchema(schema), [schema]);

  if (!isReady) {
    return (
      <main className="ff-builder-page" data-ready="false">
        <div className="ff-builder-empty">Loading builder…</div>
      </main>
    );
  }

  return (
    <main className="ff-builder-page" data-ready="true">
      <BuilderToolbar
        title={schema.title}
        schemaId={schemaId}
        onTitleChange={handleTitleChange}
        onOpenPreview={() => setPreviewOpen(true)}
        onSave={handleSave}
        onDelete={handleDelete}
        onBackToList={() => router.push('/builder')}
        schema={schema}
        saveStatus={saveStatus}
        dirty={dirty}
      />

      <div className="ff-builder-grid">
        <aside className="ff-builder-steps" aria-label="Steps panel">
          <StepList
            steps={schema.steps}
            selection={selection}
            onSelectStep={handleSelectStep}
            onReorder={handleReorderSteps}
            onAddStep={handleAddStep}
            onRemoveStep={handleRemoveStep}
            onUpdateStep={handleUpdateStep}
          />
        </aside>

        <section className="ff-builder-fields" aria-label="Fields panel">
          {selectedStep ? (
            <>
              <FieldList
                step={selectedStep}
                allSteps={schema.steps}
                selection={selection}
                onSelectField={handleSelectField}
                onReorder={(from, to) => handleReorderFields(selectedStep.id, from, to)}
                onRemoveField={(fieldKey) => handleRemoveField(selectedStep.id, fieldKey)}
                onMoveFieldToStep={handleMoveFieldToStep}
              />
              <FieldPalette onAddField={handleAddField} />
            </>
          ) : (
            <div className="ff-builder-empty">Select a step to see its fields.</div>
          )}
        </section>

        <aside className="ff-builder-properties" aria-label="Properties panel">
          <PropertiesPanel
            schema={schema}
            selection={selection}
            onUpdateStep={handleUpdateStep}
            onUpdateField={handleUpdateField}
            onReplaceField={handleReplaceField}
          />
        </aside>
      </div>

      <PreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        schema={previewSchema.schema}
        error={previewSchema.error}
      />
    </main>
  );
}

function selectionStepId(selection: BuilderSelection, schema: FormSchema): string | undefined {
  if (selection.kind === 'step') return selection.stepId || schema.steps[0]?.id;
  if (selection.kind === 'field') return selection.stepId;
  return schema.steps[0]?.id;
}

interface SafeParsed {
  schema: FormSchema | null;
  error: string | null;
}

function safeParseSchema(schema: FormSchema): SafeParsed {
  try {
    const parsed = parseFormSchema(schema) as FormSchema;
    return { schema: parsed, error: null };
  } catch (error) {
    return { schema: null, error: error instanceof Error ? error.message : 'Invalid schema' };
  }
}
