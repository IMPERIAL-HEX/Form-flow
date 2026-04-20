import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

test.describe('visual builder route', () => {
  test('renders builder shell with default step and field', async ({ page }) => {
    await page.goto(routes.builder);
    await expect(page.locator('.ff-builder-page')).toHaveAttribute('data-ready', 'true');

    await expect(page.getByRole('heading', { name: /^Steps$/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Add field$/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Properties$/ })).toBeVisible();

    await expect(page.getByRole('heading', { level: 3, name: /Step properties/i })).toBeVisible();
  });

  test('adds a field from the palette and exposes its editor', async ({ page }) => {
    await page.goto(routes.builder);
    await expect(page.locator('.ff-builder-page')).toHaveAttribute('data-ready', 'true');

    await page.getByRole('button', { name: 'Select', exact: true }).click();
    await expect(
      page.getByRole('heading', { level: 3, name: /Select field/i }),
    ).toBeVisible();

    const optionsLegend = page.getByText('Options', { exact: true });
    await expect(optionsLegend).toBeVisible();
  });

  test('opens and closes the preview drawer', async ({ page }) => {
    await page.goto(routes.builder);
    await expect(page.locator('.ff-builder-page')).toHaveAttribute('data-ready', 'true');

    await page.getByRole('button', { name: 'Preview' }).click();
    const dialog = page.getByRole('dialog', { name: /Form preview/i });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: /Close preview/i }).click();
    await expect(dialog).toBeHidden();
  });
});
