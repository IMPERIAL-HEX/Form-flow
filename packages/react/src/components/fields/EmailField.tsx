import type { EmailFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export function EmailField({
  field,
  value,
  error,
  onChange,
  onBlur,
}: FieldComponentProps): React.ReactNode {
  const emailField = field as EmailFieldSchema;

  return (
    <FieldChrome field={field} error={error}>
      {({ inputId, descriptionId, errorId }) => (
        <input
          id={inputId}
          type="email"
          value={typeof value === 'string' ? value : ''}
          placeholder={emailField.placeholder}
          disabled={emailField.disabled}
          readOnly={emailField.readOnly}
          aria-required={Boolean(emailField.required)}
          aria-invalid={Boolean(error)}
          aria-describedby={getAriaDescribedBy(
            descriptionId,
            errorId,
            Boolean(emailField.description),
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
