'use client';

import { useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { StepSchema } from '@formflow/core';

interface StepCardProps {
  step: StepSchema;
  index: number;
  selected: boolean;
  canRemove: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onRename: (title: string) => void;
}

export function StepCard({
  step,
  index,
  selected,
  canRemove,
  onSelect,
  onRemove,
  onRename,
}: StepCardProps): React.ReactNode {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(step.title);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const commitRename = (): void => {
    const trimmed = draftTitle.trim();
    if (trimmed.length > 0 && trimmed !== step.title) {
      onRename(trimmed);
    } else {
      setDraftTitle(step.title);
    }
    setEditing(false);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`ff-builder-step-card ${selected ? 'ff-builder-step-card-active' : ''}`}
    >
      <button
        type="button"
        className="ff-builder-drag-handle"
        aria-label={`Reorder step ${step.title}`}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <button
        type="button"
        className="ff-builder-step-card-body"
        onClick={onSelect}
        onDoubleClick={() => setEditing(true)}
      >
        <span className="ff-builder-step-number">Step {index + 1}</span>
        {editing ? (
          <input
            autoFocus
            className="ff-builder-step-rename"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitRename();
              }
              if (event.key === 'Escape') {
                setDraftTitle(step.title);
                setEditing(false);
              }
            }}
            aria-label={`Rename step ${step.title}`}
          />
        ) : (
          <span className="ff-builder-step-title">{step.title}</span>
        )}
        <span className="ff-builder-step-count">{step.fields.length} field{step.fields.length === 1 ? '' : 's'}</span>
      </button>
      <button
        type="button"
        className="ff-builder-step-remove"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`Remove step ${step.title}`}
      >
        ×
      </button>
    </li>
  );
}
