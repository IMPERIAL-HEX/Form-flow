import 'server-only';

import { parseFormSchema, type FormSchema } from '@formflow/core';

const FORM_ID_PATTERN = /^[a-zA-Z0-9-]+$/;
const MAX_SCHEMA_BYTES = 256 * 1024;

export interface StoredSchema {
  id: string;
  title: string;
  schema: FormSchema;
  createdAt: string;
  updatedAt: string;
}

export interface SchemaSummary {
  id: string;
  title: string;
  stepCount: number;
  fieldCount: number;
  createdAt: string;
  updatedAt: string;
}

declare global {
  var __formflowBuilderSchemaStore: Map<string, StoredSchema> | undefined;
}

function getStore(): Map<string, StoredSchema> {
  if (!globalThis.__formflowBuilderSchemaStore) {
    globalThis.__formflowBuilderSchemaStore = new Map<string, StoredSchema>();
  }
  return globalThis.__formflowBuilderSchemaStore;
}

function summarize(stored: StoredSchema): SchemaSummary {
  const stepCount = stored.schema.steps.length;
  const fieldCount = stored.schema.steps.reduce((total, step) => total + step.fields.length, 0);
  return {
    id: stored.id,
    title: stored.title,
    stepCount,
    fieldCount,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  };
}

function isValidId(value: unknown): value is string {
  return typeof value === 'string' && FORM_ID_PATTERN.test(value);
}

export interface SchemaValidationError {
  field: 'schema' | 'id' | 'size';
  message: string;
}

export function validateSchemaPayload(
  input: unknown,
): { ok: true; schema: FormSchema } | { ok: false; error: SchemaValidationError } {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: { field: 'schema', message: 'Schema body is required.' } };
  }

  const serialized = JSON.stringify(input);
  if (serialized.length > MAX_SCHEMA_BYTES) {
    return { ok: false, error: { field: 'size', message: 'Schema exceeds 256KB limit.' } };
  }

  try {
    const parsed = parseFormSchema(input) as FormSchema;
    if (!isValidId(parsed.id)) {
      return { ok: false, error: { field: 'id', message: 'Schema id must be slug-safe.' } };
    }
    return { ok: true, schema: parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Schema failed validation.';
    return { ok: false, error: { field: 'schema', message } };
  }
}

export function listSchemas(): SchemaSummary[] {
  return Array.from(getStore().values())
    .map(summarize)
    .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
}

export function getSchema(id: string): StoredSchema | null {
  if (!isValidId(id)) return null;
  return getStore().get(id) ?? null;
}

function uniqueId(base: string): string {
  const store = getStore();
  if (!store.has(base)) return base;
  let counter = 2;
  while (store.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

export function createSchema(schema: FormSchema): StoredSchema {
  const id = uniqueId(schema.id);
  const now = new Date().toISOString();
  const stored: StoredSchema = {
    id,
    title: schema.title ?? id,
    schema: { ...schema, id },
    createdAt: now,
    updatedAt: now,
  };
  getStore().set(id, stored);
  return stored;
}

export function updateSchema(
  id: string,
  schema: FormSchema,
): { ok: true; stored: StoredSchema } | { ok: false; reason: 'not-found' | 'id-mismatch' } {
  if (!isValidId(id)) return { ok: false, reason: 'not-found' };
  const store = getStore();
  const existing = store.get(id);
  if (!existing) return { ok: false, reason: 'not-found' };
  if (schema.id !== id) return { ok: false, reason: 'id-mismatch' };

  const next: StoredSchema = {
    ...existing,
    title: schema.title ?? existing.title,
    schema,
    updatedAt: new Date().toISOString(),
  };
  store.set(id, next);
  return { ok: true, stored: next };
}

export function deleteSchema(id: string): boolean {
  if (!isValidId(id)) return false;
  return getStore().delete(id);
}

export function resetSchemaStoreForTesting(): void {
  getStore().clear();
}
