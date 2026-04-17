import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

test.describe('embed route', () => {
  test('renders existing schema', async ({ page }) => {
    await page.goto(routes.embedEducationLoan);

    await expect(
      page.getByRole('heading', { name: /how much funding do you need/i }),
    ).toBeVisible();
  });

  test('shows not-found message for unknown schema', async ({ page }) => {
    await page.goto('/embed/does-not-exist');

    await expect(page.getByRole('heading', { name: /schema not found/i })).toBeVisible();
  });
});
