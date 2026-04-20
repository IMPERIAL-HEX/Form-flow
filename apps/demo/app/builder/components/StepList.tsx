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
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { StepSchema } from '@formflow/core';

import type { BuilderSelection } from '@/lib/builder/types';

import { StepCard } from './StepCard';

interface StepListProps {
  steps: StepSchema[];
  selection: BuilderSelection;
  onSelectStep: (stepId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddStep: () => void;
  onRemoveStep: (stepId: string) => void;
  onUpdateStep: (stepId: string, patch: { title?: string }) => void;
}

export function StepList({
  steps,
  selection,
  onSelectStep,
  onReorder,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
}: StepListProps): React.ReactNode {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = steps.findIndex((step) => step.id === active.id);
    const toIndex = steps.findIndex((step) => step.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    const nextIds = arrayMove(steps.map((step) => step.id), fromIndex, toIndex);
    void nextIds;
    onReorder(fromIndex, toIndex);
  };

  const selectedStepId = selection.kind === 'step'
    ? selection.stepId
    : selection.kind === 'field'
      ? selection.stepId
      : undefined;

  return (
    <div className="ff-builder-panel">
      <header className="ff-builder-panel-header">
        <h2>Steps</h2>
        <button type="button" className="ff-builder-panel-add" onClick={onAddStep}>
          + Add step
        </button>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
          <ol className="ff-builder-step-list">
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                selected={step.id === selectedStepId}
                canRemove={steps.length > 1}
                onSelect={() => onSelectStep(step.id)}
                onRemove={() => onRemoveStep(step.id)}
                onRename={(title) => onUpdateStep(step.id, { title })}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}
