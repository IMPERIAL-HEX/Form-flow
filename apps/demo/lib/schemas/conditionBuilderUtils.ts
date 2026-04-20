import type {
  Condition,
  FieldSchema,
  FormSchema,
  SelectOption,
  StepSchema,
} from '@formflow/core';

export type TargetRef = { kind: 'step'; id: string } | { kind: 'field'; key: string };

export type MatchMode = 'all' | 'any';

export type ConditionOperator = Condition['operator'];

export interface FieldRef {
  key: string;
  label: string;
  type: FieldSchema['type'];
  stepId: string;
  stepTitle: string;
  options?: SelectOption[];
}

export interface TargetOption {
  ref: TargetRef;
  label: string;
  currentShowIf: Condition | undefined;
}

export interface RowDraft {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: string;
}

export interface BuilderState {
  mode: MatchMode;
  rows: RowDraft[];
}

const ALL_OPERATORS: ConditionOperator[] = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'notIn',
  'exists',
];

const NUMERIC_TYPES: Array<FieldSchema['type']> = ['number', 'currency'];

export function listFields(schema: FormSchema): FieldRef[] {
  const result: FieldRef[] = [];
  for (const step of schema.steps) {
    for (const field of step.fields) {
      if (field.type === 'info') continue;
      const ref: FieldRef = {
        key: field.key,
        label: field.label,
        type: field.type,
        stepId: step.id,
        stepTitle: step.title,
      };
      if (field.type === 'select' || field.type === 'multi-select') {
        ref.options = field.options;
      }
      result.push(ref);
    }
  }
  return result;
}

export function listTargets(schema: FormSchema): TargetOption[] {
  const targets: TargetOption[] = [];
  for (const step of schema.steps) {
    targets.push({
      ref: { kind: 'step', id: step.id },
      label: `Step — ${step.title}`,
      currentShowIf: step.showIf,
    });
    for (const field of step.fields) {
      targets.push({
        ref: { kind: 'field', key: field.key },
        label: `Field — ${field.label} (${step.title})`,
        currentShowIf: field.showIf,
      });
    }
  }
  return targets;
}

export function operatorsForField(field: FieldRef | undefined): ConditionOperator[] {
  if (!field) return ALL_OPERATORS;
  if (field.type === 'select' || field.type === 'multi-select') {
    return ['eq', 'neq', 'in', 'notIn', 'exists'];
  }
  if (NUMERIC_TYPES.includes(field.type)) {
    return ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'exists'];
  }
  if (field.type === 'checkbox') {
    return ['eq', 'neq', 'exists'];
  }
  return ['eq', 'neq', 'in', 'notIn', 'exists'];
}

export function operatorLabel(operator: ConditionOperator): string {
  switch (operator) {
    case 'eq':
      return 'equals';
    case 'neq':
      return 'does not equal';
    case 'gt':
      return 'is greater than';
    case 'gte':
      return 'is greater than or equal to';
    case 'lt':
      return 'is less than';
    case 'lte':
      return 'is less than or equal to';
    case 'in':
      return 'is one of';
    case 'notIn':
      return 'is not one of';
    case 'exists':
      return 'has a value';
  }
}

export function createEmptyRow(fieldKey = ''): RowDraft {
  return {
    id: generateRowId(),
    field: fieldKey,
    operator: 'eq',
    value: '',
  };
}

function generateRowId(): string {
  return `row-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function parseValue(row: RowDraft, field: FieldRef | undefined): unknown {
  const operator = row.operator;
  if (operator === 'exists') return undefined;
  if (operator === 'in' || operator === 'notIn') {
    return row.value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .map((part) => coerceScalar(part, field));
  }
  return coerceScalar(row.value, field);
}

function coerceScalar(raw: string, field: FieldRef | undefined): unknown {
  if (!field) return raw;
  if (NUMERIC_TYPES.includes(field.type)) {
    const asNumber = Number(raw);
    return Number.isFinite(asNumber) ? asNumber : raw;
  }
  if (field.type === 'checkbox') {
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return raw;
  }
  return raw;
}

function rowToCondition(row: RowDraft, fieldIndex: Map<string, FieldRef>): Condition | null {
  if (!row.field) return null;
  const field = fieldIndex.get(row.field);
  const condition: Condition = {
    field: row.field,
    operator: row.operator,
  };
  const value = parseValue(row, field);
  if (value !== undefined) {
    condition.value = value;
  }
  return condition;
}

export interface CompileResult {
  condition: Condition | null;
  error: string | null;
}

export function compileCondition(state: BuilderState, schema: FormSchema): CompileResult {
  const fieldIndex = new Map<string, FieldRef>(listFields(schema).map((f) => [f.key, f]));
  const filled = state.rows.filter((row) => row.field.length > 0);
  if (filled.length === 0) {
    return { condition: null, error: null };
  }

  const compiled = filled.map((row) => rowToCondition(row, fieldIndex));
  if (compiled.some((entry) => entry === null)) {
    return { condition: null, error: 'Each row needs a source field selected.' };
  }
  const conditions = compiled as Condition[];

  for (let i = 0; i < conditions.length; i += 1) {
    const row = filled[i];
    const entry = conditions[i];
    if (!row || !entry) continue;
    if (entry.operator === 'exists') continue;
    if ((entry.operator === 'in' || entry.operator === 'notIn') && Array.isArray(entry.value)) {
      if (entry.value.length === 0) {
        return { condition: null, error: 'List operators need at least one comma-separated value.' };
      }
      continue;
    }
    if (row.value.trim().length === 0) {
      return { condition: null, error: 'Each row needs a value for its chosen operator.' };
    }
  }

  const first = conditions[0];
  if (!first) return { condition: null, error: null };

  if (conditions.length === 1) {
    return { condition: first, error: null };
  }

  const rest = conditions.slice(1);
  const root: Condition = { ...first };
  if (state.mode === 'all') {
    root.and = rest;
  } else {
    root.or = rest;
  }
  return { condition: root, error: null };
}

export function decodeCondition(condition: Condition | undefined): BuilderState {
  if (!condition) {
    return { mode: 'all', rows: [createEmptyRow()] };
  }
  const rows: RowDraft[] = [conditionToRow(condition)];
  let mode: MatchMode = 'all';
  if (condition.and && condition.and.length > 0) {
    mode = 'all';
    condition.and.forEach((child) => rows.push(conditionToRow(child)));
  } else if (condition.or && condition.or.length > 0) {
    mode = 'any';
    condition.or.forEach((child) => rows.push(conditionToRow(child)));
  }
  return { mode, rows };
}

function conditionToRow(condition: Condition): RowDraft {
  const value = condition.value;
  let serialized = '';
  if (Array.isArray(value)) {
    serialized = value.map((entry) => String(entry)).join(', ');
  } else if (value !== undefined && value !== null) {
    serialized = String(value);
  }
  return {
    id: generateRowId(),
    field: condition.field,
    operator: condition.operator,
    value: serialized,
  };
}

export function applyShowIf(
  schema: FormSchema,
  target: TargetRef,
  condition: Condition | null,
): FormSchema {
  const next = JSON.parse(JSON.stringify(schema)) as FormSchema;
  if (target.kind === 'step') {
    const step = next.steps.find((entry) => entry.id === target.id);
    if (!step) return schema;
    writeShowIf(step, condition);
  } else {
    const field = findField(next, target.key);
    if (!field) return schema;
    writeShowIf(field, condition);
  }
  return next;
}

function writeShowIf(target: StepSchema | FieldSchema, condition: Condition | null): void {
  if (condition) {
    target.showIf = condition;
  } else {
    delete (target as { showIf?: Condition }).showIf;
  }
}

function findField(schema: FormSchema, key: string): FieldSchema | undefined {
  for (const step of schema.steps) {
    const match = step.fields.find((field) => field.key === key);
    if (match) return match;
  }
  return undefined;
}

export function findTarget(
  targets: TargetOption[],
  ref: TargetRef | null,
): TargetOption | undefined {
  if (!ref) return undefined;
  return targets.find((entry) => isSameTarget(entry.ref, ref));
}

export function isSameTarget(a: TargetRef, b: TargetRef): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'step' && b.kind === 'step') return a.id === b.id;
  if (a.kind === 'field' && b.kind === 'field') return a.key === b.key;
  return false;
}

export function targetRefToId(ref: TargetRef): string {
  return ref.kind === 'step' ? `step:${ref.id}` : `field:${ref.key}`;
}

export function targetRefFromId(id: string): TargetRef | null {
  if (id.startsWith('step:')) return { kind: 'step', id: id.slice('step:'.length) };
  if (id.startsWith('field:')) return { kind: 'field', key: id.slice('field:'.length) };
  return null;
}

export function fieldStepTitle(fields: FieldRef[], key: string): string | undefined {
  return fields.find((field) => field.key === key)?.stepTitle;
}
