import { forwardRef } from 'react';

import type { TextAreaFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export const TextAreaField = forwardRef<HTMLTextAreaElement, FieldComponentProps>(
  function TextAreaField({ field, value, error, onChange, onBlur }, ref) {
    const textAreaField = field as TextAreaFieldSchema;

    return (
      <FieldChrome field={field} error={error}>
        {({ inputId, descriptionId, errorId }) => (
          <textarea
            id={inputId}
            ref={ref}
            value={typeof value === 'string' ? value : ''}
            placeholder={textAreaField.placeholder}
            rows={textAreaField.rows ?? 4}
            minLength={textAreaField.minLength}
            maxLength={textAreaField.maxLength}
            disabled={textAreaField.disabled}
            readOnly={textAreaField.readOnly}
            aria-required={Boolean(textAreaField.required)}
            aria-invalid={Boolean(error)}
            aria-describedby={getAriaDescribedBy(
              descriptionId,
              errorId,
              Boolean(textAreaField.description),
              Boolean(error),
            )}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            style={{ ...sharedInputStyle, resize: 'vertical' }}
          />
        )}
      </FieldChrome>
    );
  },
);
