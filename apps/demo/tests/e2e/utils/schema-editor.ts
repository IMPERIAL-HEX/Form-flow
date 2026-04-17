import type { Page } from '@playwright/test';

import { schemaTextarea } from './selectors';

export async function replaceSchemaText(page: Page, source: string): Promise<void> {
  const editor = schemaTextarea(page);
  await editor.fill(source);
}

export async function patchSchemaTitle(page: Page, nextTitle: string): Promise<void> {
  const editor = schemaTextarea(page);
  const value = await editor.inputValue();

  let updated = value;

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    parsed.title = nextTitle;
    updated = `${JSON.stringify(parsed, null, 2)}\n`;
  } catch {
    updated = value.replace(/"title":\s*"[^"]*"/, `"title": "${nextTitle}"`);
  }

  await editor.fill(updated);
}
