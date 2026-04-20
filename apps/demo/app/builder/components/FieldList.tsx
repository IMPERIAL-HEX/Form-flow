'use client';

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { StepSchema } from '@formflow/core';

import type { BuilderSelection } from '@/lib/builder/types';

import { FieldCard } from './FieldCard';

interface FieldListProps {
  step: StepSchema;
  allSteps: StepSchema[];
  selection: BuilderSelection;
  onSelectField: (stepId: string, fieldKey: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemoveField: (fieldKey: string) => void;
  onMoveFieldToStep: (
    fieldKey: string,
    fromStepId: string,
    toStepId: string,
    toIndex: number,
  ) => void;
}

export function FieldList({
  step,
  allSteps,
  selection,
  onSelectField,
  onReorder,
  onRemoveField,
  onMoveFieldToStep,
}: FieldListProps): React.ReactNode {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = step.fields.findIndex((field) => field.key === active.id);
    const toIndex = step.fields.findIndex((field) => field.key === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    onReorder(fromIndex, toIndex);
  };

  const selectedFieldKey = selection.kind === 'field' && selection.stepId === step.id
    ? selection.fieldKey
    : undefined;

  const otherSteps = allSteps.filter((entry) => entry.id !== step.id);

  return (
    <div className="ff-builder-panel">
      <header className="ff-builder-panel-header">
        <h2>Fields — {step.title}</h2>
        <span className="ff-builder-panel-meta">{step.fields.length} total</span>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={step.fields.map((field) => field.key)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="ff-builder-field-list">
            {step.fields.map((field) => (
              <FieldCard
                key={field.key}
                field={field}
                selected={field.key === selectedFieldKey}
                canRemove={step.fields.length > 1}
                otherSteps={otherSteps}
                onSelect={() => onSelectField(step.id, field.key)}
                onRemove={() => onRemoveField(field.key)}
                onMoveToStep={(toStepId) =>
                  onMoveFieldToStep(field.key, step.id, toStepId, Number.MAX_SAFE_INTEGER)
                }
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}
