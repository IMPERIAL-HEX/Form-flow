import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';
import { firstHeading } from './utils/selectors';

test('application boots on home route', async ({ page }) => {
  await page.goto(routes.home);
  await expect(firstHeading(page)).toBeVisible();
});
