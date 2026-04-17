import type { DateFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export function DateField({
  field,
  value,
  error,
  onChange,
  onBlur,
}: FieldComponentProps): React.ReactNode {
  const dateField = field as DateFieldSchema;

  return (
    <FieldChrome field={field} error={error}>
      {({ inputId, descriptionId, errorId }) => (
        <input
          id={inputId}
          type="date"
          value={typeof value === 'string' ? value : ''}
          min={dateField.minDate}
          max={dateField.maxDate}
          disabled={dateField.disabled}
          readOnly={dateField.readOnly}
          aria-required={Boolean(dateField.required)}
          aria-invalid={Boolean(error)}
          aria-describedby={getAriaDescribedBy(
            descriptionId,
            errorId,
            Boolean(dateField.description),
            Boolean(error),
          )}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          style={sharedInputStyle}
        />
      )}
    </FieldChrome>
  );
}
