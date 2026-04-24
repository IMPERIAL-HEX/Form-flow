import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

async function createSchemaThroughApi(
  request: import('@playwright/test').APIRequestContext,
  baseURL: string,
): Promise<string> {
  const response = await request.post(`${baseURL}${routes.apiBuilderSchemas}`, {
    data: {
      id: 'e2e-form',
      version: '1.0.0',
      title: 'E2E Form',
      layout: { template: 'top-stepper' },
      submission: { endpoint: '/api/submissions', method: 'POST', transformKeys: true },
      steps: [
        {
          id: 'step-1',
          title: 'Step 1',
          fields: [
            { type: 'text', key: 'name', label: 'Name' },
          ],
        },
      ],
    },
  });
  expect(response.status()).toBe(201);
  const body = (await response.json()) as { stored: { id: string } };
  return body.stored.id;
}

test.describe('builder list and editor', () => {
  test('builder list shows New form and a created schema renders', async ({ page, request, baseURL }) => {
    const id = await createSchemaThroughApi(request, baseURL ?? '');

    await page.goto(routes.builder);
    await expect(page.getByRole('heading', { name: /my forms/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'E2E Form' })).toBeVisible();

    await page.getByRole('link', { name: 'E2E Form' }).click();
    await expect(page.locator('.ff-builder-page')).toHaveAttribute('data-ready', 'true');
    await expect(page.getByRole('heading', { name: /^Steps$/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Add field$/ })).toBeVisible();

    // cleanup
    const cleanup = await request.delete(`${baseURL}${routes.apiBuilderSchemas}/${id}`);
    expect(cleanup.ok()).toBeTruthy();
  });

  test('saving an edited field updates the saved schema', async ({ page, request, baseURL }) => {
    const id = await createSchemaThroughApi(request, baseURL ?? '');

    await page.goto(`${routes.builder}/${id}`);
    await expect(page.locator('.ff-builder-page')).toHaveAttribute('data-ready', 'true');

    const titleInput = page.getByLabel('Form title');
    await titleInput.fill('Renamed Form');
    await expect(page.locator('.ff-builder-status-dirty')).toBeVisible();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.locator('.ff-builder-status').first()).toContainText(/Saved|All changes saved/i);

    const fetched = await request.get(`${baseURL}${routes.apiBuilderSchemas}/${id}`);
    const body = (await fetched.json()) as { stored: { title: string } };
    expect(body.stored.title).toBe('Renamed Form');

    await request.delete(`${baseURL}${routes.apiBuilderSchemas}/${id}`);
  });

  test('saved schema resolves through /demo?form=<id>', async ({ page, request, baseURL }) => {
    const id = await createSchemaThroughApi(request, baseURL ?? '');

    await page.goto(`/demo?form=${id}`);
    await expect(page.getByLabel('Name')).toBeVisible();

    await request.delete(`${baseURL}${routes.apiBuilderSchemas}/${id}`);
  });
});

test.describe('builder-schemas api', () => {
  test('rejects unknown id on read', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${routes.apiBuilderSchemas}/does-not-exist`);
    expect(response.status()).toBe(404);
  });

  test('rejects malformed payload on create', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${routes.apiBuilderSchemas}`, {
      data: { nope: true },
    });
    expect(response.status()).toBe(400);
  });
});
