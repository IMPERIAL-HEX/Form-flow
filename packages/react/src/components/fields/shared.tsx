import type { ReactNode } from 'react';

import type { FieldChromeProps } from './types';

export function toInputId(key: string): string {
  return `ff-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export function getAriaDescribedBy(
  descriptionId: string,
  errorId: string,
  hasDescription: boolean,
  hasError: boolean,
): string | undefined {
  const ids: string[] = [];

  if (hasDescription) {
    ids.push(descriptionId);
  }

  if (hasError) {
    ids.push(errorId);
  }

  return ids.length > 0 ? ids.join(' ') : undefined;
}

export function FieldChrome({ field, error, children }: FieldChromeProps): ReactNode {
  const inputId = toInputId(field.key);
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        htmlFor={inputId}
        style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}
      >
        {field.label}
        {field.required ? (
          <span style={{ color: 'var(--ff-error)', marginLeft: '0.25rem' }}>*</span>
        ) : null}
      </label>

      {field.description ? (
        <p
          id={descriptionId}
          style={{
            marginTop: 0,
            marginBottom: '0.625rem',
            color: 'var(--ff-text-muted)',
            fontSize: '0.9rem',
          }}
        >
          {field.description}
        </p>
      ) : null}

      {children({ inputId, descriptionId, errorId })}

      {error ? (
        <p
          id={errorId}
          style={{ marginTop: '0.5rem', color: 'var(--ff-error)', fontSize: '0.875rem' }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const sharedInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid var(--ff-border)',
  borderRadius: 'var(--ff-radius)',
  background: 'var(--ff-bg-card)',
  color: 'var(--ff-text)',
  fontFamily: 'var(--ff-font-family)',
  fontSize: 'var(--ff-font-size-base)',
  outline: 'none',
};
