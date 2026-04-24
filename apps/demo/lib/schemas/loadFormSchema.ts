import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { parseFormSchema, type FormSchema } from '@formflow/core';

import { getSchema } from '@/lib/builder/schemaStore';

const FORM_ID_PATTERN = /^[a-zA-Z0-9-]+$/;

export function sanitizeFormId(raw: string): string | null {
  const trimmed = raw.trim();

  if (!FORM_ID_PATTERN.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export async function loadFormSchema(formId: string): Promise<Readonly<FormSchema> | null> {
  const safeId = sanitizeFormId(formId);

  if (!safeId) {
    return null;
  }

  const stored = getSchema(safeId);
  if (stored) {
    return stored.schema;
  }

  const schemaPath = path.join(process.cwd(), 'schemas', `${safeId}.json`);

  try {
    const source = await fs.readFile(schemaPath, 'utf8');
    return parseFormSchema(JSON.parse(source));
  } catch {
    return null;
  }
}
