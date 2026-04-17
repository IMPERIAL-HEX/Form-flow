import { forwardRef } from 'react';

import type { PhoneFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

interface PhoneValue {
  countryCode: string;
  number: string;
}

export const PhoneField = forwardRef<HTMLInputElement, FieldComponentProps>(function PhoneField(
  { field, value, error, onChange, onBlur },
  ref,
) {
  const phoneField = field as PhoneFieldSchema;
  const phoneValue = normalizePhoneValue(value, phoneField.defaultCountryCode);

  return (
    <FieldChrome field={field} error={error}>
      {({ inputId, descriptionId, errorId }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
          <select
            value={phoneValue.countryCode}
            onChange={(event) => onChange({ ...phoneValue, countryCode: event.target.value })}
            onBlur={onBlur}
            style={sharedInputStyle}
          >
            {['+44', '+1', '+61', '+91'].map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          <input
            id={inputId}
            ref={ref}
            type="tel"
            value={phoneValue.number}
            placeholder={phoneField.placeholder ?? '7700 900123'}
            disabled={phoneField.disabled}
            readOnly={phoneField.readOnly}
            aria-required={Boolean(phoneField.required)}
            aria-invalid={Boolean(error)}
            aria-describedby={getAriaDescribedBy(
              descriptionId,
              errorId,
              Boolean(phoneField.description),
              Boolean(error),
            )}
            onBlur={onBlur}
            onChange={(event) => onChange({ ...phoneValue, number: event.target.value })}
            style={sharedInputStyle}
          />
        </div>
      )}
    </FieldChrome>
  );
});

function normalizePhoneValue(value: unknown, defaultCountryCode?: string): PhoneValue {
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const code =
      typeof record.countryCode === 'string' ? record.countryCode : (defaultCountryCode ?? '+44');
    const number = typeof record.number === 'string' ? record.number : '';

    return { countryCode: code, number };
  }

  if (typeof value === 'string') {
    return { countryCode: defaultCountryCode ?? '+44', number: value };
  }

  return { countryCode: defaultCountryCode ?? '+44', number: '' };
}
