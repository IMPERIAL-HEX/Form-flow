import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';
import { testData } from './fixtures/test-data';
import { patchSchemaTitle, replaceSchemaText } from './utils/schema-editor';
import { schemaTextarea } from './utils/selectors';

test.describe('playground route', () => {
  test('shows parser error for invalid JSON', async ({ page }) => {
    await page.goto(routes.playground);
    await expect(page.locator('.ff-playground-page')).toHaveAttribute('data-ready', 'true');

    await replaceSchemaText(page, '{ invalid json');
    await expect(schemaTextarea(page)).toHaveValue('{ invalid json');
    await expect(page.locator('.ff-schema-status.ff-schema-error')).toContainText(
      /unable to parse schema|expected|json/i,
      {
        timeout: 15_000,
      },
    );
  });

  test('re-renders with updated title when schema is edited', async ({ page }) => {
    await page.goto(routes.playground);
    await expect(page.locator('.ff-playground-page')).toHaveAttribute('data-ready', 'true');

    await patchSchemaTitle(page, testData.schemaReplacementTitle);
    await expect(schemaTextarea(page)).toHaveValue(
      new RegExp(`"title":\\s*"${testData.schemaReplacementTitle}"`),
    );
    await expect(page.getByRole('status')).toContainText(/schema is valid/i);
  });
});
