import { parseFormSchema, type FormSchema } from '@formflow/core';

export interface SchemaParseResult {
  schema: FormSchema | null;
  error: string | null;
}

export function prettyPrintSchema(schema: FormSchema): string {
  return `${JSON.stringify(schema, null, 2)}\n`;
}

export function parseSchemaText(value: string): SchemaParseResult {
  try {
    const raw = JSON.parse(value);
    const schema = parseFormSchema(raw) as FormSchema;

    return {
      schema,
      error: null,
    };
  } catch (error) {
    return {
      schema: null,
      error: error instanceof Error ? error.message : 'Unable to parse schema.',
    };
  }
}
