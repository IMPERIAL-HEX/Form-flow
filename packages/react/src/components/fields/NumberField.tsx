import { forwardRef } from 'react';

import type { NumberFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export const NumberField = forwardRef<HTMLInputElement, FieldComponentProps>(function NumberField(
  { field, value, error, onChange, onBlur },
  ref,
) {
  const numberField = field as NumberFieldSchema;
  const numericValue = typeof value === 'number' ? value : value === '' ? '' : Number(value);

  const applyDelta = (delta: number): void => {
    const nextBase =
      typeof numericValue === 'number' && !Number.isNaN(numericValue) ? numericValue : 0;
    onChange(nextBase + delta);
  };

  const variant = numberField.ui?.variant ?? 'default';

  return (
    <FieldChrome field={field} error={error}>
      {({ inputId, descriptionId, errorId }) => (
        <div>
          {variant === 'stepper' ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => applyDelta(-(numberField.step ?? 1))}
                style={stepButtonStyle}
              >
                -
              </button>
              <input
                id={inputId}
                ref={ref}
                type="number"
                value={
                  typeof numericValue === 'number' && !Number.isNaN(numericValue)
                    ? numericValue
                    : ''
                }
                placeholder={numberField.placeholder}
                min={numberField.min}
                max={numberField.max}
                step={numberField.step}
                disabled={numberField.disabled}
                readOnly={numberField.readOnly}
                aria-required={Boolean(numberField.required)}
                aria-invalid={Boolean(error)}
                aria-describedby={getAriaDescribedBy(
                  descriptionId,
                  errorId,
                  Boolean(numberField.description),
                  Boolean(error),
                )}
                onBlur={onBlur}
                onChange={(event) => {
                  if (event.target.value === '') {
                    onChange(undefined);
                    return;
                  }
                  onChange(Number(event.target.value));
                }}
                style={sharedInputStyle}
              />
              <button
                type="button"
                onClick={() => applyDelta(numberField.step ?? 1)}
                style={stepButtonStyle}
              >
                +
              </button>
            </div>
          ) : (
            <input
              id={inputId}
              ref={ref}
              type="number"
              value={
                typeof numericValue === 'number' && !Number.isNaN(numericValue) ? numericValue : ''
              }
              placeholder={numberField.placeholder}
              min={numberField.min}
              max={numberField.max}
              step={numberField.step}
              disabled={numberField.disabled}
              readOnly={numberField.readOnly}
              aria-required={Boolean(numberField.required)}
              aria-invalid={Boolean(error)}
              aria-describedby={getAriaDescribedBy(
                descriptionId,
                errorId,
                Boolean(numberField.description),
                Boolean(error),
              )}
              onBlur={onBlur}
              onChange={(event) => {
                if (event.target.value === '') {
                  onChange(undefined);
                  return;
                }
                onChange(Number(event.target.value));
              }}
              style={sharedInputStyle}
            />
          )}
        </div>
      )}
    </FieldChrome>
  );
});

const stepButtonStyle: React.CSSProperties = {
  width: '2rem',
  height: '2rem',
  borderRadius: '9999px',
  border: '1px solid var(--ff-border)',
  background: 'var(--ff-bg-card)',
  color: 'var(--ff-text)',
  cursor: 'pointer',
};
