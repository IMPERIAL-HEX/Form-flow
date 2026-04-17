import { forwardRef } from 'react';

import type { TextFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export const TextField = forwardRef<HTMLInputElement, FieldComponentProps>(function TextField(
  { field, value, error, onChange, onBlur },
  ref,
) {
  const textField = field as TextFieldSchema;

  return (
    <FieldChrome field={field} error={error}>
      {({ inputId, descriptionId, errorId }) => (
        <input
          id={inputId}
          ref={ref}
          type="text"
          value={typeof value === 'string' ? value : ''}
          placeholder={textField.placeholder}
          minLength={textField.minLength}
          maxLength={textField.maxLength}
          pattern={textField.pattern}
          disabled={textField.disabled}
          readOnly={textField.readOnly}
          aria-required={Boolean(textField.required)}
          aria-invalid={Boolean(error)}
          aria-describedby={getAriaDescribedBy(
            descriptionId,
            errorId,
            Boolean(textField.description),
            Boolean(error),
          )}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          style={sharedInputStyle}
        />
      )}
    </FieldChrome>
  );
});
