'use client';

import type { StepSchema } from '@formflow/core';

interface StepPropertiesProps {
  step: StepSchema;
  onUpdate: (patch: Partial<StepSchema>) => void;
}

export function StepProperties({ step, onUpdate }: StepPropertiesProps): React.ReactNode {
  return (
    <div className="ff-builder-properties-body">
      <h3 className="ff-builder-properties-heading">Step properties</h3>

      <label className="ff-builder-field-group">
        <span>Title</span>
        <input
          className="ff-builder-input"
          type="text"
          value={step.title}
          onChange={(event) => onUpdate({ title: event.target.value })}
        />
      </label>

      <label className="ff-builder-field-group">
        <span>Heading</span>
        <input
          className="ff-builder-input"
          type="text"
          value={step.heading ?? ''}
          placeholder="Optional header shown above the step"
          onChange={(event) =>
            onUpdate({ heading: event.target.value.length ? event.target.value : undefined })
          }
        />
      </label>

      <label className="ff-builder-field-group">
        <span>Description</span>
        <textarea
          className="ff-builder-input ff-builder-textarea"
          rows={3}
          value={step.description ?? ''}
          placeholder="Optional helper text"
          onChange={(event) =>
            onUpdate({
              description: event.target.value.length ? event.target.value : undefined,
            })
          }
        />
      </label>

      <label className="ff-builder-field-group">
        <span>Layout</span>
        <select
          className="ff-builder-input"
          value={step.layout ?? 'single-column'}
          onChange={(event) => onUpdate({ layout: event.target.value as StepSchema['layout'] })}
        >
          <option value="single-column">Single column</option>
          <option value="two-column">Two column</option>
        </select>
      </label>
    </div>
  );
}
