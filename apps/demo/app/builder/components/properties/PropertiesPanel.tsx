'use client';

import type { FieldSchema, FormSchema, StepSchema } from '@formflow/core';

import { findField, findStep } from '@/lib/builder/schemaMutations';
import type { BuilderSelection } from '@/lib/builder/types';

import { FieldProperties } from './FieldProperties';
import { StepProperties } from './StepProperties';

interface PropertiesPanelProps {
  schema: FormSchema;
  selection: BuilderSelection;
  onUpdateStep: (stepId: string, patch: Partial<StepSchema>) => void;
  onUpdateField: (stepId: string, fieldKey: string, patch: Partial<FieldSchema>) => void;
  onReplaceField: (stepId: string, fieldKey: string, nextField: FieldSchema) => void;
}

export function PropertiesPanel({
  schema,
  selection,
  onUpdateStep,
  onUpdateField,
  onReplaceField,
}: PropertiesPanelProps): React.ReactNode {
  const body = renderBody(schema, selection, onUpdateStep, onUpdateField, onReplaceField);

  return (
    <div className="ff-builder-panel ff-builder-panel-properties">
      <header className="ff-builder-panel-header">
        <h2>Properties</h2>
      </header>
      {body}
    </div>
  );
}

function renderBody(
  schema: FormSchema,
  selection: BuilderSelection,
  onUpdateStep: (stepId: string, patch: Partial<StepSchema>) => void,
  onUpdateField: (stepId: string, fieldKey: string, patch: Partial<FieldSchema>) => void,
  onReplaceField: (stepId: string, fieldKey: string, nextField: FieldSchema) => void,
): React.ReactNode {
  if (selection.kind === 'field') {
    const field = findField(schema, selection.stepId, selection.fieldKey);
    if (!field) {
      return <div className="ff-builder-empty">Field not found — it may have been removed.</div>;
    }
    return (
      <FieldProperties
        schema={schema}
        stepId={selection.stepId}
        field={field}
        onUpdate={(patch) => onUpdateField(selection.stepId, selection.fieldKey, patch)}
        onReplace={(nextField) =>
          onReplaceField(selection.stepId, selection.fieldKey, nextField)
        }
      />
    );
  }

  if (selection.kind === 'step') {
    const step = findStep(schema, selection.stepId);
    if (!step) {
      return <div className="ff-builder-empty">Select a step to edit its properties.</div>;
    }
    return <StepProperties step={step} onUpdate={(patch) => onUpdateStep(step.id, patch)} />;
  }

  return <div className="ff-builder-empty">Select a step or field to edit its properties.</div>;
}
