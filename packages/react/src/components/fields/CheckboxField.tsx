import { forwardRef } from 'react';

import type { CheckboxFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy } from './shared';
import type { FieldComponentProps } from './types';

export const CheckboxField = forwardRef<HTMLInputElement, FieldComponentProps>(
  function CheckboxField({ field, value, error, onChange, onBlur }, ref) {
    const checkboxField = field as CheckboxFieldSchema;

    return (
      <FieldChrome field={field} error={error}>
        {({ inputId, descriptionId, errorId }) => (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input
              id={inputId}
              ref={ref}
              type="checkbox"
              checked={Boolean(value)}
              disabled={checkboxField.disabled || checkboxField.readOnly}
              aria-required={Boolean(checkboxField.required)}
              aria-invalid={Boolean(error)}
              aria-describedby={getAriaDescribedBy(
                descriptionId,
                errorId,
                Boolean(checkboxField.description),
                Boolean(error),
              )}
              onBlur={onBlur}
              onChange={(event) => onChange(event.target.checked)}
            />
            <span>{checkboxField.label}</span>
          </label>
        )}
      </FieldChrome>
    );
  },
);
