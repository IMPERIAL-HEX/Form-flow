import type { FieldSchema, FormSchema, StepSchema } from '@formflow/core';

import { buildBlankField, buildBlankStep } from './fieldDefaults';
import type { FieldType } from './fieldTypeMeta';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createBlankSchema(): FormSchema {
  return {
    id: 'new-form',
    version: '1.0.0',
    title: 'New Form',
    layout: { template: 'top-stepper' },
    submission: { endpoint: '/api/submissions', method: 'POST', transformKeys: true },
    steps: [buildBlankStep()],
  };
}

export function addStep(schema: FormSchema, afterIndex?: number): FormSchema {
  const next = clone(schema);
  const step = buildBlankStep();
  const insertAt = afterIndex === undefined ? next.steps.length : afterIndex + 1;
  next.steps.splice(insertAt, 0, step);
  return next;
}

export function removeStep(schema: FormSchema, stepId: string): FormSchema {
  const next = clone(schema);
  if (next.steps.length <= 1) return schema;
  next.steps = next.steps.filter((step) => step.id !== stepId);
  return next;
}

export function updateStep(
  schema: FormSchema,
  stepId: string,
  patch: Partial<StepSchema>,
): FormSchema {
  const next = clone(schema);
  const step = next.steps.find((entry) => entry.id === stepId);
  if (!step) return schema;
  Object.assign(step, patch);
  return next;
}

export function moveStep(schema: FormSchema, fromIndex: number, toIndex: number): FormSchema {
  if (fromIndex === toIndex) return schema;
  if (fromIndex < 0 || fromIndex >= schema.steps.length) return schema;
  if (toIndex < 0 || toIndex >= schema.steps.length) return schema;
  const next = clone(schema);
  const [moved] = next.steps.splice(fromIndex, 1);
  if (moved) next.steps.splice(toIndex, 0, moved);
  return next;
}

export function addField(
  schema: FormSchema,
  stepId: string,
  fieldType: FieldType,
  afterIndex?: number,
): FormSchema {
  const next = clone(schema);
  const step = next.steps.find((entry) => entry.id === stepId);
  if (!step) return schema;
  const field = buildBlankField(fieldType);
  const insertAt = afterIndex === undefined ? step.fields.length : afterIndex + 1;
  step.fields.splice(insertAt, 0, field);
  return next;
}

export function removeField(schema: FormSchema, stepId: string, fieldKey: string): FormSchema {
  const next = clone(schema);
  const step = next.steps.find((entry) => entry.id === stepId);
  if (!step) return schema;
  if (step.fields.length <= 1) return schema;
  step.fields = step.fields.filter((field) => field.key !== fieldKey);
  return next;
}

export function updateField(
  schema: FormSchema,
  stepId: string,
  fieldKey: string,
  patch: Partial<FieldSchema> & { type?: FieldSchema['type'] },
): FormSchema {
  const next = clone(schema);
  const step = next.steps.find((entry) => entry.id === stepId);
  if (!step) return schema;
  const index = step.fields.findIndex((field) => field.key === fieldKey);
  if (index === -1) return schema;
  const current = step.fields[index];
  if (!current) return schema;
  step.fields[index] = { ...current, ...patch } as FieldSchema;
  return next;
}

export function replaceField(
  schema: FormSchema,
  stepId: string,
  fieldKey: string,
  nextField: FieldSchema,
): FormSchema {
  const next = clone(schema);
  const step = next.steps.find((entry) => entry.id === stepId);
  if (!step) return schema;
  const index = step.fields.findIndex((field) => field.key === fieldKey);
  if (index === -1) return schema;
  step.fields[index] = nextField;
  return next;
}

export function moveField(
  schema: FormSchema,
  stepId: string,
  fromIndex: number,
  toIndex: number,
): FormSchema {
  if (fromIndex === toIndex) return schema;
  const next = clone(schema);
  const step = next.steps.find((entry) => entry.id === stepId);
  if (!step) return schema;
  if (fromIndex < 0 || fromIndex >= step.fields.length) return schema;
  if (toIndex < 0 || toIndex >= step.fields.length) return schema;
  const [moved] = step.fields.splice(fromIndex, 1);
  if (moved) step.fields.splice(toIndex, 0, moved);
  return next;
}

export function moveFieldToStep(
  schema: FormSchema,
  fieldKey: string,
  fromStepId: string,
  toStepId: string,
  toIndex: number,
): FormSchema {
  if (fromStepId === toStepId) return schema;
  const next = clone(schema);
  const fromStep = next.steps.find((entry) => entry.id === fromStepId);
  const toStep = next.steps.find((entry) => entry.id === toStepId);
  if (!fromStep || !toStep) return schema;
  if (fromStep.fields.length <= 1) return schema;
  const fromIndex = fromStep.fields.findIndex((field) => field.key === fieldKey);
  if (fromIndex === -1) return schema;
  const [moved] = fromStep.fields.splice(fromIndex, 1);
  if (!moved) return schema;
  const clampedIndex = Math.max(0, Math.min(toIndex, toStep.fields.length));
  toStep.fields.splice(clampedIndex, 0, moved);
  return next;
}

export function findStep(schema: FormSchema, stepId: string): StepSchema | undefined {
  return schema.steps.find((entry) => entry.id === stepId);
}

export function findField(
  schema: FormSchema,
  stepId: string,
  fieldKey: string,
): FieldSchema | undefined {
  const step = findStep(schema, stepId);
  return step?.fields.find((field) => field.key === fieldKey);
}

export function locateField(
  schema: FormSchema,
  fieldKey: string,
): { stepId: string; field: FieldSchema } | undefined {
  for (const step of schema.steps) {
    const field = step.fields.find((entry) => entry.key === fieldKey);
    if (field) return { stepId: step.id, field };
  }
  return undefined;
}

export function renameFieldKey(
  schema: FormSchema,
  stepId: string,
  oldKey: string,
  newKey: string,
): FormSchema {
  if (oldKey === newKey) return schema;
  const field = findField(schema, stepId, oldKey);
  if (!field) return schema;
  return updateField(schema, stepId, oldKey, { key: newKey });
}

export function schemaHasFieldKey(
  schema: FormSchema,
  key: string,
  exceptStepId?: string,
  exceptFieldKey?: string,
): boolean {
  for (const step of schema.steps) {
    for (const field of step.fields) {
      if (step.id === exceptStepId && field.key === exceptFieldKey) continue;
      if (field.key === key) return true;
    }
  }
  return false;
}
