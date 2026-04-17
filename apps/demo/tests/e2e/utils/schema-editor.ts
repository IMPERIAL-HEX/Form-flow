import type { Page } from '@playwright/test';

import { schemaTextarea } from './selectors';

export async function replaceSchemaText(page: Page, source: string): Promise<void> {
  const editor = schemaTextarea(page);
  await editor.fill('');
  await editor.fill(source);
}

export async function patchSchemaTitle(page: Page, nextTitle: string): Promise<void> {
  const editor = schemaTextarea(page);
  const value = await editor.inputValue();
  const updated = value.replace(
    /"title":\s*"Education Loan Application"/,
    `"title": "${nextTitle}"`,
  );

  await editor.fill('');
  await editor.fill(updated);
}
