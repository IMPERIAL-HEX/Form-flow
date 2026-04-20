'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { FieldSchema, StepSchema } from '@formflow/core';

import { FIELD_TYPE_META } from '@/lib/builder/fieldTypeMeta';

interface FieldCardProps {
  field: FieldSchema;
  selected: boolean;
  canRemove: boolean;
  otherSteps: StepSchema[];
  onSelect: () => void;
  onRemove: () => void;
  onMoveToStep: (toStepId: string) => void;
}

export function FieldCard({
  field,
  selected,
  canRemove,
  otherSteps,
  onSelect,
  onRemove,
  onMoveToStep,
}: FieldCardProps): React.ReactNode {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.key,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const meta = FIELD_TYPE_META[field.type];

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`ff-builder-field-card ${selected ? 'ff-builder-field-card-active' : ''}`}
    >
      <button
        type="button"
        className="ff-builder-drag-handle"
        aria-label={`Reorder ${field.label}`}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <button type="button" className="ff-builder-field-card-body" onClick={onSelect}>
        <span className="ff-builder-field-glyph" aria-hidden="true">
          {meta.glyph}
        </span>
        <span className="ff-builder-field-text">
          <span className="ff-builder-field-label">{field.label}</span>
          <span className="ff-builder-field-meta">
            {meta.label} • {field.key}
          </span>
        </span>
      </button>
      <div className="ff-builder-field-actions">
        {otherSteps.length > 0 ? (
          <select
            className="ff-builder-field-move"
            aria-label={`Move ${field.label} to another step`}
            value=""
            onChange={(event) => {
              const value = event.target.value;
              if (value) onMoveToStep(value);
            }}
          >
            <option value="">Move to…</option>
            {otherSteps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.title}
              </option>
            ))}
          </select>
        ) : null}
        <button
          type="button"
          className="ff-builder-field-remove"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Remove ${field.label}`}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
