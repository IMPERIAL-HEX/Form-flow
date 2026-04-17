import type { Page } from '@playwright/test';

export function firstHeading(page: Page) {
  return page.getByRole('heading').first();
}

export function payloadPanel(page: Page) {
  return page.getByRole('heading', { name: /submission payload/i });
}

export function schemaTextarea(page: Page) {
  return page.getByRole('textbox', { name: /schema json/i });
}
