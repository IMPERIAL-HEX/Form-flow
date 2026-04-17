import type { Page } from '@playwright/test';

export async function waitForAppStable(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
}

export async function clickButtonByText(page: Page, text: string): Promise<void> {
  await page.getByRole('button', { name: text }).click();
}
