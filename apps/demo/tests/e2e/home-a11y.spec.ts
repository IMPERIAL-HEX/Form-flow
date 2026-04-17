import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

test.describe('home accessibility basics', () => {
  test('supports skip link navigation to main content', async ({ page }) => {
    await page.goto(routes.home);

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeVisible();

    await skipLink.press('Enter');
    await expect(page.locator('#home-main')).toBeInViewport();
  });
});
