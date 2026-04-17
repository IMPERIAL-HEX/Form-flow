import { forwardRef } from 'react';

import type { SelectFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export const SelectField = forwardRef<HTMLSelectElement, FieldComponentProps>(function SelectField(
  { field, value, error, onChange, onBlur },
  ref,
) {
  const selectField = field as SelectFieldSchema;
  const selectedValue = typeof value === 'string' ? value : '';
  const variant = selectField.ui?.variant ?? 'dropdown';

  return (
    <FieldChrome field={field} error={error}>
      {({ inputId, descriptionId, errorId }) => {
        if (variant === 'dropdown') {
          return (
            <select
              id={inputId}
              ref={ref}
              value={selectedValue}
              disabled={selectField.disabled || selectField.readOnly}
              aria-required={Boolean(selectField.required)}
              aria-invalid={Boolean(error)}
              aria-describedby={getAriaDescribedBy(
                descriptionId,
                errorId,
                Boolean(selectField.description),
                Boolean(error),
              )}
              onBlur={onBlur}
              onChange={(event) => onChange(event.target.value)}
              style={sharedInputStyle}
            >
              <option value="">Select an option</option>
              {selectField.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }

        if (variant === 'radio-group') {
          return (
            <div
              role="radiogroup"
              aria-describedby={getAriaDescribedBy(
                descriptionId,
                errorId,
                Boolean(selectField.description),
                Boolean(error),
              )}
            >
              {selectField.options.map((option) => (
                <label
                  key={option.value}
                  style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}
                >
                  <input
                    type="radio"
                    name={inputId}
                    checked={selectedValue === option.value}
                    onChange={() => onChange(option.value)}
                    onBlur={onBlur}
                    disabled={selectField.disabled || selectField.readOnly}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          );
        }

        const cardLike = variant === 'icon-cards';

        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: cardLike
                ? 'repeat(2, minmax(0, 1fr))'
                : 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '0.625rem',
            }}
          >
            {selectField.options.map((option) => {
              const selected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange(option.value)}
                  onBlur={onBlur}
                  disabled={selectField.disabled || selectField.readOnly}
                  style={{
                    textAlign: 'left',
                    border: `1px solid ${selected ? 'var(--ff-primary)' : 'var(--ff-border)'}`,
                    borderRadius: 'var(--ff-radius)',
                    background: selected ? 'var(--ff-primary-light)' : 'var(--ff-bg-card)',
                    padding: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {option.icon ? (
                    <div style={{ marginBottom: '0.35rem' }}>{option.icon}</div>
                  ) : null}
                  <div style={{ fontWeight: 500 }}>{option.label}</div>
                  {option.description ? (
                    <div style={{ color: 'var(--ff-text-muted)', fontSize: '0.875rem' }}>
                      {option.description}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        );
      }}
    </FieldChrome>
  );
});
