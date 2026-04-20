import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

test.describe('analytics dashboard', () => {
  test('renders analytics panels and overview metrics', async ({ page }) => {
    await page.goto(routes.analytics);

    await expect(page.getByRole('heading', { name: /live submission telemetry/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /submissions by source/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /submissions by form/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /recent submissions/i })).toBeVisible();

    await expect(page.getByRole('link', { name: /open demo flow/i })).toHaveAttribute(
      'href',
      '/demo',
    );
    await expect(page.getByRole('link', { name: /open embed flow/i })).toHaveAttribute(
      'href',
      '/embed/education-loan',
    );
  });

  test('exposes filter controls and applies query defaults', async ({ page }) => {
    await page.goto(`${routes.analytics}?source=embed&window=7d&kycDecision=approved`);

    await expect(page.locator('#analytics-source-filter')).toHaveValue('embed');
    await expect(page.locator('#analytics-form-filter')).toHaveValue('all');
    await expect(page.locator('#analytics-kyc-filter')).toHaveValue('approved');
    await expect(page.getByRole('link', { name: /last 7 days/i })).toHaveClass(
      /ff-analytics-filter-chip-active/,
    );
  });
});
