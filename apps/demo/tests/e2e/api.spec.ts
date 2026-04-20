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

  test('returns analytics overview with submission counts', async ({ request, baseURL }) => {
    await request.post(`${baseURL}${routes.apiSubmissions}`, {
      data: {
        formId: 'education-loan',
        source: 'demo',
        payload: {
          loanAmount: 5000,
          firstName: 'Alex',
        },
      },
    });

    await request.post(`${baseURL}${routes.apiSubmissions}`, {
      data: {
        formId: 'education-loan',
        source: 'embed',
        payload: {
          loanAmount: 8000,
        },
      },
    });

    const response = await request.get(`${baseURL}${routes.apiAnalyticsOverview}`);
    expect(response.ok()).toBeTruthy();

    const json = (await response.json()) as {
      totalSubmissions: number;
      sources: Array<{ source: string; count: number }>;
      forms: Array<{ formId: string; count: number }>;
      recentSubmissions: Array<{ formId: string; source: string }>;
    };

    expect(json.totalSubmissions).toBeGreaterThanOrEqual(2);
    expect(
      json.sources.some((entry) => entry.source === 'demo' && entry.count >= 1),
    ).toBeTruthy();
    expect(
      json.sources.some((entry) => entry.source === 'embed' && entry.count >= 1),
    ).toBeTruthy();
    expect(
      json.forms.some((entry) => entry.formId === 'education-loan' && entry.count >= 2),
    ).toBeTruthy();
    expect(
      json.recentSubmissions.some(
        (entry) => entry.formId === 'education-loan' && (entry.source === 'demo' || entry.source === 'embed'),
      ),
    ).toBeTruthy();
  });
});
