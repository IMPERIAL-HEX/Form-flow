'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { FormSchema } from '@formflow/core';
import { parseFormSchema } from '@formflow/core';

import {
  addField,
  addStep,
  createBlankSchema,
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

import { BuilderToolbar } from './components/BuilderToolbar';
import { FieldList } from './components/FieldList';
import { FieldPalette } from './components/FieldPalette';
import { PreviewDrawer } from './components/PreviewDrawer';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { StepList } from './components/StepList';

export function BuilderClient(): React.ReactNode {
  const [schema, setSchema] = useState<FormSchema>(() => createBlankSchema());
  const [selection, setSelection] = useState<BuilderSelection>({ kind: 'step', stepId: '' });
  const [isReady, setIsReady] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

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
    setSchema((prev) => {
      const next = addStep(prev);
      const newStep = next.steps[next.steps.length - 1];
      if (newStep) setSelection({ kind: 'step', stepId: newStep.id });
      return next;
    });
  };

  const handleRemoveStep = (stepId: string): void => {
    setSchema((prev) => {
      const next = removeStep(prev, stepId);
      if (next !== prev) {
        const fallback = next.steps[0];
        if (fallback) setSelection({ kind: 'step', stepId: fallback.id });
      }
      return next;
    });
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
    setSchema((prev) => {
      const next = addField(prev, selectedStepId, type);
      const step = next.steps.find((entry) => entry.id === selectedStepId);
      const newField = step?.fields[step.fields.length - 1];
      if (newField) setSelection({ kind: 'field', stepId: selectedStepId, fieldKey: newField.key });
      return next;
    });
  };

  const handleRemoveField = (stepId: string, fieldKey: string): void => {
    setSchema((prev) => {
      const next = removeField(prev, stepId, fieldKey);
      if (next !== prev) {
        setSelection({ kind: 'step', stepId });
      }
      return next;
    });
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
    setSchema((prev) => {
      const next = moveFieldToStep(prev, fieldKey, fromStepId, toStepId, toIndex);
      if (next !== prev) {
        setSelection({ kind: 'field', stepId: toStepId, fieldKey });
      }
      return next;
    });
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

  const previewSchema = useMemo(() => safeParseSchema(schema), [schema]);

  return (
    <main className="ff-builder-page" data-ready={isReady ? 'true' : 'false'}>
      <BuilderToolbar
        title={schema.title}
        onTitleChange={handleTitleChange}
        onOpenPreview={() => setPreviewOpen(true)}
        schema={schema}
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
