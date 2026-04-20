import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';
import { schemaTextarea } from './utils/selectors';

test.describe('playground condition builder', () => {
  test('applies a showIf to a field and updates the schema JSON', async ({ page }) => {
    await page.goto(routes.playground);
    await expect(page.locator('.ff-playground-page')).toHaveAttribute('data-ready', 'true');

    const targetSelect = page.getByLabel('Target');
    await targetSelect.selectOption('field:loan.purpose');

    const fieldSelect = page.locator('#ff-cb-row-0-field');
    await fieldSelect.selectOption('loan.amount');

    const operatorSelect = page.locator('#ff-cb-row-0-operator');
    await operatorSelect.selectOption('exists');

    await page.getByRole('button', { name: /apply to schema/i }).click();

    const editorValue = await schemaTextarea(page).inputValue();
    const parsed = JSON.parse(editorValue) as {
      steps: Array<{ fields: Array<{ key: string; showIf?: { field: string; operator: string } }> }>;
    };
    const loanPurpose = parsed.steps
      .flatMap((step) => step.fields)
      .find((field) => field.key === 'loan.purpose');

    expect(loanPurpose?.showIf).toEqual({
      field: 'loan.amount',
      operator: 'exists',
    });
    await expect(page.locator('.ff-schema-status.ff-schema-valid')).toContainText(
      /schema is valid/i,
    );
  });

  test('removes an existing showIf from a target', async ({ page }) => {
    await page.goto(routes.playground);
    await expect(page.locator('.ff-playground-page')).toHaveAttribute('data-ready', 'true');

    await page.getByRole('tab', { name: /feedback survey/i }).click();

    const targetSelect = page.getByLabel('Target');
    await targetSelect.selectOption('field:issues.details');

    await page.getByRole('button', { name: /remove showIf/i }).click();

    const editorValue = await schemaTextarea(page).inputValue();
    const parsed = JSON.parse(editorValue) as {
      steps: Array<{ fields: Array<{ key: string; showIf?: unknown }> }>;
    };
    const details = parsed.steps
      .flatMap((step) => step.fields)
      .find((field) => field.key === 'issues.details');

    expect(details?.showIf).toBeUndefined();
    await expect(page.locator('.ff-schema-status.ff-schema-valid')).toContainText(
      /schema is valid/i,
    );
  });
});
