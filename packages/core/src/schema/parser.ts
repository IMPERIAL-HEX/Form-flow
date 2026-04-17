import { z } from 'zod';

import type { Condition, CurrencyFieldSchema, FormSchema, StepSchema } from './types';

/**
 * Error thrown when a form schema fails parsing or semantic validation.
 */
export class SchemaParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaParseError';
  }
}

const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.object({
    field: z.string().min(1),
    operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'notIn', 'exists']),
    value: z.unknown().optional(),
    and: z.array(conditionSchema).optional(),
    or: z.array(conditionSchema).optional(),
  }),
);

const selectOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().optional(),
  description: z.string().optional(),
});

const baseFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  ui: z
    .object({
      variant: z.string().optional(),
      width: z.enum(['full', 'half', 'third']).optional(),
      columns: z.number().int().positive().optional(),
      className: z.string().optional(),
    })
    .optional(),
  showIf: conditionSchema.optional(),
  messages: z
    .object({
      required: z.string().optional(),
      invalid: z.string().optional(),
      min: z.string().optional(),
      max: z.string().optional(),
    })
    .optional(),
});

const textFieldSchema = baseFieldSchema.extend({
  type: z.literal('text'),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  pattern: z.string().optional(),
  patternHint: z.string().optional(),
});

const numberFieldSchema = baseFieldSchema.extend({
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
});

const currencyFieldSchema = baseFieldSchema.extend({
  type: z.literal('currency'),
  currency: z.string().length(3),
  min: z.number(),
  max: z.number(),
  step: z.number().positive().optional(),
  quickSelect: z.array(z.number()).optional(),
});

const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal('select'),
  options: z.array(selectOptionSchema).min(1),
});

const multiSelectFieldSchema = baseFieldSchema.extend({
  type: z.literal('multi-select'),
  options: z.array(selectOptionSchema).min(1),
  minSelections: z.number().int().nonnegative().optional(),
  maxSelections: z.number().int().positive().optional(),
});

const dateFieldSchema = baseFieldSchema.extend({
  type: z.literal('date'),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
});

const phoneFieldSchema = baseFieldSchema.extend({
  type: z.literal('phone'),
  defaultCountryCode: z.string().optional(),
});

const emailFieldSchema = baseFieldSchema.extend({
  type: z.literal('email'),
});

const fileFieldSchema = baseFieldSchema.extend({
  type: z.literal('file'),
  accept: z.array(z.string()).optional(),
  maxSizeMb: z.number().positive().optional(),
  multiple: z.boolean().optional(),
});

const addressFieldSchema = baseFieldSchema.extend({
  type: z.literal('address'),
  includeLine2: z.boolean().optional(),
  regionLabel: z.string().optional(),
  postcodeLabel: z.string().optional(),
  countries: z.array(selectOptionSchema).optional(),
});

const checkboxFieldSchema = baseFieldSchema.extend({
  type: z.literal('checkbox'),
});

const textAreaFieldSchema = baseFieldSchema.extend({
  type: z.literal('textarea'),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  rows: z.number().int().positive().optional(),
});

const infoFieldSchema = baseFieldSchema.extend({
  type: z.literal('info'),
  variant: z.enum(['callout', 'warning', 'summary']).optional(),
  content: z.string().min(1),
});

const fieldSchema = z.discriminatedUnion('type', [
  textFieldSchema,
  numberFieldSchema,
  currencyFieldSchema,
  selectFieldSchema,
  multiSelectFieldSchema,
  dateFieldSchema,
  phoneFieldSchema,
  emailFieldSchema,
  fileFieldSchema,
  addressFieldSchema,
  checkboxFieldSchema,
  textAreaFieldSchema,
  infoFieldSchema,
]);

const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  heading: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  fields: z.array(fieldSchema).min(1),
  layout: z.enum(['single-column', 'two-column']).optional(),
  showIf: conditionSchema.optional(),
});

const formSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  layout: z.object({
    template: z.enum(['top-stepper', 'sidebar-left', 'centered']),
    header: z
      .object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        background: z.enum(['solid', 'gradient']).optional(),
        showLogo: z.boolean().optional(),
      })
      .optional(),
    navigator: z
      .object({
        showStepNumbers: z.boolean().optional(),
        showIcons: z.boolean().optional(),
        showProgress: z.boolean().optional(),
        clickableSteps: z.boolean().optional(),
      })
      .optional(),
    footer: z
      .object({
        previousLabel: z.string().optional(),
        nextLabel: z.string().optional(),
        submitLabel: z.string().optional(),
        showPreviousOnFirstStep: z.boolean().optional(),
      })
      .optional(),
  }),
  steps: z.array(stepSchema).min(1),
  submission: z.object({
    endpoint: z.string().min(1),
    method: z.enum(['POST', 'PUT']).optional(),
    headers: z.record(z.string(), z.string()).optional(),
    transformKeys: z.boolean().optional(),
    onSuccess: z
      .object({
        message: z.string().optional(),
        redirectUrl: z.string().optional(),
      })
      .optional(),
  }),
  theme: z
    .object({
      primaryColor: z.string().optional(),
      borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).optional(),
      fontFamily: z.string().optional(),
      mode: z.enum(['light', 'dark']).optional(),
    })
    .optional(),
});

/**
 * Parses and validates raw JSON into a deeply immutable form schema.
 */
export function parseFormSchema(raw: unknown): Readonly<FormSchema> {
  const parsed = formSchema.safeParse(raw);

  if (!parsed.success) {
    throw new SchemaParseError(parsed.error.issues.map((issue) => issue.message).join('; '));
  }

  const schema = parsed.data as FormSchema;

  validateUniqueFieldKeys(schema.steps);
  validateConditionReferences(schema.steps);
  validateCurrencyQuickSelect(schema.steps);

  return deepFreeze(schema);
}

function validateUniqueFieldKeys(steps: StepSchema[]): void {
  const seen = new Set<string>();

  for (const step of steps) {
    for (const field of step.fields) {
      if (seen.has(field.key)) {
        throw new SchemaParseError(`Duplicate field key found: "${field.key}"`);
      }
      seen.add(field.key);
    }
  }
}

function validateConditionReferences(steps: StepSchema[]): void {
  const precedingStepKeys = new Set<string>();

  for (const step of steps) {
    if (step.showIf) {
      assertConditionReferences(step.showIf, precedingStepKeys, `Step "${step.id}"`);
    }

    const accessibleInStep = new Set(precedingStepKeys);

    for (const field of step.fields) {
      if (field.showIf) {
        assertConditionReferences(
          field.showIf,
          accessibleInStep,
          `Step "${step.id}" field "${field.key}"`,
        );
      }

      accessibleInStep.add(field.key);
    }

    for (const field of step.fields) {
      precedingStepKeys.add(field.key);
    }
  }
}

function assertConditionReferences(
  condition: Condition,
  allowedKeys: Set<string>,
  sourceLabel: string,
): void {
  for (const key of collectConditionFields(condition)) {
    if (!allowedKeys.has(key)) {
      throw new SchemaParseError(
        `${sourceLabel} references field key "${key}" in showIf condition, but this field does not exist in any preceding scope.`,
      );
    }
  }
}

function collectConditionFields(condition: Condition): string[] {
  const fields = [condition.field];

  if (condition.and) {
    for (const child of condition.and) {
      fields.push(...collectConditionFields(child));
    }
  }

  if (condition.or) {
    for (const child of condition.or) {
      fields.push(...collectConditionFields(child));
    }
  }

  return fields;
}

function validateCurrencyQuickSelect(steps: StepSchema[]): void {
  for (const step of steps) {
    for (const field of step.fields) {
      if (field.type !== 'currency') {
        continue;
      }

      const currencyField = field as CurrencyFieldSchema;

      if (!currencyField.quickSelect) {
        continue;
      }

      for (const value of currencyField.quickSelect) {
        if (value < currencyField.min || value > currencyField.max) {
          throw new SchemaParseError(
            `Currency field "${currencyField.key}" has quickSelect value ${value} outside min/max range.`,
          );
        }
      }
    }
  }
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);

    for (const key of Object.keys(value as Record<string, unknown>)) {
      const child = (value as Record<string, unknown>)[key];
      deepFreeze(child);
    }
  }

  return value as Readonly<T>;
}
