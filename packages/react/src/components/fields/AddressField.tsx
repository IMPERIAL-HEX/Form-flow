import { forwardRef } from 'react';

import type { AddressFieldSchema, AddressValue } from '@formflow/core';

import { FieldChrome, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export const AddressField = forwardRef<HTMLInputElement, FieldComponentProps>(function AddressField(
  { field, value, error, onChange, onBlur },
  ref,
) {
  const addressField = field as AddressFieldSchema;
  const address = normalizeAddress(value);

  const updateAddress = (patch: Partial<AddressValue>): void => {
    onChange({
      ...address,
      ...patch,
    });
  };

  return (
    <FieldChrome field={field} error={error}>
      {() => (
        <div style={{ display: 'grid', gap: '0.625rem' }}>
          <input
            ref={ref}
            type="text"
            placeholder="Address line 1"
            value={address.line1}
            onBlur={onBlur}
            onChange={(event) => updateAddress({ line1: event.target.value })}
            style={sharedInputStyle}
          />

          {addressField.includeLine2 !== false ? (
            <input
              type="text"
              placeholder="Address line 2"
              value={address.line2 ?? ''}
              onBlur={onBlur}
              onChange={(event) => updateAddress({ line2: event.target.value })}
              style={sharedInputStyle}
            />
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <input
              type="text"
              placeholder="City"
              value={address.city}
              onBlur={onBlur}
              onChange={(event) => updateAddress({ city: event.target.value })}
              style={sharedInputStyle}
            />
            <input
              type="text"
              placeholder={addressField.regionLabel ?? 'Region'}
              value={address.region}
              onBlur={onBlur}
              onChange={(event) => updateAddress({ region: event.target.value })}
              style={sharedInputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <input
              type="text"
              placeholder={addressField.postcodeLabel ?? 'Postcode'}
              value={address.postcode}
              onBlur={onBlur}
              onChange={(event) => updateAddress({ postcode: event.target.value })}
              style={sharedInputStyle}
            />
            <input
              type="text"
              placeholder="Country"
              value={address.country}
              onBlur={onBlur}
              onChange={(event) => updateAddress({ country: event.target.value })}
              style={sharedInputStyle}
            />
          </div>
        </div>
      )}
    </FieldChrome>
  );
});

function normalizeAddress(value: unknown): AddressValue {
  if (!value || typeof value !== 'object') {
    return {
      line1: '',
      line2: '',
      city: '',
      region: '',
      postcode: '',
      country: '',
    };
  }

  const record = value as Record<string, unknown>;
  return {
    line1: typeof record.line1 === 'string' ? record.line1 : '',
    line2: typeof record.line2 === 'string' ? record.line2 : '',
    city: typeof record.city === 'string' ? record.city : '',
    region: typeof record.region === 'string' ? record.region : '',
    postcode: typeof record.postcode === 'string' ? record.postcode : '',
    country: typeof record.country === 'string' ? record.country : '',
  };
}
