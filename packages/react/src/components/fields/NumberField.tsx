import type { NumberFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export function NumberField({
  field,
  value,
  error,
  onChange,
  onBlur,
}: FieldComponentProps): React.ReactNode {
  const numberField = field as NumberFieldSchema;
  const numericValue = typeof value === 'number' ? value : value === '' ? '' : Number(value);
  const displayValue =
    typeof numericValue === 'number' && !Number.isNaN(numericValue) ? numericValue : '';

  const applyDelta = (delta: number): void => {
    const nextBase =
      typeof numericValue === 'number' && !Number.isNaN(numericValue) ? numericValue : 0;
    onChange(nextBase + delta);
  };

  const variant = numberField.ui?.variant ?? 'default';

  const inputProps = {
    type: 'number' as const,
    value: displayValue,
    placeholder: numberField.placeholder,
    min: numberField.min,
    max: numberField.max,
    step: numberField.step,
    disabled: numberField.disabled,
    readOnly: numberField.readOnly,
    'aria-required': Boolean(numberField.required),
    'aria-invalid': Boolean(error),
    onBlur,
    onChange: (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (event.target.value === '') {
        onChange(undefined);
        return;
      }
      onChange(Number(event.target.value));
    },
    style: sharedInputStyle,
  };

  return (
    <FieldChrome field={field} error={error}>
      {({ inputId, descriptionId, errorId }) => {
        const describedBy = getAriaDescribedBy(
          descriptionId,
          errorId,
          Boolean(numberField.description),
          Boolean(error),
        );

        if (variant === 'stepper') {
          return (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => applyDelta(-(numberField.step ?? 1))}
                style={stepButtonStyle}
              >
                -
              </button>
              <input id={inputId} aria-describedby={describedBy} {...inputProps} />
              <button
                type="button"
                onClick={() => applyDelta(numberField.step ?? 1)}
                style={stepButtonStyle}
              >
                +
              </button>
            </div>
          );
        }

        return <input id={inputId} aria-describedby={describedBy} {...inputProps} />;
      }}
    </FieldChrome>
  );
}

const stepButtonStyle: React.CSSProperties = {
  width: '2rem',
  height: '2rem',
  borderRadius: '9999px',
  border: '1px solid var(--ff-border)',
  background: 'var(--ff-bg-card)',
  color: 'var(--ff-text)',
  cursor: 'pointer',
};
