'use client';

import type { FieldSchema, FormSchema, StepSchema } from '@formflow/core';

import type { BuilderSelection } from '@/lib/builder/types';

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
  void schema;
  void selection;
  void onUpdateStep;
  void onUpdateField;
  void onReplaceField;

  return (
    <div className="ff-builder-panel">
      <header className="ff-builder-panel-header">
        <h2>Properties</h2>
      </header>
      <div className="ff-builder-empty">Property editor coming in next commit.</div>
    </div>
  );
}
