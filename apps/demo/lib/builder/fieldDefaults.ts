import type { FieldSchema, StepSchema } from '@formflow/core';

import type { FieldType } from './fieldTypeMeta';

let counter = 0;

function nextKey(prefix: string): string {
  counter += 1;
  return `${prefix}${counter}`;
}

function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildBlankField(type: FieldType): FieldSchema {
  switch (type) {
    case 'text':
      return {
        type: 'text',
        key: nextKey('text'),
        label: 'New Text Field',
      };
    case 'textarea':
      return {
        type: 'textarea',
        key: nextKey('textarea'),
        label: 'New Text Area',
      };
    case 'email':
      return {
        type: 'email',
        key: nextKey('email'),
        label: 'Email Address',
      };
    case 'number':
      return {
        type: 'number',
        key: nextKey('number'),
        label: 'New Number Field',
      };
    case 'currency':
      return {
        type: 'currency',
        key: nextKey('currency'),
        label: 'New Currency Field',
        currency: 'GBP',
        min: 0,
        max: 10000,
      };
    case 'select':
      return {
        type: 'select',
        key: nextKey('select'),
        label: 'New Select Field',
        options: [
          { value: 'option-1', label: 'Option 1' },
          { value: 'option-2', label: 'Option 2' },
        ],
      };
    case 'multi-select':
      return {
        type: 'multi-select',
        key: nextKey('multiSelect'),
        label: 'New Multi-Select Field',
        options: [
          { value: 'option-1', label: 'Option 1' },
          { value: 'option-2', label: 'Option 2' },
        ],
      };
    case 'date':
      return {
        type: 'date',
        key: nextKey('date'),
        label: 'New Date Field',
      };
    case 'phone':
      return {
        type: 'phone',
        key: nextKey('phone'),
        label: 'Phone Number',
      };
    case 'file':
      return {
        type: 'file',
        key: nextKey('file'),
        label: 'Upload Document',
      };
    case 'address':
      return {
        type: 'address',
        key: nextKey('address'),
        label: 'Address',
      };
    case 'checkbox':
      return {
        type: 'checkbox',
        key: nextKey('checkbox'),
        label: 'I agree',
      };
    case 'info':
      return {
        type: 'info',
        key: nextKey('info'),
        label: 'Informational Block',
        content: 'Add helpful context for the applicant here.',
      };
  }
}

export function buildBlankStep(): StepSchema {
  return {
    id: nextId('step'),
    title: 'New Step',
    fields: [buildBlankField('text')],
  };
}
