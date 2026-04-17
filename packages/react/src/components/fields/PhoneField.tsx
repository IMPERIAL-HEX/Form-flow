import type { PhoneFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

const COUNTRY_CODES = ['+44', '+1', '+61', '+91'] as const;

export function PhoneField({
  field,
  value,
  error,
  onChange,
  onBlur,
}: FieldComponentProps): React.ReactNode {
  const phoneField = field as PhoneFieldSchema;
  const { countryCode, number } = splitPhoneValue(value, phoneField.defaultCountryCode);

  const emit = (code: string, next: string): void => {
    onChange(next ? `${code} ${next}`.trim() : '');
  };

  return (
    <FieldChrome field={field} error={error}>
      {({ inputId, descriptionId, errorId }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
          <select
            value={countryCode}
            onChange={(event) => emit(event.target.value, number)}
            onBlur={onBlur}
            style={sharedInputStyle}
            aria-label="Country code"
          >
            {COUNTRY_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          <input
            id={inputId}
            type="tel"
            value={number}
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
            onChange={(event) => emit(countryCode, event.target.value)}
            style={sharedInputStyle}
          />
        </div>
      )}
    </FieldChrome>
  );
}

function splitPhoneValue(
  value: unknown,
  defaultCountryCode?: string,
): { countryCode: string; number: string } {
  const fallbackCode = defaultCountryCode ?? '+44';

  if (typeof value !== 'string' || value.length === 0) {
    return { countryCode: fallbackCode, number: '' };
  }

  for (const code of COUNTRY_CODES) {
    if (value.startsWith(code)) {
      return { countryCode: code, number: value.slice(code.length).trimStart() };
    }
  }

  return { countryCode: fallbackCode, number: value };
}
