import type { ComponentType } from 'react';

import {
  AddressField,
  CheckboxField,
  CurrencyField,
  DateField,
  EmailField,
  FileUploadField,
  InfoBlock,
  MultiSelectField,
  NumberField,
  PhoneField,
  SelectField,
  TextAreaField,
  TextField,
  type FieldComponentProps,
} from '../components/fields';

export type FieldComponentMap = {
  [fieldType: string]: {
    [variant: string]: ComponentType<FieldComponentProps>;
  };
};

export class FieldRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FieldRegistryError';
  }
}

const defaultRegistry: FieldComponentMap = {
  text: { default: TextField },
  textarea: { default: TextAreaField },
  email: { default: EmailField },
  number: { default: NumberField, stepper: NumberField },
  currency: {
    'simple-input': CurrencyField,
    'stepper-with-slider': CurrencyField,
    'slider-with-quick-select': CurrencyField,
    default: CurrencyField,
  },
  select: {
    dropdown: SelectField,
    'radio-group': SelectField,
    'icon-cards': SelectField,
    'pill-buttons': SelectField,
    default: SelectField,
  },
  'multi-select': {
    'checkbox-group': MultiSelectField,
    'pill-buttons': MultiSelectField,
    default: MultiSelectField,
  },
  date: { default: DateField },
  phone: { default: PhoneField },
  file: { default: FileUploadField },
  address: { default: AddressField },
  checkbox: { default: CheckboxField },
  info: {
    callout: InfoBlock,
    warning: InfoBlock,
    summary: InfoBlock,
    default: InfoBlock,
  },
};

export function resolveFieldComponent(
  type: string,
  variant?: string,
  customRegistry?: Partial<FieldComponentMap>,
): ComponentType<FieldComponentProps> {
  const customTypeRegistry = customRegistry?.[type];

  if (variant && customTypeRegistry?.[variant]) {
    return customTypeRegistry[variant];
  }

  if (customTypeRegistry?.default) {
    return customTypeRegistry.default;
  }

  const defaultTypeRegistry = defaultRegistry[type];

  if (!defaultTypeRegistry) {
    throw new FieldRegistryError(`No component registered for field type "${type}".`);
  }

  if (variant && defaultTypeRegistry[variant]) {
    return defaultTypeRegistry[variant];
  }

  if (defaultTypeRegistry.default) {
    return defaultTypeRegistry.default;
  }

  throw new FieldRegistryError(`No default variant registered for field type "${type}".`);
}
