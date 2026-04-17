import type { MultiSelectFieldSchema } from '@formflow/core';

import { FieldChrome } from './shared';
import type { FieldComponentProps } from './types';

export function MultiSelectField({
  field,
  value,
  error,
  onChange,
  onBlur,
}: FieldComponentProps): React.ReactNode {
  const multiSelectField = field as MultiSelectFieldSchema;
  const selectedValues = Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
  const variant = multiSelectField.ui?.variant ?? 'checkbox-group';

  const toggleValue = (next: string): void => {
    if (selectedValues.includes(next)) {
      onChange(selectedValues.filter((item) => item !== next));
      return;
    }

    onChange([...selectedValues, next]);
  };

  return (
    <FieldChrome field={field} error={error}>
      {() =>
        variant === 'pill-buttons' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {multiSelectField.options.map((option) => {
              const selected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  onBlur={onBlur}
                  style={{
                    border: `1px solid ${selected ? 'var(--ff-primary)' : 'var(--ff-border)'}`,
                    borderRadius: '9999px',
                    background: selected ? 'var(--ff-primary-light)' : 'var(--ff-bg-card)',
                    color: 'var(--ff-text)',
                    padding: '0.4rem 0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            {multiSelectField.options.map((option) => (
              <label
                key={option.value}
                style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => toggleValue(option.value)}
                  onBlur={onBlur}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )
      }
    </FieldChrome>
  );
}
