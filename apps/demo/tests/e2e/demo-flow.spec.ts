import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

test.describe('demo flow route', () => {
  test('renders first step and allows basic navigation shell', async ({ page }) => {
    await page.goto(routes.demo);

    await expect(page.getByRole('heading', { name: /how much funding do you need/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue|next step/i })).toBeVisible();
  });

  test('accepts alternate layout through query string', async ({ page }) => {
    await page.goto(`${routes.demo}?layout=centered`);

    await expect(page.getByRole('heading', { name: /how much funding do you need/i })).toBeVisible();
  });
});
