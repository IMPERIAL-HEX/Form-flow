import type { FieldSchema } from '@formflow/core';

export type FieldType = FieldSchema['type'];

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  description: string;
  glyph: string;
}

export const FIELD_TYPE_META: Record<FieldType, FieldTypeMeta> = {
  text: {
    type: 'text',
    label: 'Text',
    description: 'Single-line text input with optional pattern.',
    glyph: 'Tt',
  },
  textarea: {
    type: 'textarea',
    label: 'Text Area',
    description: 'Multi-line text input for longer responses.',
    glyph: '¶',
  },
  email: {
    type: 'email',
    label: 'Email',
    description: 'Email address with built-in format validation.',
    glyph: '@',
  },
  number: {
    type: 'number',
    label: 'Number',
    description: 'Numeric input with optional min/max bounds.',
    glyph: '#',
  },
  currency: {
    type: 'currency',
    label: 'Currency',
    description: 'Money input with stepper, slider, and quick-select variants.',
    glyph: '£',
  },
  select: {
    type: 'select',
    label: 'Select',
    description: 'Pick one from a list of options.',
    glyph: '☐',
  },
  'multi-select': {
    type: 'multi-select',
    label: 'Multi-Select',
    description: 'Pick any number from a list of options.',
    glyph: '☑',
  },
  date: {
    type: 'date',
    label: 'Date',
    description: 'Calendar date with optional min/max dates.',
    glyph: '📅',
  },
  phone: {
    type: 'phone',
    label: 'Phone',
    description: 'International phone number with country code.',
    glyph: '☎',
  },
  file: {
    type: 'file',
    label: 'File Upload',
    description: 'Upload one or more files with type and size constraints.',
    glyph: '📎',
  },
  address: {
    type: 'address',
    label: 'Address',
    description: 'Compound address input with line, city, region, postcode, country.',
    glyph: '🏠',
  },
  checkbox: {
    type: 'checkbox',
    label: 'Checkbox',
    description: 'Single checkbox for consent or boolean confirmation.',
    glyph: '✔',
  },
  info: {
    type: 'info',
    label: 'Info Block',
    description: 'Read-only callout, warning, or summary block.',
    glyph: 'ⓘ',
  },
};

export const FIELD_TYPE_ORDER: FieldType[] = [
  'text',
  'textarea',
  'email',
  'number',
  'currency',
  'select',
  'multi-select',
  'date',
  'phone',
  'file',
  'address',
  'checkbox',
  'info',
];

export function fieldTypeLabel(type: FieldType): string {
  return FIELD_TYPE_META[type].label;
}
