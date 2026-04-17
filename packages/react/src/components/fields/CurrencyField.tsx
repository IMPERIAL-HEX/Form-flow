import { forwardRef } from 'react';

import type { CurrencyFieldSchema } from '@formflow/core';

import { FieldChrome, getAriaDescribedBy, sharedInputStyle } from './shared';
import type { FieldComponentProps } from './types';

export const CurrencyField = forwardRef<HTMLInputElement, FieldComponentProps>(
  function CurrencyField({ field, value, error, onChange, onBlur }, ref) {
    const currencyField = field as CurrencyFieldSchema;
    const variant = currencyField.ui?.variant ?? 'simple-input';
    const numericValue =
      typeof value === 'number' && !Number.isNaN(value)
        ? value
        : Math.min(Math.max(currencyField.min, 0), currencyField.max);

    const symbol = getCurrencySymbol(currencyField.currency);

    return (
      <FieldChrome field={field} error={error}>
        {({ inputId, descriptionId, errorId }) => (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {variant === 'stepper-with-slider' ? (
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      Math.max(currencyField.min, numericValue - (currencyField.step ?? 100)),
                    )
                  }
                  style={stepButtonStyle}
                >
                  -
                </button>
              ) : null}

              <div style={{ position: 'relative', flex: 1 }}>
                <span style={currencySymbolStyle}>{symbol}</span>
                <input
                  id={inputId}
                  ref={ref}
                  type="number"
                  value={numericValue}
                  min={currencyField.min}
                  max={currencyField.max}
                  step={currencyField.step ?? 100}
                  disabled={currencyField.disabled}
                  readOnly={currencyField.readOnly}
                  aria-required={Boolean(currencyField.required)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={getAriaDescribedBy(
                    descriptionId,
                    errorId,
                    Boolean(currencyField.description),
                    Boolean(error),
                  )}
                  onBlur={onBlur}
                  onChange={(event) => onChange(Number(event.target.value))}
                  style={{ ...sharedInputStyle, paddingLeft: '2rem' }}
                />
              </div>

              {variant === 'stepper-with-slider' ? (
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      Math.min(currencyField.max, numericValue + (currencyField.step ?? 100)),
                    )
                  }
                  style={stepButtonStyle}
                >
                  +
                </button>
              ) : null}
            </div>

            {(variant === 'stepper-with-slider' || variant === 'slider-with-quick-select') && (
              <input
                type="range"
                min={currencyField.min}
                max={currencyField.max}
                step={currencyField.step ?? 100}
                value={numericValue}
                onChange={(event) => onChange(Number(event.target.value))}
              />
            )}

            {variant === 'slider-with-quick-select' &&
            currencyField.quickSelect &&
            currencyField.quickSelect.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {currencyField.quickSelect.map((quickValue) => (
                  <button
                    key={quickValue}
                    type="button"
                    onClick={() => onChange(quickValue)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      border: '1px solid var(--ff-border)',
                      background:
                        quickValue === numericValue
                          ? 'var(--ff-primary-light)'
                          : 'var(--ff-bg-card)',
                      color: 'var(--ff-text)',
                      cursor: 'pointer',
                    }}
                  >
                    {symbol}
                    {quickValue.toLocaleString()}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </FieldChrome>
    );
  },
);

function getCurrencySymbol(currencyCode: string): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const parts = formatter.formatToParts(1);
  const currencyPart = parts.find((part) => part.type === 'currency');

  return currencyPart?.value ?? currencyCode;
}

const currencySymbolStyle: React.CSSProperties = {
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--ff-text-muted)',
};

const stepButtonStyle: React.CSSProperties = {
  width: '2rem',
  height: '2rem',
  borderRadius: '9999px',
  border: '1px solid var(--ff-border)',
  background: 'var(--ff-bg-card)',
  color: 'var(--ff-text)',
  cursor: 'pointer',
};
