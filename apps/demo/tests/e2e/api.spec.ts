import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

test.describe('api routes', () => {
  test('returns education-loan schema', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${routes.apiFormEducationLoan}`);

    expect(response.ok()).toBeTruthy();

    const json = (await response.json()) as { id: string; steps: unknown[] };
    expect(json.id).toBe('education-loan');
    expect(Array.isArray(json.steps)).toBeTruthy();
  });

  test('returns not found for unknown schema', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${routes.apiFormMissing}`);

    expect(response.status()).toBe(404);
  });

  test('accepts submission payload', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${routes.apiSubmissions}`, {
      data: {
        sample: true,
        source: 'e2e',
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = (await response.json()) as { success: boolean; id: string };
    expect(json.success).toBeTruthy();
    expect(typeof json.id).toBe('string');
  });
});
