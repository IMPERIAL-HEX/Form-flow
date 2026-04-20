'use client';

import type { SelectOption } from '@formflow/core';

interface OptionListEditorProps {
  options: SelectOption[];
  onChange: (next: SelectOption[]) => void;
  label?: string;
}

export function OptionListEditor({
  options,
  onChange,
  label = 'Options',
}: OptionListEditorProps): React.ReactNode {
  const handleUpdate = (index: number, patch: Partial<SelectOption>): void => {
    const next = options.map((entry, i) => (i === index ? { ...entry, ...patch } : entry));
    onChange(next);
  };

  const handleAdd = (): void => {
    const n = options.length + 1;
    onChange([...options, { value: `option-${n}`, label: `Option ${n}` }]);
  };

  const handleRemove = (index: number): void => {
    if (options.length <= 1) return;
    onChange(options.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: -1 | 1): void => {
    const target = index + direction;
    if (target < 0 || target >= options.length) return;
    const next = [...options];
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(target, 0, moved);
    onChange(next);
  };

  return (
    <fieldset className="ff-builder-field-group">
      <legend>{label}</legend>
      <ul className="ff-builder-option-list">
        {options.map((option, index) => (
          <li key={index} className="ff-builder-option-row">
            <input
              className="ff-builder-input ff-builder-option-value"
              type="text"
              value={option.value}
              onChange={(event) => handleUpdate(index, { value: event.target.value })}
              aria-label={`Option ${index + 1} value`}
              placeholder="value"
            />
            <input
              className="ff-builder-input ff-builder-option-label"
              type="text"
              value={option.label}
              onChange={(event) => handleUpdate(index, { label: event.target.value })}
              aria-label={`Option ${index + 1} label`}
              placeholder="Label"
            />
            <div className="ff-builder-option-actions">
              <button
                type="button"
                className="ff-builder-icon-button"
                aria-label={`Move option ${index + 1} up`}
                onClick={() => handleMove(index, -1)}
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                type="button"
                className="ff-builder-icon-button"
                aria-label={`Move option ${index + 1} down`}
                onClick={() => handleMove(index, 1)}
                disabled={index === options.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                className="ff-builder-icon-button ff-builder-icon-danger"
                aria-label={`Remove option ${index + 1}`}
                onClick={() => handleRemove(index)}
                disabled={options.length <= 1}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="ff-builder-button ff-builder-button-subtle" onClick={handleAdd}>
        + Add option
      </button>
    </fieldset>
  );
}
