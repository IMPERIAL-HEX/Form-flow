import type { InfoBlockSchema } from '@formflow/core';

import type { FieldComponentProps } from './types';

export function InfoBlock({ field }: FieldComponentProps): React.ReactNode {
  const infoField = field as InfoBlockSchema;

  const toneStyles = getToneStyles(infoField.variant ?? 'callout');

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        borderRadius: 'var(--ff-radius)',
        border: `1px solid ${toneStyles.border}`,
        background: toneStyles.background,
        color: toneStyles.text,
        padding: '0.875rem 1rem',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>{infoField.label}</div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{infoField.content}</div>
    </div>
  );
}

function getToneStyles(variant: NonNullable<InfoBlockSchema['variant']>): {
  border: string;
  background: string;
  text: string;
} {
  if (variant === 'warning') {
    return {
      border: '#f59e0b',
      background: '#fffbeb',
      text: '#78350f',
    };
  }

  if (variant === 'summary') {
    return {
      border: 'var(--ff-border)',
      background: '#f9fafb',
      text: 'var(--ff-text)',
    };
  }

  return {
    border: 'var(--ff-primary)',
    background: 'var(--ff-primary-light)',
    text: 'var(--ff-text)',
  };
}
