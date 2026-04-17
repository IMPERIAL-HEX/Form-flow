import type { TextFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export function TextField({
  field,
  value,
  error,
  onChange,
  onBlur,
}: FieldComponentProps): React.ReactNode {
  const textField = field as TextFieldSchema;

  return (
    <FieldChrome field={field} error={error}>
      {({ inputId, descriptionId, errorId }) => (
        <input
          id={inputId}
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
}
