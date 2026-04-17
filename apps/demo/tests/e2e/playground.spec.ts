import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';
import { testData } from './fixtures/test-data';
import { patchSchemaTitle, replaceSchemaText } from './utils/schema-editor';
import { schemaTextarea } from './utils/selectors';

test.describe('playground route', () => {
  test('shows parser error for invalid JSON', async ({ page }) => {
    await page.goto(routes.playground);

    await replaceSchemaText(page, '{ invalid json');
    await expect(page.getByRole('alert')).toContainText(/unable to parse schema|expected/i);
  });

  test('re-renders with updated title when schema is edited', async ({ page }) => {
    await page.goto(routes.playground);

    await patchSchemaTitle(page, testData.schemaReplacementTitle);
    await expect(schemaTextarea(page)).toContainText(testData.schemaReplacementTitle);
    await expect(page.getByRole('status')).toContainText(/schema is valid/i);
  });
});
