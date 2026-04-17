import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

test.describe('home page docs sections', () => {
  test('renders key sections and links', async ({ page }) => {
    await page.goto(routes.home);

    await expect(
      page.getByRole('heading', { name: /multi-step application forms/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /define, render, and submit/i })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /interact with a production-like/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /engineering choices optimized for real product delivery/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /core field primitives/i })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /frequently asked implementation questions/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /current project delivery state/i })).toBeVisible();

    await expect(page.getByRole('link', { name: /open full demo/i })).toHaveAttribute(
      'href',
      '/demo',
    );
    await expect(page.getByRole('link', { name: /open playground/i })).toHaveAttribute(
      'href',
      '/playground',
    );
    await expect(page.getByRole('link', { name: /embed endpoint/i })).toHaveAttribute(
      'href',
      '/embed/education-loan',
    );
  });
});
