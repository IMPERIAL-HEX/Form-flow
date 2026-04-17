import { z } from 'zod';

import type {
  AddressFieldSchema,
  CheckboxFieldSchema,
  CurrencyFieldSchema,
  DateFieldSchema,
  EmailFieldSchema,
  FieldSchema,
  FileUploadFieldSchema,
  FormSchema,
  MultiSelectFieldSchema,
  NumberFieldSchema,
  PhoneFieldSchema,
  SelectFieldSchema,
  StepSchema,
  TextAreaFieldSchema,
  TextFieldSchema,
} from '../schema/types';

/**
 * Builds a field-level zod validator from a field schema definition.
 */
export function buildFieldValidator(field: FieldSchema): z.ZodType {
  switch (field.type) {
    case 'text':
      return optionalize(buildTextValidator(field), field);
    case 'textarea':
      return optionalize(buildTextAreaValidator(field), field);
    case 'email':
      return optionalize(buildEmailValidator(field), field);
    case 'phone':
      return optionalize(buildPhoneValidator(field), field);
    case 'number':
      return optionalize(buildNumberValidator(field), field);
    case 'currency':
      return optionalize(buildCurrencyValidator(field), field);
    case 'select':
      return optionalize(buildSelectValidator(field), field);
    case 'multi-select':
      return optionalize(buildMultiSelectValidator(field), field);
    case 'date':
      return optionalize(buildDateValidator(field), field);
    case 'file':
      return optionalize(buildFileValidator(field), field);
    case 'address':
      return optionalize(buildAddressValidator(field), field);
    case 'checkbox':
      return optionalize(buildCheckboxValidator(field), field);
    case 'info':
      return z.any().optional();
    default:
      return z.any().optional();
  }
}

/**
 * Builds a step-level zod object validator from step field schemas.
 */
export function buildStepValidator(step: StepSchema): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {};

  for (const field of step.fields) {
    shape[field.key] = buildFieldValidator(field);
  }

  return z.object(shape);
}

/**
 * Builds a full form-level zod object validator from all schema fields.
 */
export function buildFormValidator(schema: FormSchema): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {};

  for (const step of schema.steps) {
    for (const field of step.fields) {
      shape[field.key] = buildFieldValidator(field);
    }
  }

  return z.object(shape);
}

function buildTextValidator(field: TextFieldSchema): z.ZodString {
  let schema = z.string({
    error: field.messages?.invalid ?? `${field.label} is invalid`,
  });

  if (field.required) {
    schema = schema.min(1, field.messages?.required ?? `${field.label} is required`);
  }

  if (field.minLength !== undefined) {
    schema = schema.min(field.minLength, field.messages?.min ?? `${field.label} is too short`);
  }

  if (field.maxLength !== undefined) {
    schema = schema.max(field.maxLength, field.messages?.max ?? `${field.label} is too long`);
  }

  if (field.pattern) {
    const regex = new RegExp(field.pattern);
    schema = schema.regex(regex, field.messages?.invalid ?? `${field.label} is invalid`);
  }

  return schema;
}

function buildTextAreaValidator(field: TextAreaFieldSchema): z.ZodString {
  let schema = z.string({
    error: field.messages?.invalid ?? `${field.label} is invalid`,
  });

  if (field.required) {
    schema = schema.min(1, field.messages?.required ?? `${field.label} is required`);
  }

  if (field.minLength !== undefined) {
    schema = schema.min(field.minLength, field.messages?.min ?? `${field.label} is too short`);
  }

  if (field.maxLength !== undefined) {
    schema = schema.max(field.maxLength, field.messages?.max ?? `${field.label} is too long`);
  }

  return schema;
}

function buildEmailValidator(field: EmailFieldSchema): z.ZodType {
  const invalidMessage = field.messages?.invalid ?? `${field.label} must be a valid email`;
  const emailSchema = z.email({ error: invalidMessage });

  if (field.required) {
    return emailSchema.min(1, field.messages?.required ?? `${field.label} is required`);
  }

  return emailSchema;
}

function buildPhoneValidator(field: PhoneFieldSchema): z.ZodString {
  const phoneRegex = /^\+?[0-9\s()\-]{7,20}$/;
  let schema = z
    .string({
      error: field.messages?.invalid ?? `${field.label} is invalid`,
    })
    .regex(phoneRegex, field.messages?.invalid ?? `${field.label} must be a valid phone number`);

  if (field.required) {
    schema = schema.min(1, field.messages?.required ?? `${field.label} is required`);
  }

  return schema;
}

function buildNumberValidator(field: NumberFieldSchema): z.ZodType {
  let schema = z.coerce.number({
    error: field.messages?.invalid ?? `${field.label} is invalid`,
  });

  if (field.min !== undefined) {
    schema = schema.min(field.min, field.messages?.min ?? `${field.label} is too small`);
  }

  if (field.max !== undefined) {
    schema = schema.max(field.max, field.messages?.max ?? `${field.label} is too large`);
  }

  return schema;
}

function buildCurrencyValidator(field: CurrencyFieldSchema): z.ZodType {
  return z.coerce
    .number({ error: field.messages?.invalid ?? `${field.label} is invalid` })
    .min(field.min, field.messages?.min ?? `${field.label} is too small`)
    .max(field.max, field.messages?.max ?? `${field.label} is too large`);
}

function buildSelectValidator(field: SelectFieldSchema): z.ZodType {
  const options = field.options.map((option) => option.value) as [string, ...string[]];
  return z.enum(options, {
    error: field.messages?.invalid ?? `${field.label} is invalid`,
  });
}

function buildMultiSelectValidator(field: MultiSelectFieldSchema): z.ZodType {
  const options = field.options.map((option) => option.value) as [string, ...string[]];
  let schema = z.array(
    z.enum(options, {
      error: field.messages?.invalid ?? `${field.label} contains an invalid value`,
    }),
  );

  if (field.minSelections !== undefined) {
    schema = schema.min(
      field.minSelections,
      field.messages?.min ?? `${field.label} requires more selections`,
    );
  }

  if (field.maxSelections !== undefined) {
    schema = schema.max(
      field.maxSelections,
      field.messages?.max ?? `${field.label} has too many selections`,
    );
  }

  return schema;
}

function buildDateValidator(field: DateFieldSchema): z.ZodType {
  let schema = z
    .string({
      error: field.messages?.invalid ?? `${field.label} is invalid`,
    })
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      field.messages?.invalid ?? `${field.label} must be a valid date`,
    );

  if (field.minDate) {
    const minDate = Date.parse(field.minDate);
    schema = schema.refine(
      (value) => Date.parse(value) >= minDate,
      field.messages?.min ?? `${field.label} is before the minimum date`,
    );
  }

  if (field.maxDate) {
    const maxDate = Date.parse(field.maxDate);
    schema = schema.refine(
      (value) => Date.parse(value) <= maxDate,
      field.messages?.max ?? `${field.label} is after the maximum date`,
    );
  }

  return schema;
}

function buildFileValidator(field: FileUploadFieldSchema): z.ZodType {
  const fileObject = z.object({
    name: z.string(),
    size: z.number().nonnegative(),
    type: z.string(),
  });

  const validateSingle = fileObject.superRefine((value, ctx) => {
    if (field.maxSizeMb !== undefined && value.size > field.maxSizeMb * 1024 * 1024) {
      ctx.addIssue({
        code: 'custom',
        message: field.messages?.max ?? `${field.label} exceeds max file size`,
      });
    }

    if (
      field.accept &&
      field.accept.length > 0 &&
      !matchesAcceptedType(value.name, value.type, field.accept)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: field.messages?.invalid ?? `${field.label} has an unsupported file type`,
      });
    }
  });

  if (field.multiple) {
    return z.array(validateSingle);
  }

  return validateSingle;
}

function buildAddressValidator(field: AddressFieldSchema): z.ZodType {
  const requiredMessage = field.messages?.required ?? `${field.label} is required`;

  const line1 = field.required ? z.string().min(1, requiredMessage) : z.string().optional();
  const city = field.required ? z.string().min(1, requiredMessage) : z.string().optional();
  const region = field.required ? z.string().min(1, requiredMessage) : z.string().optional();
  const postcode = field.required ? z.string().min(1, requiredMessage) : z.string().optional();
  const country = field.required ? z.string().min(1, requiredMessage) : z.string().optional();

  return z.object({
    line1,
    line2: z.string().optional(),
    city,
    region,
    postcode,
    country,
  });
}

function buildCheckboxValidator(field: CheckboxFieldSchema): z.ZodType {
  const schema = z.boolean({
    error: field.messages?.invalid ?? `${field.label} is invalid`,
  });

  if (!field.required) {
    return schema;
  }

  return schema.refine((value) => value === true, {
    message: field.messages?.required ?? `${field.label} must be accepted`,
  });
}

function optionalize<T extends z.ZodType>(schema: T, field: FieldSchema): z.ZodType {
  if (field.required) {
    return schema;
  }

  return schema.optional();
}

function matchesAcceptedType(fileName: string, mimeType: string, accepted: string[]): boolean {
  return accepted.some((entry) => {
    if (entry.startsWith('.')) {
      return fileName.toLowerCase().endsWith(entry.toLowerCase());
    }

    if (entry.endsWith('/*')) {
      const prefix = entry.slice(0, -1);
      return mimeType.startsWith(prefix);
    }

    return mimeType === entry;
  });
}
